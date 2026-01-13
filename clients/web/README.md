# Web Client

React + TypeScript + Vite frontend for Auction Chess, deployed to Cloudflare Workers/Pages.

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: TanStack Router (file-based routing)
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context API + TanStack Router Context
- **API Client**: Hono RPC Client (type-safe)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime (WebSockets)
- **Deployment**: Cloudflare Workers/Pages

## Development

### Prerequisites

- Bun v1.2.16+
- Local Supabase instance running (see `/supabase/README.md`)
- Backend server running (see `/server/README.md`)

### Setup

```bash
# From root directory
bun install

# Or from this directory
cd clients/web
bun install
```

### Environment Variables

Create `.env.development` (already exists):

```env
VITE_SUPABASE_PUB_KEY=<your-local-supabase-anon-key>
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_BACKEND_URL=http://localhost:8000
```

**Where to get values:**

- `VITE_SUPABASE_PUB_KEY`: Run `supabase start` and copy the `anon key` from output
- `VITE_SUPABASE_URL`: Local Supabase API URL (default: http://127.0.0.1:54321)
- `VITE_BACKEND_URL`: Local backend server URL (default: http://localhost:8000)

Create `.env.production` for production builds:

```env
VITE_SUPABASE_PUB_KEY=<your-production-supabase-anon-key>
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_BACKEND_URL=https://<your-app>.ondigitalocean.app
```

**⚠️ Critical**: Environment variables are baked into the build at build time, not runtime. Changing `.env.production` requires rebuilding.

### Running Development Server

```bash
# From root
bun run client:dev

# Or from this directory
bun run dev
```

Runs at `http://localhost:3000`

### Building for Production

```bash
# From root
bun run client:build

# Or from this directory
bun run build
```

Build output goes to `dist/`

**Build process:**

1. TypeScript type checking (`tsc -b`)
2. Vite production build
3. Assets optimized and bundled

### Preview Production Build

```bash
# From this directory
bun run preview
```

Runs at `http://localhost:4173`

## Project Structure

```
clients/web/
├── src/
│   ├── components/         # React components
│   │   ├── providers/      # Context providers
│   │   ├── ui/             # shadcn/ui components
│   │   └── ...             # Custom UI components
│   ├── routes/             # TanStack Router file-based routes
│   │   ├── __root.tsx      # Root layout with RouterContext
│   │   ├── index.tsx       # Home/splash page (/)
│   │   ├── _auth/          # Protected routes (require auth + profile)
│   │   │   ├── route.tsx   # Layout route with auth guard
│   │   │   ├── lobbies.tsx # Lobbies page (/lobbies)
│   │   │   └── profile.*.tsx # Profile pages
│   │   ├── auth/           # Authentication routes
│   │   │   ├── index.tsx   # Sign in/up page (/auth)
│   │   │   └── create-profile.tsx # Profile creation
│   │   ├── -types.ts       # Shared route types
│   │   └── routeTree.gen.ts # Auto-generated route tree
│   ├── pages/              # Reusable page components
│   ├── services/           # API services
│   │   ├── api.ts          # Hono RPC client
│   │   └── utils.ts        # API utilities
│   ├── contexts/           # React contexts
│   ├── supabase.ts         # Supabase client setup
│   ├── App.tsx             # Root component with router
│   └── main.tsx            # Entry point
├── public/                 # Static assets
├── .env.development        # Local environment variables
├── .env.production         # Production environment variables
├── vite.config.ts          # Vite configuration
├── wrangler.toml           # Cloudflare Workers config
└── package.json
```

## Key Features

### Authentication Flow

1. **Splash Page** (`/`) - Landing page with "Get Started" button
2. **Auth Page** (`/auth`) - Sign in/up with email/password or Google OAuth
3. **Create Profile** (`/auth/create-profile`) - First-time user onboarding
4. **Lobbies** (`/lobbies`) - Game lobby list (main app)

**Route Protection**: Uses TanStack Router's `beforeLoad` hooks for route guards:

- `/` - Unauthenticated users only (redirects to `/lobbies` if authenticated)
- `/auth` - Unauthenticated routes (sign in/up)
- `/auth/create-profile` - Authenticated users without a profile
- `/_auth/*` - Protected routes requiring both authentication and profile
- Route guards check `RouterContext` (auth session + user profile) and throw `redirect()` when requirements aren't met

### State Management

Uses **TanStack Router Context** combined with React Context API:

- **RouterContext** (`routes/__root.tsx`) - Auth and profile state passed to all routes
- **AuthContext** (`components/providers/AuthContextProvider.tsx`) - Supabase auth session management
- **UserProfileContext** (`components/providers/UserProfileContextProvider.tsx`) - User profile data

The router context provides type-safe access to auth and profile state in route components via `beforeLoad` hooks and component props.

### API Integration

Uses Hono RPC client for type-safe API calls:

```typescript
// src/services/api.ts
import { hc } from "hono/client";
import type { AppType } from "server/app"; // Shared types

const client = hc<AppType>(BACKEND_URL);

// Type-safe API calls
const response = await client.api.lobbies.$get();
const data = await response.json();
```

**Benefits**:

- End-to-end type safety
- Autocomplete for API endpoints
- Compile-time error checking

### Real-time Features

Uses Supabase Realtime for live game updates:

```typescript
// Subscribe to lobby updates
const channel = supabase.channel(`lobby:${lobbyCode}`);
channel
  .on("broadcast", { event: "lobby-update" }, (payload) => {
    // Handle real-time updates
  })
  .subscribe();
```

## Cloudflare Deployment

### Configuration

Deployment is configured in `wrangler.toml`:

```toml
name = "<your-app-name>"
compatibility_date = "2025-12-22"
assets = { not_found_handling = "single-page-application" }
workers_dev = true

[[routes]]
pattern = "<your-domain>.com"
custom_domain = true
```

**SPA Mode**: `not_found_handling = "single-page-application"` ensures TanStack Router handles all routes client-side.

### Deploying

```bash
# From root (recommended)
bun run deploy:client

# Or manually
cd clients/web
bun run build
wrangler deploy
```

**Deployment process:**

1. Git-based: Squash merges `main` → `prod/client` branch
2. Cloudflare Pages watches `prod/client` and auto-deploys
3. Build happens on Cloudflare's infrastructure

See `/DEPLOYMENT.md` for detailed deployment instructions.

### Environment Variables in Production

**⚠️ Important**: Cloudflare Workers get environment variables at **build time**, not runtime.

- Variables are embedded during `vite build`
- To change variables, you must rebuild and redeploy
- Always verify `.env.production` before building

### Custom Domain Setup

1. Add domain to Cloudflare (Dashboard → Websites)
2. Configure DNS records
3. Update `wrangler.toml` with your domain
4. Update Supabase auth redirects in `/supabase/config.toml`:

```toml
site_url = "https://<your-domain>.com"
additional_redirect_urls = ["http://localhost:3000", "http://localhost:4173"]
```

## Common Tasks

### Adding a New Route

TanStack Router uses **file-based routing**. Routes are automatically generated from files in `src/routes/`.

**Example: Add a public route**

1. Create route file `src/routes/about.tsx`:

```typescript
import { createFileRoute } from '@tanstack/router-router'

export const Route = createFileRoute('/about')({
  component: AboutComponent,
})

function AboutComponent() {
  return <div>About Page</div>
}
```

**Example: Add a protected route**

2. Create route file `src/routes/_auth/game.tsx`:

```typescript
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/game')({
  component: GameComponent,
})

function GameComponent() {
  // This route is automatically protected by the _auth layout route
  return <div>Game Page</div>
}
```

3. Add navigation link:

```typescript
import { Link } from '@tanstack/react-router'

<Link to="/game">Go to Game</Link>
```

**Notes:**

- Routes in `_auth/` are automatically protected (require auth + profile)
- `routeTree.gen.ts` is auto-generated - don't edit it manually
- Use `beforeLoad` hooks for custom route guards
- File structure mirrors URL structure (e.g., `_auth/game.tsx` → `/game`)

### Calling a Backend API

1. Ensure endpoint exists in backend (see `/server/README.md`)

2. Use Hono RPC client:

```typescript
import { useBackend } from "../services/api";

function MyComponent() {
  const client = useBackend();

  const fetchData = async () => {
    const res = await client.api.endpoint.$get();
    const data = await res.json();
    return data;
  };
}
```

### Using Supabase Auth

```typescript
import { supabase } from "../supabase";

// Sign in with Google
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: "google"
});

// Sign out
await supabase.auth.signOut();

// Get current user
const { data: { user } } = await supabase.auth.getUser();
```

### Adding Real-time Features

```typescript
import { supabase } from "../supabase";

// Subscribe to channel
const channel = supabase.channel("my-channel");

channel
  .on("broadcast", { event: "my-event" }, (payload) => {
    console.log("Received:", payload);
  })
  .subscribe();

// Send broadcast
channel.send({
  type: "broadcast",
  event: "my-event",
  payload: { message: "Hello!" }
});

// Cleanup
return () => {
  supabase.removeChannel(channel);
};
```

## TypeScript Configuration

Uses Vite's dual-config pattern:

- **tsconfig.app.json** - Application code (browser environment)
  - Extends root config
  - Adds DOM libs
  - Enables JSX (React)

- **tsconfig.node.json** - Build tools (Node environment)
  - Extends root config
  - Adds Node libs

**Strict mode enabled:**

- Unused variables are errors
- Unused parameters are errors
- All strict type checks enabled

## Testing

_Note: Testing infrastructure not yet set up_

Planned:

- Vitest for unit tests
- React Testing Library for component tests
- Playwright for E2E tests

## Linting

```bash
bun run lint       # Check for issues
bun run lint:fix   # Auto-fix issues
```

ESLint configured with:

- TypeScript support
- React hooks rules
- Import sorting

## Build Optimization

Vite automatically:

- Code splits by route
- Minifies JavaScript
- Optimizes assets
- Generates source maps

**Bundle analysis:**

```bash
bun run build -- --mode analyze
```

## Troubleshooting

### Build Fails with TypeScript Errors

```bash
# Check errors
bun run build

# Common issues:
# - Unused imports (remove them)
# - Type mismatches (check API types)
# - Missing environment variables
```

### Blank Page in Production

1. Check browser console for errors
2. Verify `VITE_BACKEND_URL` is correct
3. Check network tab for CORS errors
4. Verify Supabase auth redirects are configured

### API Calls Fail

1. Check `VITE_BACKEND_URL` points to correct server
2. Verify backend is running and accessible
3. Check CORS headers on backend
4. Inspect network tab for error details

### OAuth Doesn't Work

1. Verify Google OAuth credentials in Google Cloud Console
2. Check authorized redirect URIs include your domain
3. Verify Supabase `config.toml` has correct `site_url`
4. Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUB_KEY`

### Hot Reload Not Working

```bash
# Restart dev server
bun run dev

# Clear Vite cache
rm -rf node_modules/.vite
bun run dev
```

## Performance

- **Lighthouse Score**: Target 90+ for all metrics
- **Bundle Size**: ~500KB (gzipped)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s

## Links

- **Main README**: `/README.md`
- **Deployment Guide**: `/DEPLOYMENT.md`
- **Backend README**: `/server/README.md`
- **Database README**: `/supabase/README.md`
- **Cloudflare Docs**: https://developers.cloudflare.com/workers/
- **Vite Docs**: https://vitejs.dev/
- **TanStack Router Docs**: https://tanstack.com/router/

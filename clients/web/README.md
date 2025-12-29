# Web Client

React + TypeScript + Vite frontend for Auction Chess, deployed to Cloudflare Workers/Pages.

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: CSS Modules / Styled Components
- **State Management**: React Context API
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
│   │   └── ...             # UI components
│   ├── pages/              # Page components (routes)
│   │   ├── Splash.tsx      # Landing page
│   │   ├── Auth.tsx        # Authentication
│   │   ├── CreateProfile.tsx
│   │   ├── Lobbies.tsx     # Lobby list
│   │   └── Lobby.tsx       # Game lobby
│   ├── services/           # API services
│   │   ├── api.ts          # Hono RPC client
│   │   └── utils.ts        # API utilities
│   ├── supabase.ts         # Supabase client setup
│   ├── App.tsx             # Root component
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

1. **Splash Page** (`/`) - Landing page with login button
2. **Auth Page** (`/auth`) - Google OAuth via Supabase
3. **Create Profile** (`/create-profile`) - First-time user onboarding
4. **Lobbies** (`/lobbies`) - Game lobby list (main app)

**Route Protection**: `OnboardingGuard` component enforces authentication state:
- `unauthed` - Only accessible when not logged in
- `createProfile` - Only accessible when authenticated but no profile
- `complete` - Only accessible when authenticated with profile

### State Management

Uses React Context API for global state:

- **AuthContext** (`components/providers/AuthContext.tsx`) - Supabase auth state
- **UserProfileContext** (`components/providers/UserProfileContext.tsx`) - User profile data

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

**SPA Mode**: `not_found_handling = "single-page-application"` ensures React Router handles all routes.

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

### Adding a New Page

1. Create component in `src/pages/`:
```typescript
// src/pages/NewPage.tsx
export function NewPage() {
  return <div>New Page</div>;
}
```

2. Add route in `src/App.tsx`:
```typescript
<Route path="/new-page" element={<NewPage />} />
```

3. Add navigation link:
```typescript
<Link to="/new-page">Go to New Page</Link>
```

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

*Note: Testing infrastructure not yet set up*

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
- **React Router Docs**: https://reactrouter.com/

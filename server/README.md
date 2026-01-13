# Backend Server

Bun + Hono API server for Auction Chess, deployed to Digital Ocean App Platform.

## Tech Stack

- **Runtime**: Bun (native TypeScript execution)
- **Framework**: Hono (fast, lightweight web framework)
- **Database**: Supabase (PostgreSQL)
- **Validation**: Zod schemas (from `shared` package)
- **Authentication**: Supabase Auth (JWT validation)
- **Deployment**: Digital Ocean App Platform

## Development

### Prerequisites

- Bun v1.2.16+
- Local Supabase instance running (see `/supabase/README.md`)

### Setup

```bash
# From root directory
bun install

# Or from this directory
cd server
bun install
```

### Environment Variables

Create `.env.development` (already exists):

```env
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=<your-local-service-role-key>
```

**Where to get values:**

- `SUPABASE_URL`: Local Supabase API URL
- `SUPABASE_SERVICE_ROLE_KEY`: Run `supabase start` and copy the `service_role key` from output

Create `.env.production`:

```env
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-production-service-role-key>
```

**⚠️ Critical**: Never commit service role keys to git. Set in DO dashboard as encrypted variable.

### Running Development Server

```bash
# From root
bun run server:dev

# Or from this directory
bun run dev
```

Runs at `http://localhost:8000` with hot reload.

### Building

```bash
# From root
bun run server:build

# Or from this directory
bun run build
```

Output goes to `./out/`

### Running Production Build

```bash
# With local environment
bun run start:local

# With production environment
bun run start:prod

# Without environment file
bun run start
```

## Project Structure

```
server/
├── app.ts               # Main Hono app setup
├── index.ts             # Entry point
├── routes/              # API route handlers
│   ├── lobbies.ts       # Lobby endpoints
│   ├── profiles.ts      # Profile endpoints
│   └── ...
├── middleware/          # Custom middleware
│   ├── auth.ts          # JWT validation
│   ├── cors.ts          # CORS headers
│   └── ...
├── utils.ts             # Utility functions
├── .env.development     # Local environment
├── .env.production      # Production environment
└── package.json
```

## API Architecture

### Hono Framework

Fast, lightweight web framework for Bun:

```typescript
import { Hono } from "hono";

const app = new Hono();

app.get("/api/health", (c) => {
  return c.json({ status: "ok" });
});

export default app;
```

### Type-Safe RPC

Frontend uses Hono RPC client for end-to-end type safety:

```typescript
// server/app.ts
export type AppType = typeof app;

// clients/web/src/services/api.ts
import { hc } from "hono/client";
import type { AppType } from "server/app";

const client = hc<AppType>(BACKEND_URL);
const response = await client.api.lobbies.$get();
```

### Request Validation

Uses Zod schemas from `shared` package:

```typescript
import { zValidator } from "@hono/zod-validator";
import { CreateLobbySchema } from "shared";

app.post("/api/lobbies", zValidator("json", CreateLobbySchema), async (c) => {
  const data = c.req.valid("json"); // Fully typed!
  // Handle request
  return c.json({ success: true });
});
```

### Authentication Middleware

<!-- TODO: This is no longer true. We use shared signing keys to validate. -->

JWT validation using Supabase:

```typescript
// middleware/auth.ts
export const validateAuth = async (c, next) => {
  const token = c.req.header("Authorization")?.replace("Bearer ", "");
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("user", user);
  await next();
};

// Usage
app.get("/api/protected", validateAuth, (c) => {
  const user = c.get("user");
  return c.json({ userId: user.id });
});
```

### CORS Configuration

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // TODO: Restrict in production
  "Access-Control-Allow-Headers": [
    "authorization",
    "x-client-info",
    "apikey",
    "content-type",
  ],
};

app.use("*", cors(corsHeaders));
```

**⚠️ Production**: Change `*` to specific frontend domain.

## Digital Ocean Deployment

### Initial Setup

1. **Create App** in Digital Ocean dashboard:
   - Source: GitHub repository
   - Branch: `prod/server`
   - Source Directory: `/server`
   - Runtime: Bun

2. **Configure Build**:
   - Build Command: `bun install && bun run build`
   - Run Command: `bun run start:prod`
   - HTTP Port: `8000`

3. **Set Environment Variables** in DO dashboard:
   - `SUPABASE_URL` = `https://<your-project>.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = `<your-key>` (encrypted)

### Deploying

```bash
# From root (recommended)
bun run deploy:server

# Custom commit message
./scripts/deploy-server.sh "Deploy API v2.0"
```

**Process:**

1. Squash merges `main` → `prod/server`
2. Pushes to GitHub
3. Digital Ocean auto-deploys

See `/DEPLOYMENT.md` for details.

### Why Bun on Digital Ocean?

- **40% faster cold starts** vs Docker
- **Simpler deployment** (no Dockerfile)
- **Native TypeScript** (no transpilation)
- **Built-in performance** (Bun is fast!)

## Common Tasks

### Adding a New Endpoint

1. **Define schema** in `/shared/index.ts`:

```typescript
export const GameMoveSchema = z.object({
  from: z.string(),
  to: z.string(),
});
```

2. **Create route handler** in `routes/`:

```typescript
// routes/game.ts
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { GameMoveSchema } from "shared";

export const gameRoutes = new Hono();

gameRoutes.post("/move", zValidator("json", GameMoveSchema), async (c) => {
  const move = c.req.valid("json");
  // Handle move
  return c.json({ success: true });
});
```

3. **Register in app**:

```typescript
// app.ts
import { gameRoutes } from "./routes/game";

app.route("/api/game", gameRoutes);
```

### Querying Supabase

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Query
const { data, error } = await supabase
  .from("lobbies")
  .select("*")
  .eq("code", lobbyCode)
  .single();

// Insert
const { data, error } = await supabase
  .from("profiles")
  .insert({ username: "player1" })
  .select()
  .single();
```

### Using Supabase Realtime

```typescript
// Broadcast to channel
const channel = supabase.channel(`lobby:${code}`);
await channel.send({
  type: "broadcast",
  event: "lobby-update",
  payload: { state: newState },
});
```

## Testing

_Note: Testing not yet implemented_

Planned:

- Bun test for unit tests
- Supertest for API integration tests

## TypeScript Configuration

- Extends root `tsconfig.json`
- Adds `lib: ["ESNext"]`
- Strict mode enabled (unused vars/params are errors)
- Module resolution: `bundler` (for Bun)

## Troubleshooting

### Server Won't Start

```bash
# Check environment variables
cat .env.development

# Check Supabase is running
curl http://127.0.0.1:54321

# Check for port conflicts
lsof -i :8000
```

### Database Queries Fail

1. Verify `SUPABASE_URL` is correct
2. Check service role key has admin permissions
3. Verify Supabase project is active
4. Check RLS policies (service role bypasses RLS)

### CORS Errors from Frontend

1. Update `app.ts` CORS headers to allow frontend domain
2. Ensure preflight requests (OPTIONS) are handled
3. Check `Access-Control-Allow-Origin` header

### Build Fails

```bash
# Check TypeScript errors
bun run build

# Common issues:
# - Unused imports
# - Type mismatches
# - Missing shared package types
```

### Deployment Fails

1. Check DO build logs
2. Verify environment variables are set
3. Check `prod/server` branch exists
4. Verify build/run commands in DO dashboard

## Performance

- **Response Time**: Target < 100ms for API endpoints
- **Memory Usage**: ~50-100MB (Bun is lightweight)
- **Concurrent Connections**: Currently uses Supabase Realtime. Should scale.

## Security

- **JWT Validation**: All protected endpoints validate tokens
- **Service Role Key**: Never exposed to client (encrypted in DO)
- **RLS Policies**: Additional security layer in Supabase
- **CORS**: Restrict to production domain
- **Input Validation**: Zod schemas prevent malformed data

## Links

- **Main README**: `/README.md`
- **Deployment Guide**: `/DEPLOYMENT.md`
- **Frontend README**: `/clients/web/README.md`
- **Database README**: `/supabase/README.md`
- **Hono Docs**: https://hono.dev/
- **Bun Docs**: https://bun.sh/docs
- **Supabase JS Client**: https://supabase.com/docs/reference/javascript

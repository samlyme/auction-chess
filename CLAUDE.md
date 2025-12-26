# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Auction Chess is a multiplayer chess variant built with:

- **Frontend**: React + TypeScript + Vite (in `clients/web`)
- **Backend**: Hono API server running on Bun (in `server`)
- **Database**: Supabase (PostgreSQL) with local development support
- **Shared code**: Common types and database schema (in `shared`)
- **Deployment**: Git branch-based deployment to Cloudflare (client), Digital Ocean (server), and Supabase (database)

## Monorepo Structure

This is a Bun workspace with three main packages:

- `clients/web` - React web client deployed to Cloudflare Workers/Pages
- `server` - Hono API server deployed to Digital Ocean App Platform
- `shared` - Shared TypeScript types and Zod schemas

## Development Commands

### Root level

```bash
bun install              # Install all dependencies
bun run format          # Format all files with Prettier
bun run deploy:client   # Deploy frontend to Cloudflare
bun run deploy:server   # Deploy backend to Digital Ocean
bun run deploy:sb       # Deploy database to Supabase
```

### Web Client (`clients/web`)

```bash
cd clients/web
bun run dev             # Start dev server on port 3000
bun run build           # Build for production (runs tsc check + vite build)
bun run lint            # Run ESLint
bun run preview         # Preview production build
```

### Server (Bun version)

```bash
cd server
bun run dev             # Start server with watch mode on port 8000
bun run serve           # Start server without watch mode
```

### Supabase (Database)

```bash
# From supabase directory or root
supabase start          # Start local Supabase (required for development)
supabase stop           # Stop local Supabase
supabase db reset       # Reset database and run migrations
bun run db:diff         # Generate migration diff
bun run db:save <name>  # Save migration to file
bun run deploy:preview  # Preview database deployment (dry-run)

# Generate TypeScript types from database schema
supabase gen types typescript --local > shared/database.types.ts
```

## Key Architecture Patterns

### API Server Implementation

The backend API is built with **Hono** running on **Bun**:

- **Development**: Local Bun server at `http://localhost:8000`
- **Production**: Digital Ocean App Platform with native Bun runtime
- **Type-safe RPC**: Hono RPC client provides end-to-end type safety between frontend and backend

**Why Bun over Docker?**
- ~40% faster cold starts on Digital Ocean
- Simpler deployment (no Dockerfile needed)
- Native TypeScript execution without transpilation

**When making changes to API logic**:
- Edit files in `server/` (routes, middleware, etc.)
- The Bun server automatically reloads during development
- For production deployment, use `bun run deploy:server` (see `DEPLOYMENT.md`)

### Shared Package

The `shared` package contains:

- Zod schemas for validation (`Profile`, `Lobby`, `LobbyJoinQuery`, etc.)
- Database types generated from Supabase (`database.types.ts`)
- Type exports used by both frontend and backend

Import from `shared` package in all workspace packages.

**Naming Convention**: API-level types use **camelCase** (e.g., `createdAt`, `gameState`, `hostUid`, `guestUid`), while the underlying database schema uses **snake_case** (e.g., `created_at`, `game_state`, `host_uid`, `guest_uid`). This follows TypeScript/JavaScript conventions at the API layer while maintaining PostgreSQL conventions at the database layer.

### Authentication Flow

- Supabase Auth handles user authentication
- JWT tokens passed in `Authorization` header
- Backend middleware (`validateAuth`) extracts user from JWT
- Frontend uses `AuthContext` and `UserProfileContext` for state management
- Onboarding flow: Splash → Auth → Create Profile → Lobbies

### Route Protection

Frontend uses `OnboardingGuard` component with three states:

- `unauthed`: Only accessible when not logged in
- `createProfile`: Only accessible when authenticated but no profile exists
- `complete`: Only accessible when authenticated with a profile

### Database Schema

Key tables:

- `lobbies`: Game lobbies with `code`, `config`, `game_state`, `host_uid`, `guest_uid`
- `profiles`: User profiles with `username`, `bio`, linked to Supabase auth `id`

Migrations are in `supabase/migrations/`. Row Level Security (RLS) is enabled on tables.

### Lobby System

- Lobbies created with unique 6-character codes (generated in `utils.ts`)
- Host creates lobby, guest joins via code
- Real-time updates via Supabase Realtime (broadcast channel)
- Lobby middleware handles validation and broadcasting

## TypeScript Configuration

The monorepo uses a **hierarchical TypeScript configuration** with the root as a "single source of truth":

### Configuration Hierarchy

```
Root tsconfig.json (base strict settings)
├── server/tsconfig.json (extends root + ESNext lib)
├── shared/tsconfig.json (extends root + ESNext lib)
└── clients/web/
    ├── tsconfig.app.json (extends root + DOM libs + JSX)
    └── tsconfig.node.json (extends root + Node libs)
```

### Root Configuration (`tsconfig.json`)

The root config provides universal strict settings for all packages:

- **Strict mode**: All strict options enabled including `noUnusedLocals` and `noUnusedParameters`
- **Module system**: `module: "Preserve"` and `moduleResolution: "bundler"` for Bun/Vite compatibility
- **No duplication**: Server and shared packages extend root with minimal overrides

### Package Configurations

All packages extend the root config and add only environment-specific settings:

- **Server** (`server/tsconfig.json`): Extends root + `lib: ["ESNext"]` only
- **Shared** (`shared/tsconfig.json`): Extends root + `lib: ["ESNext"]` only
- **Web Client**: Uses Vite's multi-config pattern for environment separation
  - `tsconfig.app.json`: Browser code (extends root + DOM libs + JSX support)
  - `tsconfig.node.json`: Build tools (extends root + Node types)

### Key Settings

- **Strict unused checks**: Unused variables and parameters are compile errors everywhere
- **Bundler mode**: Modern module resolution for Bun and Vite
- **No JSX in backend**: Only web client has JSX support (React)
- **Environment-specific libs**: DOM for browser, ESNext for server/shared, Node for build tools

## Important Notes

- This project uses **Bun** as the primary runtime (not Node.js)
- The web client runs on port 3000, server runs on port 8000
- Supabase local instance runs on port 54321 (API), 54322 (DB), 54323 (Studio)
- Environment variables are in `.env` files (`.env.development` and `.env.production` are committed, `.env.local` is gitignored)
- Format code with Prettier before committing (`bun run format`)
- Database types should be regenerated after schema changes using `supabase gen types`

## Deployment

**⚠️ Important**: This project uses a git branch-based deployment strategy. See `DEPLOYMENT.md` for comprehensive deployment documentation.

### Quick Deployment Reference

```bash
# Deploy in order: database → server → client
bun run deploy:sb        # Deploy database migrations and config to Supabase
bun run deploy:server    # Deploy backend to Digital Ocean
bun run deploy:client    # Deploy frontend to Cloudflare
```

### Deployment Gotchas

When working with deployments, be aware of these common issues:

1. **Environment variables are baked at build time** - Client env vars are embedded during `vite build`, not at runtime
2. **Database type generation is manual** - Always run `supabase gen types` after schema changes
3. **Squash merge strategy** - Deployment scripts use `git merge --squash -X theirs`, never commit directly to `prod/*` branches
4. **CORS configuration** - Backend must explicitly allow frontend domain in production
5. **Supabase auth redirects** - Production URL must be added to `supabase/config.toml`

For detailed deployment instructions, troubleshooting, and the complete list of gotchas, see `DEPLOYMENT.md`.

## Common Development Workflows

### Adding a new API endpoint

1. Define Zod schema in `shared/index.ts` for request/response validation (if needed)
2. Add route handler in `server/routes/`
3. Add middleware in `server/middleware/` if needed
4. Register route in `server/app.ts` or `server/index.ts`
5. Update frontend service in `clients/web/src/services/` using Hono RPC client

**Example**:
```typescript
// shared/index.ts - Define schema
export const GameMoveSchema = z.object({
  from: z.string(),
  to: z.string(),
  promotion: z.string().optional()
});

// server/routes/game.ts - Add route
import { zValidator } from "@hono/zod-validator";
import { GameMoveSchema } from "shared";

export const gameRoutes = new Hono();

gameRoutes.post("/move", zValidator("json", GameMoveSchema), async (c) => {
  const move = c.req.valid("json");
  // Handle move logic
  return c.json({ success: true });
});

// clients/web/src/services/api.ts - Call from frontend
const result = await client.game.move.$post({
  json: { from: "e2", to: "e4" }
});
```

### Modifying database schema

1. Create migration: `supabase migration new <name>`
2. Write SQL in the generated migration file
3. Apply migration: `supabase db reset` or `supabase db push`
4. Regenerate types: `supabase gen types typescript --local > shared/database.types.ts`
5. Update Zod schemas in `shared/index.ts` if needed

### Working with the frontend

- Components are in `clients/web/src/components/`
- Pages are in `clients/web/src/pages/`
- Context providers in `components/providers/`
- Services for API calls in `services/`
- Uses React Router for navigation
- Supabase client initialized in `src/supabase.ts`

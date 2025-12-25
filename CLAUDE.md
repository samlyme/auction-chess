# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Auction Chess is a multiplayer chess variant built with:

- **Frontend**: React + TypeScript + Vite (in `clients/web`)
- **Backend**: Hono API server running on Bun (in `server`)
- **Database**: Supabase (PostgreSQL) with local development support
- **Serverless**: Supabase Edge Functions using Deno (in `supabase/functions/api`)
- **Shared code**: Common types and database schema (in `shared`)

## Monorepo Structure

This is a Bun workspace with three main packages:

- `clients/web` - React web client
- `server` - Hono API server (alternative to Supabase Edge Functions)
- `shared` - Shared TypeScript types and Zod schemas

Both the `server` and `supabase/functions/api` implementations provide the same API (using Hono), but one runs on Bun and the other on Deno. They share similar structure and logic.

## Development Commands

### Root level

```bash
bun install              # Install all dependencies
bun run format          # Format all files with Prettier
bun run build:edge      # Bundle server code for Supabase Edge Functions
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

### Supabase (Database & Edge Functions)

```bash
# From root directory
bun run build:edge      # Build server code for Deno (required before serving)

# From supabase directory
supabase start          # Start local Supabase (required for development)
supabase stop           # Stop local Supabase
supabase db reset       # Reset database and run migrations
supabase functions serve api  # Serve the api edge function locally

# Generate TypeScript types from database schema
supabase gen types typescript --local > shared/database.types.ts
```

## Key Architecture Patterns

### Dual API Implementation

The codebase has two ways to run the API:

1. **Bun Server** (`server/`): Direct development server using Bun runtime
2. **Supabase Edge Function** (`supabase/functions/api/`): Production serverless deployment on Deno runtime

**Important**: The server code in `server/` is written for Bun (no `.ts` extensions required). When deploying to Supabase Edge Functions:
- Run `bun run build:edge` to bundle `server/app.ts` → `supabase/functions/api/server.js`
- The Edge Function (`index.ts`) imports the bundled `server.js`
- All dependencies (Hono, shared code) are bundled into a single file for Deno compatibility

**When making changes to API logic**:
- Edit files in `server/` (routes, middleware, etc.)
- Run `bun run build:edge` to rebuild for Edge Functions
- The Bun server works directly; Edge Functions need the build step

### Shared Package

The `shared` package contains:

- Zod schemas for validation (`Profile`, `Lobby`, `LobbyJoinQuery`, etc.)
- Database types generated from Supabase (`database.types.ts`)
- Type exports used by both frontend and backend

Import from `shared` package in all workspace packages.

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
- The web client runs on port 3000, servers run on port 8000
- Supabase local instance runs on port 54321 (API), 54322 (DB), 54323 (Studio)
- Environment variables are in `.env` files (gitignored)
- Format code with Prettier before committing (`bun run format`)
- Database types should be regenerated after schema changes using `supabase gen types`

## Common Development Workflows

### Adding a new API endpoint

1. Define Zod schema in `shared/index.ts` if needed
2. Add route handler in both `server/routes/` and `supabase/functions/api/routes/`
3. Add middleware in corresponding `middleware/` directories if needed
4. Register route in `index.ts` of both servers
5. Update frontend service in `clients/web/src/services/`

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

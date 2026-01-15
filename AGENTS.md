# AGENTS.md

This file provides guidance to agentic coding agents working in this repository.

## Project Overview

Auction Chess is a multiplayer chess variant built with:

- **Frontend**: React + TypeScript + Vite (in `clients/web`)
- **Backend**: Hono API server running on Bun (in `server`)
- **Database**: Supabase (PostgreSQL) with local development support
- **Shared code**: Common types and database schema (in `shared`)
- **Deployment**: Git branch-based deployment to Cloudflare (client), Digital Ocean (server), and Supabase (database)

## Implementation Philosophy

**Default to MVP and simplicity**: When implementing features:

- **Start minimal**: Implement the simplest version that satisfies the core requirement
- **Skip optional enhancements**: Don't add error handling, edge cases, loading states, or "nice-to-haves" unless explicitly requested
- **Avoid premature abstraction**: Write direct, inline code rather than creating helpers, utilities, or abstractions for one-time use
- **Human intervention over completeness**: Prefer getting basic functionality working first, then iterate based on feedback
- **Ask before expanding scope**: If you identify potential improvements or edge cases, ask rather than implementing them

**Examples of what NOT to do**:

- Adding comprehensive error messages and user feedback for every failure case
- Creating reusable components when a simple inline implementation works
- Adding loading states, optimistic updates, or retry logic unless requested
- Implementing full validation when basic validation suffices
- Adding TypeScript strict typing for every edge case

**Examples of what TO do**:

- Implement the happy path first
- Use basic error handling (try/catch with simple messages)
- Hardcode values initially rather than making everything configurable
- Write inline code in a single file before splitting into modules
- Leave TODOs for known limitations rather than implementing them immediately

**When in doubt, ship the 20% solution that provides 80% of the value**, then ask if additional robustness is needed.

## Build/Lint/Test Commands

### Root Level Commands

```bash
bun run format              # Format all files with Prettier
bun run client:dev          # Start web client dev server (port 3000)
bun run client:dev          # Start web client dev server (port 3000)
bun run client:build        # Build web client (tsc check + vite build)
bun run client:lint         # Run ESLint on web client
bun run client:lint:fix     # Run ESLint with auto-fix
bun run client:preview      # Preview production build
bun run client:publish      # Deploy to Cloudflare
bun run server:dev          # Start server dev server with hot reload (port 8000)
bun run server:build        # Build server for production
bun run server:start        # Start production server
bun run server:start:local  # Start production server with dev env
bun run server:start:prod   # Start production server with prod env
bun run db:types            # Generate TypeScript types from Supabase schema
bun run db:diff             # Generate migration diff
bun run db:save <name>      # Save migration to file
bun run db:test             # Reset database and run migrations
bun run deploy:client       # Deploy frontend to Cloudflare
bun run deploy:server       # Deploy backend to Digital Ocean
bun run deploy:sb           # Deploy database to Supabase
```

### Package-Specific Commands

```bash
# Web Client (clients/web)
cd clients/web
bun run dev                 # Start dev server
bun run build               # Build for production
bun run lint                # Run ESLint
bun run lint:fix            # Auto-fix ESLint issues
bun run preview             # Preview production build
bun run publish             # Deploy to Cloudflare

# Server
cd server
bun run dev                 # Start with hot reload
bun run build               # Build for production
bun run start               # Start production build
bun run start:local         # Start production server with dev env
bun run start:prod          # Start production server with prod env
```

### Testing

This project currently does not have automated tests. When implementing tests, use the standard Bun test runner:

```bash
bun test                    # Run all tests
bun test path/to/test.ts    # Run single test file
```

## Code Style Guidelines

### TypeScript Configuration

- **Strict mode enabled**: All strict TypeScript options enforced
- **No unused code**: `noUnusedLocals` and `noUnusedParameters` are compile errors
- **Bundler mode**: Uses `moduleResolution: "bundler"` for modern module resolution
- **No implicit any**: All types must be explicitly defined

### Import Organization

```typescript
// 1. External libraries (node_modules)
import { z } from "zod";
import { Hono } from "hono";
import React from "react";

// 2. Workspace packages (shared, server)
import { GameSchema } from "shared/types";
import type { AppType } from "server/app";

// 3. Local imports (relative)
import { validateAuth } from "./middleware/auth";
import { GameComponent } from "../components/game";
```

### Naming Conventions

- **API types**: camelCase (e.g., `createdAt`, `gameState`, `hostUid`, `guestUid`)
- **Database schema**: snake_case (e.g., `created_at`, `game_state`, `host_uid`, `guest_uid`)
- **Components**: PascalCase (e.g., `GameBoard`, `LobbyPanel`)
- **Functions/variables**: camelCase (e.g., `createLobby`, `userProfile`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_PLAYERS`, `DEFAULT_TIMEOUT`)
- **Files**: kebab-case for utilities, PascalCase for components (e.g., `game-utils.ts`, `GameBoard.tsx`)

**Naming Convention**: API-level types use **camelCase** while the underlying database schema uses **snake_case**. This follows TypeScript/JavaScript conventions at the API layer while maintaining PostgreSQL conventions at the database layer.

### Error Handling

- **Server routes**: Use Hono's built-in error handling with HTTPException
- **Client code**: Try/catch with simple error messages, avoid over-engineering
- **API calls**: Basic error handling, prefer success path over comprehensive error coverage
- **Follow MVP principle**: Implement happy path first, add error handling only when needed

### Code Structure Patterns

#### Server Routes

```typescript
import { zValidator } from "@hono/zod-validator";
import { GameSchema } from "shared/types";

export const gameRoutes = new Hono();

gameRoutes.post("/move", zValidator("json", GameSchema), async (c) => {
  const move = c.req.valid("json");
  // Business logic here
  return c.json({ success: true, data: result });
});
```

#### Client Services

```typescript
import { api } from "./api";

export async function makeMove(move: GameMove) {
  const result = await api.game.move.$post({
    json: move,
  });
  return await result.json();
}
```

#### React Components

```typescript
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/game")({
  component: GameComponent,
});

function GameComponent() {
  return <div>Game Page</div>;
}
```

### Formatting Rules

- **Prettier config**: 2-space tabs, semicolons, single quotes, trailing commas
- **Line length**: 80 characters
- **No unused imports**: Enforced by TypeScript strict mode
- **Consistent formatting**: Run `bun run format` before committing

### Database Schema Patterns

- **Tables**: snake_case naming (e.g., `user_profiles`, `game_lobbies`)
- **Columns**: snake_case with foreign keys ending in `_uid` (e.g., `host_uid`, `guest_uid`)
- **Timestamps**: `created_at`, `updated_at` columns
- **RLS enabled**: All tables have Row Level Security policies

### API Design Principles

- **Type-safe**: Use Zod schemas for request/response validation
- **RESTful**: Follow REST conventions for HTTP methods and status codes
- **Minimal**: Implement only what's needed, avoid over-engineering
- **Hono RPC**: Use type-safe client-server communication

### State Management

- **Server state**: Supabase database with real-time subscriptions
- **Client state**: React Context for auth, TanStack Router for navigation
- **Form state**: Controlled components with basic validation
- **Real-time**: Supabase broadcast channels for live updates

### Development Workflow

1. **Start local Supabase**: Required for development (`supabase start`)
2. **Run dev servers**: Client on port 3000, server on port 8000
3. **Type generation**: Run `bun run db:types` after schema changes
4. **Format before commit**: Use `bun run format`
5. **MVP first**: Implement basic functionality, iterate based on feedback

### Important Notes

- This project uses **Bun** as the primary runtime (not Node.js)
- The web client runs on port 3000, server runs on port 8000
- Supabase local instance runs on port 54321 (API), 54322 (DB), 54323 (Studio)
- Environment variables are in `.env` files (`.env.development` and `.env.production` are committed, `.env.local` is gitignored)
- Format code with Prettier before committing (`bun run format`)
- Database types should be regenerated after schema changes using `supabase gen types`

### File Organization

```
clients/web/src/
├── components/          # Reusable UI components
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── routes/             # TanStack Router file-based routes
├── services/           # API service functions
└── utils/              # Utility functions

server/
├── middleware/         # Hono middleware
├── routes/            # API route handlers
├── state/             # Server-side state management
├── types/             # TypeScript definitions
└── utils/             # Utility functions

shared/
└── index.ts           # Zod schemas and shared types
```

### Key Architectural Decisions

- **Bun runtime**: Primary runtime for server and tooling
- **Hono API**: Fast, type-safe web framework
- **Supabase**: Database and auth with local development support
- **TanStack Router**: File-based routing with type safety
- **Monorepo**: Bun workspace with shared types package
- **MVP approach**: Default to simple, direct implementations

## Architecture Patterns

### API Server Implementation

The backend API is built with **Hono** running on **Bun**:

- **Development**: Local Bun server at `http://localhost:8000`
- **Production**: Digital Ocean App Platform with native Bun runtime
- **Type-safe RPC**: Hono RPC client provides end-to-end type safety between frontend and backend

**When making changes to API logic**:

- Edit files in `server/` (routes, middleware, etc.)
- The Bun server automatically reloads during development

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
- Onboarding flow: `/` (Splash) → `/auth` (Sign In/Up) → `/auth/create-profile` → `/lobbies`

### Route Protection

Frontend uses **TanStack Router with file-based routing**:

- Route definitions are in `clients/web/src/routes/`
- **Layout routes** (e.g., `_auth/route.tsx`) use `beforeLoad` hooks to protect child routes
- **RouterContext** provides auth and profile state to all routes
- Route protection logic:
  - `/` (index) - Unauthenticated users only, redirects authenticated users to `/lobbies`
  - `/auth/*` - Unauthenticated routes (sign in/sign up)
  - `/auth/create-profile` - Authenticated users without a profile
  - `/_auth/*` - Protected routes requiring both authentication and profile (e.g., `/lobbies`, `/profile`)
- Protection is enforced via `beforeLoad` hooks that throw `redirect()` when requirements aren't met

### Database Schema

Key tables:

- `lobbies`: Game lobbies with `code`, `config`, `game_state`, `host_uid`, `guest_uid`
- `profiles`: User profiles with `username`, `bio`, linked to Supabase auth `id`

Migrations are in `supabase/migrations/`. Row Level Security (RLS) is enabled on tables.

### Lobby System

- Lobbies created with unique 6-character codes (generated in `utils.ts`)
- Host creates lobby, guest joins via code
- Real-time updates via Supabase Realtime (broadcast channel)

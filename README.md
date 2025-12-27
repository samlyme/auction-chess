# Auction Chess

A multiplayer chess variant where players bid on their moves using in-game currency. Built as a modern, full-stack TypeScript application with real-time gameplay.

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Bun + Hono API server
- **Database**: Supabase (PostgreSQL)
- **Hosting**:
  - Client: Cloudflare Workers/Pages
  - Server: Digital Ocean App Platform
  - Database: Supabase Cloud
- **Real-time**: Supabase Realtime (WebSockets)
- **Authentication**: Supabase Auth (Google OAuth)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Auction Chess Monorepo                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  clients/web (React + Vite)                                │
│  ├─ Cloudflare Workers/Pages                               │
│  ├─ TypeScript + React Router                              │
│  └─ Connects to: Backend API + Supabase Auth/Realtime      │
│                                                             │
│  server (Bun + Hono)                                        │
│  ├─ Digital Ocean App Platform                             │
│  ├─ REST API with type-safe RPC                            │
│  └─ Connects to: Supabase Database                         │
│                                                             │
│  shared (Common Types)                                      │
│  ├─ Zod schemas for validation                             │
│  ├─ Database types (auto-generated)                        │
│  └─ Shared between client and server                       │
│                                                             │
│  supabase (Database & Config)                              │
│  ├─ PostgreSQL migrations                                  │
│  ├─ Supabase configuration                                 │
│  └─ Row Level Security (RLS) policies                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Monorepo Structure

This project uses **Bun workspaces** to manage multiple packages:

```
auction-chess/
├── clients/web/          # React frontend application
│   ├── src/              # Frontend source code
│   └── wrangler.toml     # Cloudflare Workers config
├── server/               # Bun + Hono API server
│   ├── app.ts            # Main application entry
│   └── routes/           # API route handlers
├── shared/               # Shared types and schemas
│   ├── index.ts          # Zod schemas
│   └── database.types.ts # Generated from Supabase schema
├── supabase/             # Database and configuration
│   ├── migrations/       # SQL migration files
│   └── config.toml       # Supabase configuration
└── scripts/              # Deployment scripts
    ├── deploy-client.sh
    ├── deploy-server.sh
    └── deploy-supabase.sh
```

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) v1.2.16 or later
- [Supabase CLI](https://supabase.com/docs/guides/cli) (for database)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (optional, for manual client deployment)

### Installation

```bash
# Install all dependencies
bun install
```

### Local Development

```bash
# 1. Start local Supabase (database, auth, realtime)
cd supabase
supabase start
cd ..

# 2. Start the backend server (Terminal 1)
bun run server:dev
# Server runs at http://localhost:8000

# 3. Start the frontend (Terminal 2)
bun run client:dev
# Client runs at http://localhost:3000
```

### Environment Setup

Each package requires environment variables for local development:

**Client** (`clients/web/.env.development`):
```env
VITE_SUPABASE_PUB_KEY=<your-local-supabase-anon-key>
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_BACKEND_URL=http://localhost:8000
```

**Server** (`server/.env.development`):
```env
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=<your-local-service-role-key>
```

**Supabase** (`supabase/.env.local`):
```env
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET=<your-google-oauth-secret>
```

> **Note**: Local Supabase keys are generated when you run `supabase start`. Check the terminal output for values.

## Common Commands

### Development
```bash
bun run client:dev        # Start frontend dev server
bun run server:dev        # Start backend dev server with hot reload
bun run format            # Format all code with Prettier
```

### Building
```bash
bun run client:build      # Build frontend for production
bun run server:build      # Build backend for production
```

### Database
```bash
bun run db:diff           # Generate migration diff
bun run db:save <name>    # Save migration to file
bun run db:test           # Reset database and run migrations
bun run deploy:preview    # Preview database deployment (dry-run)
```

### Deployment
```bash
bun run deploy:client     # Deploy frontend to Cloudflare
bun run deploy:server     # Deploy backend to Digital Ocean
bun run deploy:sb         # Deploy database to Supabase
```

> **For detailed deployment instructions**, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide with git branch strategy
- **[CLAUDE.md](./CLAUDE.md)** - Guidance for Claude Code AI assistant
- **[clients/web/README.md](./clients/web/README.md)** - Frontend-specific documentation
- **[server/README.md](./server/README.md)** - Backend-specific documentation
- **[supabase/README.md](./supabase/README.md)** - Database and Supabase documentation

## Project Evolution

This project has evolved through several architectural iterations:

- **v1**: Docker-based deployment → **v2**: Native Bun (no Docker)
- Performance improvement: ~40% faster cold starts on Digital Ocean

## Key Features

- **Real-time multiplayer**: Lobby system with WebSocket-based game updates
- **Google OAuth**: Secure authentication via Supabase Auth
- **Type-safe API**: Hono RPC client with end-to-end TypeScript types
- **Git-based deployment**: Branch-based deployment strategy (no manual CI/CD)
- **Monorepo**: Shared types and schemas between client and server

## Development Workflow

1. Make changes on `main` branch or feature branches
2. Test locally with `bun run client:dev` and `bun run server:dev`
3. Merge to `main` when ready
4. Deploy using deployment scripts (see [DEPLOYMENT.md](./DEPLOYMENT.md))

## TypeScript Configuration

Uses hierarchical TypeScript configuration:
- **Root**: Base strict settings for all packages
- **Server/Shared**: Extends root + ESNext libs
- **Client**: Extends root + DOM libs + JSX support

All packages enforce strict mode with unused variable/parameter checks.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and not licensed for public use.

## Support

For questions or issues:
- Check the documentation in this repository
- Review existing issues in the project tracker
- Contact the development team

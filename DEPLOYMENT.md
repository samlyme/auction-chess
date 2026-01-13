# Deployment Guide

This guide covers deploying the Auction Chess application to production using a git branch-based deployment strategy.

## Table of Contents

- [Deployment Architecture](#deployment-architecture)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Client Deployment (Cloudflare)](#client-deployment-cloudflare)
- [Server Deployment (Digital Ocean)](#server-deployment-digital-ocean)
- [Database Deployment (Supabase)](#database-deployment-supabase)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Deployment Commands](#deployment-commands)
- [Common Gotchas & Footguns](#common-gotchas--footguns)
- [Troubleshooting](#troubleshooting)

---

## Deployment Architecture

### Git Branch-Based Strategy

This project uses a **git branch-based deployment** strategy instead of traditional CI/CD pipelines:

```
main branch (development)
    │
    ├─── squash merge ──→ prod/client  ──→ Cloudflare Pages (auto-deploy)
    │
    ├─── squash merge ──→ prod/server  ──→ Digital Ocean (auto-deploy)
    │
    └─── squash merge ──→ prod/supabase ──→ Supabase CLI deployment
```

**How it works:**

1. Development happens on `main` or feature branches
2. When ready to deploy, run a deployment script
3. Script squash merges `main` → deployment branch (`prod/*`)
4. Script pushes deployment branch to remote
5. Hosting platform watches deployment branch and auto-deploys

**Key characteristics:**

- No GitHub Actions or CI/CD configuration needed
- Squash merge strategy uses `-X theirs` (always accepts incoming changes)
- Each deployment creates a single commit on the deployment branch
- Deployment branches accumulate squash commits over time

### Deployment Targets

| Component | Branch          | Platform                   | URL                                     |
| --------- | --------------- | -------------------------- | --------------------------------------- |
| Frontend  | `prod/client`   | Cloudflare Workers/Pages   | `https://<your-domain>.com`             |
| Backend   | `prod/server`   | Digital Ocean App Platform | `https://<your-app>.ondigitalocean.app` |
| Database  | `prod/supabase` | Supabase Cloud             | `https://<your-project>.supabase.co`    |

---

## Prerequisites

### Required Accounts

1. **Cloudflare Account** - For frontend hosting
   - Sign up: https://dash.cloudflare.com/sign-up
   - Set up Workers/Pages in dashboard

2. **Digital Ocean Account** - For backend hosting
   - Sign up: https://cloud.digitalocean.com
   - Create App Platform app

3. **Supabase Account** - For database and auth
   - Sign up: https://supabase.com
   - Create a new project

### Required CLI Tools

```bash
# Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash

# Supabase CLI
brew install supabase/tap/supabase
# Or: https://supabase.com/docs/guides/cli

# Wrangler (Cloudflare CLI)
bun install -g wrangler
# Or: npm install -g wrangler

# Optional: doctl (Digital Ocean CLI)
brew install doctl
# Or: https://docs.digitalocean.com/reference/doctl/how-to/install/
```

### Link Your Project

```bash
# Link Supabase project
supabase link --project-ref <your-project-id>

# Authenticate Wrangler
wrangler login

# Authenticate doctl (optional)
doctl auth init
```

---

## Environment Variables

### Production Environment Variables

You must set these environment variables **before building/deploying**.

#### Client (Frontend)

Create `clients/web/.env.production`:

```env
VITE_SUPABASE_PUB_KEY=<your-supabase-anon-key>
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_BACKEND_URL=https://<your-app>.ondigitalocean.app
```

**Where to find values:**

- `VITE_SUPABASE_PUB_KEY`: Supabase Dashboard → Settings → API → `anon` `public` key
- `VITE_SUPABASE_URL`: Supabase Dashboard → Settings → API → Project URL
- `VITE_BACKEND_URL`: Digital Ocean App Platform → App → URL

#### Server (Backend)

Create `server/.env.production`:

```env
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

**Where to find values:**

- `SUPABASE_URL`: Same as client
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase Dashboard → Settings → API → `service_role` `secret` key

**⚠️ CRITICAL**: The service role key must be kept secret. Set it in Digital Ocean's environment variables dashboard, not committed to git.

#### Supabase (Local Development)

Create `supabase/.env.local`:

```env
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET=<your-google-oauth-secret>
```

**Where to find values:**

- Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client

#### Setting Environment Variables in Hosting Platforms

**Cloudflare Workers:**

- Environment variables are tracked by `git` and **baked into the build** at build time
- No manual `.env` configurations is needed on Cloudflare to deploy the client
- Vite embeds `VITE_*` variables during `vite build`
- To change: update `.env.production` and rebuild

**Digital Ocean App Platform:**

1. Go to your app in DO dashboard
2. Navigate to Settings → Environment Variables
3. Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
4. Mark `SUPABASE_SERVICE_ROLE_KEY` as "Encrypt"
5. **NOTE:** the `server` makes use of privileged keys, and those keys must not be tracked by `git`. Thus, manual configuration is required.

**Supabase:**

- Local development: `supabase/.env.local` (gitignored)
- For now, only contains Google OAuth secret key.
- Production: Set in Supabase Dashboard → Settings → Authentication → External OAuth Providers

---

## Client Deployment (Cloudflare)

The configuration should be tracked in `wrangler.toml`.

### Deploy Client

```bash
bun run deploy:client
```

### What the Script Does

The `deploy:client` script (`scripts/deploy-client.sh`):

1. Checks out or creates `prod/client` branch
2. Squash merges from `main` (using `-X theirs` strategy)
3. Commits with timestamp or custom message
4. Pushes to `origin prod/client`
5. Returns to your original branch

**Custom commit message:**

```bash
./scripts/deploy-client.sh "Release v2.1.0"
```

### Verification

After deployment:

1. Check Cloudflare Dashboard → Workers & Pages → Your app → Deployments
2. Visit your production URL
3. Test authentication flow (Google OAuth)
4. Check browser console for errors

---

## Server Deployment (Digital Ocean)

### Initial Setup

1. **Create App in Digital Ocean**:
   - Go to https://cloud.digitalocean.com/apps
   - Click "Create App"
   - Select GitHub as source
   - Authorize Digital Ocean to access your repository
   - Select the `auction-chess` repository
   - Choose branch: `prod/server`

2. **Configure App**:
   - **Source Directory**: `/server`
   - **Build Command**: `bun install && bun run build`
   - **Run Command**: `bun run start:prod`
   - **HTTP Port**: `8000`
   - **HTTP Route**: `/api` (optional)
   - **Environment**: Select "Bun" as runtime

3. **Set Environment Variables** in DO Dashboard:
   - `SUPABASE_URL` = `https://<your-project>.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = `<your-service-role-key>` (encrypted)
   - `PORT` = `8000` (usually auto-set)

4. **Choose Instance Size**:
   - Development: Basic ($5/month)
   - Production: Basic XS or higher ($12+/month)

### Deploy Server

```bash
# Option 1: Using deployment script (recommended)
bun run deploy:server

# Option 2: Manual
./scripts/deploy-server.sh

# Custom commit message
./scripts/deploy-server.sh "Deploy API v2.1.0"
```

### What the Script Does

The `deploy:server` script (`scripts/deploy-server.sh`):

1. Checks out or creates `prod/server` branch
2. Squash merges from `main`
3. Commits and pushes to `origin prod/server`
4. Digital Ocean detects push and auto-deploys
5. Returns to your original branch

### Verification

After deployment:

1. Check Digital Ocean Dashboard → Apps → Your app → Runtime Logs
2. Test health endpoint: `https://<your-app>.ondigitalocean.app/api`
3. Check logs for any connection errors to Supabase
4. Verify CORS headers allow your frontend domain

---

## Database Deployment (Supabase)

### Deployment Process

Database deployment involves two steps:

1. **Database schema** (migrations)
2. **Supabase configuration** (auth, realtime, etc.)

### Deploy Database

```bash
# Option 1: Using deployment script (recommended)
bun run deploy:sb

# Option 2: Manual
./scripts/deploy-supabase.sh

# Custom commit message
./scripts/deploy-supabase.sh "Add user profiles table"
```

### What the Script Does

The `deploy:sb` script (`scripts/deploy-supabase.sh`):

1. Checks out or creates `prod/supabase` branch
2. Squash merges from `main`
3. Commits and pushes to `origin prod/supabase`
4. Runs `supabase db push` (deploys migrations)
5. Runs `supabase config push` (deploys config)
6. Returns to your original branch

### Manual Database Deployment

If you need more control:

```bash
# Preview migrations (dry-run)
bun run deploy:preview
# Or: supabase db push --dry-run

# Push migrations to production
supabase db push

# Push configuration to production
supabase config push

# Both at once
bun run sb:push
```

### Creating Migrations

```bash
# 1. Make schema changes in Supabase Studio (local)
#    http://localhost:54323

# 2. Generate migration diff
bun run db:diff

# 3. Save migration to file
bun run db:save migration_name

# 4. Review generated SQL in supabase/migrations/

# 5. Test migration locally
bun run db:test

# 6. Deploy (see above)
```

### Database Type Generation

After schema changes, regenerate TypeScript types:

```bash
supabase gen types typescript --local > shared/database.types.ts
```

**⚠️ Important**: This is a **manual step** and not automated in deployment scripts.

### Verification

After deployment:

1. Check Supabase Dashboard → Database → Migrations
2. Verify latest migration is applied
3. Check Table Editor to confirm schema changes
4. Test RLS policies in Dashboard → Authentication → Policies

---

## Pre-Deployment Checklist

Before deploying to production, verify:

### Code Quality

- [ ] All TypeScript type errors resolved (`bun run client:build`, `bun run server:build`)
- [ ] Code formatted with Prettier (`bun run format`)
- [ ] No console.log or debugging code left in production code

### Testing

- [ ] Manual testing completed locally
- [ ] Authentication flow tested (Google OAuth)
- [ ] API endpoints tested with Postman/Hoppscotch
- [ ] Real-time features tested (lobby system)

### Environment Variables

- [ ] `clients/web/.env.production` has correct production values
- [ ] `server/.env.production` has correct production values
- [ ] Digital Ocean environment variables are set and encrypted
- [ ] Supabase auth redirects include production frontend URL

### Database

- [ ] Migrations tested locally (`bun run db:test`)
- [ ] Migrations previewed for production (`bun run deploy:preview`)
- [ ] Database types regenerated if schema changed
- [ ] RLS policies reviewed for security

### Configuration

- [ ] CORS configuration allows production frontend domain
- [ ] Supabase `config.toml` has correct `site_url`
- [ ] Cloudflare `wrangler.toml` has correct custom domain
- [ ] Google OAuth credentials configured for production domain

### Git

- [ ] All changes committed to `main` branch
- [ ] Working directory is clean (`git status`)
- [ ] Latest changes pulled from remote

---

## Deployment Commands

### Quick Reference

```bash
# Deploy everything (in order)
bun run deploy:sb      # Deploy database first
bun run deploy:server  # Deploy backend second
bun run deploy:client  # Deploy frontend last

# Deploy individually with custom messages
./scripts/deploy-client.sh "Release v2.1.0"
./scripts/deploy-server.sh "Fix authentication bug"
./scripts/deploy-supabase.sh "Add profiles table"

# Preview database changes (dry-run)
bun run deploy:preview

# Database operations
bun run db:diff        # Generate migration diff
bun run db:save <name> # Save migration
bun run db:test        # Test migrations locally
```

### Rollback Strategy

If deployment fails or introduces bugs:

**Client (Cloudflare):**

```bash
# Option 1: Revert the problematic commit (recommended - safe for shared branches)
git checkout prod/client
git revert HEAD
git push origin prod/client
```

**Server (Digital Ocean):**

```bash
# Revert the problematic commit
git checkout prod/server
git revert HEAD
git push origin prod/server
```

**NOTE:** it is also possible to `git reset` on branch `main` then redeploy, however
this is not recommended as it may be possible to deploy an intermediate commit.
By using `git revert`, on the `prod/*` branch, we know that we can roll back to
a working build.

**Database (Supabase):**

```bash
# Create a rollback migration
# Supabase doesn't support automatic rollback
# You must create a new migration that reverses changes

# Example:
bun run db:save rollback_user_profiles
# Then manually write SQL to reverse the changes
supabase db push
```

**NOTE:** this is why we must be extremely careful when dealing with supabase DB
migrations. Rollbacks are **NOT GARAUNTEED** unlike the server and client. Changes
are destructive, and require manually reconcilation if gone wrong.

---

## Common Gotchas & Footguns

### 1. Environment Variables Baked at Build Time

**Problem**: Vite embeds `VITE_*` environment variables during build, not at runtime.

**Impact**: Changing `.env.production` after deployment requires a rebuild and redeploy.

**Solution**:

- Always verify `.env.production` before building
- Test builds locally before deploying
- If you need to change env vars post-deployment, rebuild and redeploy

### 2. JWT Signing Keys Not in Git

**Problem**: `supabase/signing_keys.json` is gitignored and must be manually created for local development.

**Impact**: New developers or machines can't run local Supabase without generating keys.

**Solution**:

```bash
# Generate signing keys for local development
supabase start
# Keys are auto-generated and stored in signing_keys.json
```

**Why**: Private EC keys must not be committed to git for security.

### 3. Squash Merge Strategy Overwrites

**Problem**: Deployment scripts use `git merge --squash -X theirs`, which always accepts incoming changes.

**Impact**: Manual fixes directly on deployment branches get overwritten on next deploy.

**Solution**:

- Never commit directly to `prod/*` branches
- Always fix issues on `main` and redeploy
- If emergency fix needed on prod branch, backport to `main` immediately

### 4. Database Type Generation is Manual

**Problem**: After schema changes, TypeScript types must be manually regenerated.

**Impact**: Stale types cause TypeScript errors or runtime bugs.

**Solution**:

```bash
# After any database schema change
supabase gen types typescript --local > shared/database.types.ts
git add shared/database.types.ts
git commit -m "Update database types"
```

### 5. CORS Configuration

**Problem**: Backend currently allows all origins (`Access-Control-Allow-Origin: *`).

**Impact**: Any website can call your API (security risk).

**Solution**:

- Update `server/app.ts` CORS headers to only allow production frontend domain
- Example:

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://your-domain.com",
  // ...
};
```

### 6. Supabase Auth Redirects

**Problem**: OAuth redirects must be explicitly allowed in `config.toml`.

**Impact**: Users can't log in via Google OAuth if redirect URL isn't configured.

**Solution**:

- Update `supabase/config.toml`:

```toml
site_url = "https://your-production-domain.com"
additional_redirect_urls = ["http://localhost:3000"]
```

- Run `bun run deploy:sb` to apply changes

### 7. Google OAuth Secrets

**Problem**: Google OAuth client secret stored in `.env.local`, not in a vault.

**Impact**: Secret must be manually set by each developer.

**Solution**:

- Get secret from Google Cloud Console
- Add to `supabase/.env.local`
- Never commit `.env.local` to git (it's in .gitignore)

### 8. No Automated Testing

**Problem**: No CI/CD pipeline or automated tests run before deployment.

**Impact**: Bugs can be deployed to production.

**Solution**:

- Manual testing checklist (see above)
- Consider adding test suite and GitHub Actions in future

### 9. Migration Destructiveness

**Problem**: Some migrations drop entire tables (see: `20251225085246_drop_lobbies.sql`).

**Impact**: Data loss in production.

**Solution**:

- Always run `bun run deploy:preview` first
- Review generated SQL before deploying
- Back up production data before major migrations
- Consider migration safeguards (e.g., require explicit confirmation)

### 10. Deployment Branch Cleanup

**Problem**: Prod branches accumulate squash commits over time.

**Impact**: Large git history, slow clones.

**Solution**:

- Periodically squash deployment branch history
- Or: delete and recreate deployment branches (requires force push setup in hosting platforms)

---

## Troubleshooting

### Build Failures

**Client build fails:**

```bash
# Check TypeScript errors
cd clients/web
bun run build

# Common issues:
# - Unused imports (strict mode)
# - Type mismatches
# - Missing environment variables
```

**Server build fails:**

```bash
# Check TypeScript errors
cd server
bun run build

# Common issues:
# - Import path issues
# - Type errors in route handlers
```

### Deployment Issues

**Digital Ocean deployment fails:**

1. Check build logs in DO dashboard
2. Verify `prod/server` branch exists and has latest changes
3. Check if DO is watching the correct branch
4. Verify environment variables are set

**Supabase push fails:**

```bash
# Check project linkage
supabase link --project-ref <your-project-id>

# Re-authenticate if needed
supabase login

# Verify migration SQL is valid
supabase db push --dry-run
```

### CORS Issues

**Symptoms**: Frontend shows CORS errors in console

**Solutions**:

1. Check backend CORS headers in `server/app.ts`
2. Ensure backend allows frontend domain
3. Verify preflight requests (OPTIONS) are handled
4. Check Digital Ocean app allows CORS

**Quick fix for testing** (not for production):

```typescript
// server/app.ts
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Allow all (development only)
  // ...
};
```

### Authentication Issues

**Google OAuth fails:**

1. Verify Google OAuth credentials in Google Cloud Console
2. Check authorized redirect URIs include your production domain
3. Verify Supabase `config.toml` has correct `site_url`
4. Check `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET` is set

**Session expires immediately:**

1. Check JWT expiry in `supabase/config.toml` (default: 3600 seconds)
2. Verify browser allows cookies from Supabase domain
3. Check for clock skew between client and server

---

## Getting Help

If you encounter issues not covered here:

1. **Check logs**:
   - Cloudflare: Dashboard → Workers & Pages → Deployments → Logs
   - Digital Ocean: Dashboard → Apps → Runtime Logs
   - Supabase: Dashboard → Logs

2. **Review documentation**:
   - [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
   - [Digital Ocean App Platform Docs](https://docs.digitalocean.com/products/app-platform/)
   - [Supabase Docs](https://supabase.com/docs)

3. **Common issues**:
   - Search this repository's issue tracker
   - Check deployment script comments for hints

4. **Contact support**:
   - Cloudflare: https://support.cloudflare.com
   - Digital Ocean: https://www.digitalocean.com/support
   - Supabase: https://supabase.com/support

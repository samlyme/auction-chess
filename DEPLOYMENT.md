# Deployment Guide

This guide covers deploying the Auction Chess application to production.

## Server Deployment to Digital Ocean

The backend server can be deployed to Digital Ocean App Platform, which natively supports Bun.

### Prerequisites

1. **Digital Ocean Account**: Sign up at https://cloud.digitalocean.com
2. **doctl CLI** (optional but recommended): Install the Digital Ocean CLI
   ```bash
   brew install doctl  # macOS
   # Or download from: https://docs.digitalocean.com/reference/doctl/how-to/install/
   ```
3. **Authenticate doctl** (if using CLI):
   ```bash
   doctl auth init
   ```

### Deployment Methods

#### Option 1: Using Digital Ocean Dashboard (Recommended for first deployment)

1. **Push your code to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Prepare for Digital Ocean deployment"
   git push origin main
   ```

2. **Create a new App in Digital Ocean**:
   - Go to https://cloud.digitalocean.com/apps
   - Click "Create App"
   - Select "GitHub" as source
   - Authorize Digital Ocean to access your repository
   - Select your `auction-chess` repository
   - Choose the branch (usually `main`)

3. **Configure the App**:
   - Digital Ocean should auto-detect the `.do/app.yaml` configuration
   - OR manually configure:
     - **Source Directory**: `/server`
     - **Dockerfile Path**: `server/Dockerfile`
     - **HTTP Port**: `8000`
     - **HTTP Route**: `/api`

4. **Set Environment Variables**:
   - In the App settings, add these environment variables:
     - `SUPABASE_URL` - Your Supabase project URL
     - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (encrypt this!)
     - `PORT` - `8000`

5. **Deploy**:
   - Click "Create Resources"
   - Wait for the build and deployment to complete
   - Your API will be available at: `https://your-app-name.ondigitalocean.app/api`

#### Option 2: Using doctl CLI

1. **Update `.do/app.yaml`**:
   - Edit `.do/app.yaml` and update the GitHub repo path with your username:
     ```yaml
     github:
       repo: YOUR_GITHUB_USERNAME/auction-chess
     ```

2. **Create the app**:
   ```bash
   doctl apps create --spec .do/app.yaml
   ```

3. **Set environment variables**:
   ```bash
   # Get your app ID
   APP_ID=$(doctl apps list --format ID --no-header)

   # Set environment variables (you'll need to do this via the dashboard for secrets)
   # Or create a separate env file and update via dashboard
   ```

4. **Deploy updates** (after initial creation):
   ```bash
   bun run deploy:server:do
   ```

#### Option 3: Using App Platform YAML Spec

If you prefer to manage everything via code:

1. Update `.do/app.yaml` with your GitHub repo details
2. Set secrets via dashboard (required for sensitive data)
3. Deploy with:
   ```bash
   doctl apps create --spec .do/app.yaml
   # or update existing:
   doctl apps update YOUR_APP_ID --spec .do/app.yaml
   ```

### Environment Variables Required

Make sure to set these in Digital Ocean App Platform:

- `SUPABASE_URL` - Your Supabase project URL (e.g., `https://xxx.supabase.co`)
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (keep this secret!)
- `PORT` - `8000` (already set in app.yaml)

### Connecting Your Frontend

After deployment, update your frontend environment variables to point to your Digital Ocean API:

In `clients/web/.env.production`:
```env
VITE_API_URL=https://your-app-name.ondigitalocean.app
```

## Client Deployment to Cloudflare Pages

The frontend is deployed to Cloudflare Pages (as configured in package.json).

```bash
# Build and deploy the frontend
bun run deploy:client
```

## Database (Supabase)

The database is hosted on Supabase. To deploy database changes:

```bash
# Push database migrations
supabase db push

# Or deploy edge functions (alternative to DO)
bun run deploy:server:edge
```

## Quick Reference Commands

```bash
# Development
bun run dev                  # Start all dev servers

# Client deployment
bun run deploy:client        # Build and deploy frontend to Cloudflare

# Server deployment
bun run deploy:server:do     # Deploy server to Digital Ocean
bun run deploy:server:edge   # Deploy server to Supabase Edge Functions

# Full deployment
bun run deploy              # Deploy everything
```

## Monitoring and Logs

### Digital Ocean
- **Logs**: View in App Platform dashboard under "Runtime Logs"
- **Metrics**: CPU, Memory, and Request metrics available in dashboard
- **Alerts**: Set up alerts for downtime or resource usage

### Debugging Deployment Issues

1. **Check build logs** in Digital Ocean dashboard
2. **Verify environment variables** are set correctly
3. **Test the health check endpoint**: `https://your-app.ondigitalocean.app/api`
4. **Check Supabase connectivity** from DO logs

## Cost Optimization

- **Basic XXS instance** ($5/month) should be sufficient for development
- **Auto-scaling**: Enable if you expect variable traffic
- **Production**: Consider upgrading to Basic XS ($12/month) for better performance

## Troubleshooting

### Build fails
- Check that `server/Dockerfile` is present
- Verify all dependencies are in `package.json`
- Check build logs for specific errors

### Runtime errors
- Verify environment variables are set
- Check that `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct
- View runtime logs in DO dashboard

### CORS issues
- Update CORS settings in `server/app.ts` if needed
- Add your frontend domain to allowed origins

### Database connection fails
- Verify Supabase project is active
- Check that service role key has correct permissions
- Ensure Supabase URL is correct (should end in `.supabase.co`)

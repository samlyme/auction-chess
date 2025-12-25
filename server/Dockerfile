# Use official Bun image
FROM oven/bun:1 as base
WORKDIR /app

# Install dependencies
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# Copy production dependencies
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# Copy application code
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# Copy production dependencies and code
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /app/index.ts .
COPY --from=prerelease /app/app.ts .
COPY --from=prerelease /app/types.ts .
COPY --from=prerelease /app/middleware ./middleware
COPY --from=prerelease /app/routes ./routes
COPY --from=prerelease /app/state ./state
COPY --from=prerelease /app/utils ./utils

# Set user and expose port
USER bun
EXPOSE 8000

# Start the server
ENTRYPOINT ["bun", "run", "index.ts"]

#!/usr/bin/env bun
/**
 * Build the server code for Supabase Edge Functions
 * Bundles server/app.ts and shared/* into a single file for Deno
 */

const result = await Bun.build({
  entrypoints: ["./server/app.ts"],
  outdir: "./supabase/functions/api",
  target: "browser", // Deno runtime is similar to browser
  format: "esm",
  splitting: false,
  minify: false,
  sourcemap: "none",
  naming: {
    entry: "server.js",
  },
  external: [
    "hono",
    "hono/*",
    "@hono/zod-validator",
    "@supabase/supabase-js",
    "zod",
  ],
});

if (!result.success) {
  console.error("Build failed:");
  for (const log of result.logs) {
    console.error(log);
  }
  process.exit(1);
}

console.log("✓ Built server.js for Edge Functions");
console.log(`  Output: supabase/functions/api/server.js`);

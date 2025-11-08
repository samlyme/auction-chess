import { serve } from "bun";
import index from "./index.html";

import { Server, Origins } from "boardgame.io/server";
import { AuctionChessGame } from "./game/auctionChess";

const bgServer = Server({
  games: [AuctionChessGame],
  origins: [Origins.LOCALHOST]
})

const bgPort = 3001;
bgServer.run(bgPort)
const bgOrigin = `http://localhost:${bgPort}`;

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/": index,
  },

  async fetch(req) {
    const url = new URL(req.url);
    return fetch(`${bgOrigin}${url.pathname}${url.search}`, {
      method: req.method,
      headers: req.headers,
      body: req.body,
    });
  },


  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);

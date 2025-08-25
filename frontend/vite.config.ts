import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // Make sure this matches your Python backend's port
        changeOrigin: true,
        ws: true,
        // Optional rewrite based on your backend's API structure
        // Uncomment/modify this based on your needs (Scenario A vs B from last explanation)
        // If your frontend fetches '/api/users' but backend expects '/users':
        rewrite: (path) => path.replace(/^\/api/, ''),
        // If your frontend fetches '/api/users' AND backend expects '/api/users':
        // No rewrite needed, leave this line commented out or remove it.


        // --- ADD THIS 'configure' FUNCTION FOR DEBUGGING ---
        configure: (proxy, options) => {
          // Log errors that occur during the proxy process
          proxy.on('error', (err, req, res) => {
            console.error('[Vite Proxy Error]:', err.message, req.url);
          });

          // Log when a request is about to be proxied
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log(
              `[Vite Proxy Request]: ${req.method} ${req.originalUrl} -> ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`
            );
          });

          // Log when a response is received from the target backend
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log(
              `[Vite Proxy Response]: ${req.method} ${req.originalUrl} - Status: ${proxyRes.statusCode}`
            );
          });

          // You can also add a log for target server connection (optional)
          // proxy.on('open', (proxySocket) => {
          //   console.log('[Vite Proxy Info]: Target proxy connection opened.');
          // });
          // proxy.on('close', (res, socket, head) => {
          //   console.log('[Vite Proxy Info]: Target proxy connection closed.');
          // });
        },
        // --- END OF 'configure' FUNCTION ---
      },
    },
  },
});
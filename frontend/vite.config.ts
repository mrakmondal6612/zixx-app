import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  // Load .env variables
  const env = loadEnv(mode, process.cwd());

  // Access VITE_BACKEND_URL from env
  const backendUrl = env.VITE_BACKEND_URL;
  console.log("VITE_BACKEND_URL:", backendUrl);
  const port = parseInt(env.VITE_PORT);
  return {
    server: {
      host: "localhost",
      port: port,
      proxy: {
        "/api": {
          target: backendUrl,
          changeOrigin: true,
          // remove the leading /api from the proxied path so targets that already include
          // "/api" in VITE_BACKEND_URL don't receive /api/api/... (defensive)
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        // Support calling backend client routes from frontend without '/api' prefix.
        // Forward '/clients/*' to backend (backendUrl already contains '/api').
        "/clients": {
          target: backendUrl,
          changeOrigin: true,
        },
      },
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    
    define: {
      __BACKEND_URL__: JSON.stringify(backendUrl),
    },
  };
});

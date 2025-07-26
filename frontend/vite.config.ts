import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  // Load .env variables
  const env = loadEnv(mode, process.cwd());

  // Access VITE_BACKEND_URL from env
  const backendUrl = env.VITE_BACKEND_URL;
  const port = parseInt(env.VITE_PORT);
  return {
    server: {
      host: "localhost",
      port: port,
      proxy: {
        "/api": {
          target: backendUrl,
          changeOrigin: true,
          // rewrite: (path) => path.replace(/^\/api/, ""), // Uncomment if needed
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
      // Optional: make backend URL available in your frontend as __BACKEND_URL__
      __BACKEND_URL__: JSON.stringify(backendUrl),
    },
  };
});

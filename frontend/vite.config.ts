import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost", // or "::" if you want to expose on network
    port: 8080,
    proxy: {
      // ✅ Proxy all API calls starting with /api to the backend
      "/api": {
        target: "http://localhost:8282",
        changeOrigin: true,
        // DO NOT rewrite unless your backend doesn't include /api prefix
        // rewrite: (path) => path.replace(/^\/api/, ""), // ❌ Not needed if backend routes start with /api
      }
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
}));

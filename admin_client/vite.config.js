import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { Server } from "http";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8000,
    host: "localhost",
    proxy: {
      "/api": {
        target: "http://localhost:8282",
        changeOrigin: true,
        secure: false,
        // rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  resolve: {
    alias: {
      // Define your path aliases here
      "@components": path.resolve(__dirname, "src/components"),
      "@scenes": path.resolve(__dirname, "src/scenes"),
      "@state": path.resolve(__dirname, "src/state"),
      "@assets": path.resolve(__dirname, "src/assets"),
      theme: path.resolve(__dirname, "src/theme"),
    },
  },
});

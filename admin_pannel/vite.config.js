import { defineConfig, loadEnv } from "vite";
import path from "path";
import react from "@vitejs/plugin-react-swc";


export default defineConfig(({ mode }) => {
  // Load all envs so we can read PORT and VITE_* vars
  const env = loadEnv(mode, process.cwd(), '');
  const port = parseInt(env.PORT);
  const backendUrl = env.VITE_BACKEND_SERVER;

  return {
    plugins: [react()],
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      global: 'globalThis',
    },
    server: {
      port,
      host: "localhost",
      proxy: {
        "/api": {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        "@state": path.resolve(__dirname, "src/state"),
        "@scenes": path.resolve(__dirname, "src/scenes"),
        "@api": path.resolve(__dirname, "src/api"),
        "@clients": path.resolve(__dirname, "src/clients"),
        "@components": path.resolve(__dirname, "src/components"),
        "@hooks": path.resolve(__dirname, "src/hooks"),
        "@pages": path.resolve(__dirname, "src/pages"),
        "@sections": path.resolve(__dirname, "src/sections"),
        "@utils": path.resolve(__dirname, "src/utils"),
        "@assets": path.resolve(__dirname, "src/assets"),
        "@config": path.resolve(__dirname, "src/config"),
        "@context": path.resolve(__dirname, "src/context"),
        "@data": path.resolve(__dirname, "src/data"),
        "@lib": path.resolve(__dirname, "src/lib"),
        "@mock": path.resolve(__dirname, "src/mock"),
        "@store": path.resolve(__dirname, "src/store"),
        "@types": path.resolve(__dirname, "src/types"),
      },
      extensions: [".js", ".jsx", ".ts", ".tsx", ".json", ".mjs"],
      dedupe: ["react", "react-dom"],
    },
    optimizeDeps: {
      include: ["react", "react-dom"],
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
      },
    },
  };
});

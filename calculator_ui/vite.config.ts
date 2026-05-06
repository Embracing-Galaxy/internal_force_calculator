import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import viteCompression from "vite-plugin-compression2";
import wasm from "vite-plugin-wasm";

const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig(async () => {
  const isTauri = process.env.TAURI_ENV_FAMILY !== undefined;
  const serviceType = isTauri ? "tauri" : "wasm";

  return {
    base: "./",
    plugins: [react(), tailwindcss(), viteCompression(), wasm()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@calculator-service": path.resolve(
          __dirname,
          `./src/services/${serviceType}`,
        ),
        // jsxgraph exports field doesn't expose CSS; alias resolves it directly
        "@jsxgraph.css": path.resolve(
          __dirname,
          "node_modules/jsxgraph/distrib/jsxgraph.css",
        ),
      },
    },

    // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
    //
    // prevent vite from obscuring rust errors
    clearScreen: false,
    // Env variables starting with the item of `envPrefix` will be exposed in tauri's source code through `import.meta.env`.
    envPrefix: ["VITE_", "TAURI_ENV_*"],
    // tauri expects a fixed port, fail if that port is not available
    server: {
      port: 3070,
      strictPort: true,
      host: host || false,
      hmr: host
        ? {
            protocol: "ws",
            host,
            port: 1421,
          }
        : undefined,
      watch: {
        // tell vite to ignore watching `src-tauri`
        ignored: ["**/src-tauri/**"],
      },
      forwardConsole: {
        unhandledErrors: true,
        logLevels: ["log", "warn", "error"],
      },
    },
    optimizeDeps: {
      exclude: ["calculator_wasm"],
    },
  };
});

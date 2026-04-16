import fs from "node:fs";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import topLevelAwait from "vite-plugin-top-level-await";
import wasm from "vite-plugin-wasm";

const host = process.env.TAURI_DEV_HOST;
const wasmPkgPath = path.resolve(
  __dirname,
  "../calculator_wasm/pkg/calculator_wasm.js",
);

if (!fs.existsSync(wasmPkgPath)) {
  console.error(`
\x1b[31m╔══════════════════════════════════════════════════════════════════════════════╗
║                         WASM MODULE NOT FOUND                                ║
╠══════════════════════════════════════════════════════════════════════════════╣\x1b[0m

  The WASM module has not been built yet.
  This is a one-time setup required before development.

\x1b[33m  Run the following commands:

    rustup target add wasm32-unknown-unknown

    VERSION=$(cargo tree -p wasm-bindgen --depth 0 | head -n 1 | \\            
            cut -d' ' -f2 | cut -c 2-)

    cargo install wasm-bindgen-cli --version "$VERSION"

  Then run again to build the WASM module.                          

\x1b[31m╚══════════════════════════════════════════════════════════════════════════════╝\x1b[0m
`);
  process.exit(1);
}

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [react(), tailwindcss(), wasm(), topLevelAwait()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      calculator_wasm: wasmPkgPath,
    },
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 3000,
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
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));

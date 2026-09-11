import { createRequire } from "node:module";
import fs from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const require = createRequire(import.meta.url);

const MAPLIBRE_WORKER_FILES = {
  "/assets/maplibre-gl-worker.mjs": require.resolve(
    "maplibre-gl/dist/maplibre-gl-worker.mjs",
  ),
  "/assets/maplibre-gl-shared.mjs": require.resolve(
    "maplibre-gl/dist/maplibre-gl-shared.mjs",
  ),
};

function maplibreWorker() {
  const serve = (server) => {
    server.middlewares.use((req, res, next) => {
      const file = MAPLIBRE_WORKER_FILES[req.url?.split("?")[0] ?? ""];
      if (!file) {
        return next();
      }
      res.setHeader("Content-Type", "text/javascript; charset=utf-8");
      fs.createReadStream(file).pipe(res);
    });
  };

  return {
    name: "maplibre-worker",
    configureServer: serve,
    configurePreviewServer: serve,
    generateBundle() {
      for (const [url, file] of Object.entries(MAPLIBRE_WORKER_FILES)) {
        this.emitFile({
          type: "asset",
          fileName: url.slice(1),
          source: fs.readFileSync(file),
        });
      }
    },
  };
}

// O servidor sobe em 3000 e cai para 3001 se a porta estiver ocupada.
const apiTarget = process.env.VITE_API_TARGET || "http://localhost:3000";

export default defineConfig({
  plugins: [tailwindcss(), react(), maplibreWorker()],
  worker: {
    format: "es",
  },
  server: {
    proxy: {
      "/api": { target: apiTarget, changeOrigin: true },
      "/uploads": { target: apiTarget, changeOrigin: true },
    },
  },
});

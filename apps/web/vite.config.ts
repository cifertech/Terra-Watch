import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import cesium from "vite-plugin-cesium";
import { defineConfig } from "vite";

const webRoot = path.dirname(fileURLToPath(import.meta.url));
const cesiumBuildRoot = path.resolve(webRoot, "../../node_modules/cesium/Build");

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? "/",
  plugins: [
    react(),
    cesium({
      cesiumBuildRootPath: cesiumBuildRoot,
      cesiumBuildPath: path.join(cesiumBuildRoot, "Cesium/")
    })
  ],
  server: {
    port: 5173
  }
});

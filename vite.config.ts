import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // server: {
  //   proxy: {
  //     "/api/deepl": {
  //       target: "",
  //       changeOrigin: true,
  //       rewrite: (path) => path.replace(/^\/api\/deepl/, ""),
  //     },
  //   },
  // },
  build: {
    sourcemap: false, // Disable sourcemaps for production
    minify: "esbuild", // Minify to reduce bundle size
  },
});

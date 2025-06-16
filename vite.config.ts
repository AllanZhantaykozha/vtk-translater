import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api/deepl": {
        target: "https://api-free.deepl.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/deepl/, ""),
      },
    },
  },
});

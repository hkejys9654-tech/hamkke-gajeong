import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// GitHub Pages 주소: https://hkejys9654-tech.github.io/hamkke-gajeong/
export default defineConfig({
  base: "/hamkke-gajeong/",
  plugins: [react()],
  build: {
    assetsDir: "static",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        admin: resolve(__dirname, "admin/index.html"),
      },
    },
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  // Vercel needs this so routing works properly
  server: {
    port: 3000,
  },

  build: {
    outDir: "dist",
  },

  // Needed so Vercel serves the SPA correctly (index.html fallback)
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});

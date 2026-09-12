import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
      },
      manifest: {
        name: "틈 (TTEUM)",
        short_name: "틈",
        description: "남는 시간을, 살아본 시간으로.",
        theme_color: "#F4F1E9",
        background_color: "#F4F1E9",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/icon.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icon.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3501",
        changeOrigin: true,
      },
    },
  },
});

import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/helper/",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  plugins: [
    {
      name: "strip-csp-in-dev",
      transformIndexHtml(html, ctx) {
        if (!ctx.server) return html;
        return html.replace(/\s*<meta\s+http-equiv="Content-Security-Policy"[^>]*>/, "");
      },
    },
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: false,
      includeAssets: ["og.jpg", "icon.svg", "icon-192.png", "icon-512.png", ".nojekyll"],
      manifest: {
        name: "Helper",
        short_name: "Helper",
        description: "Unofficial SNAP and energy-help packet for people 60 and older.",
        theme_color: "#f4efe6",
        background_color: "#f4efe6",
        display: "standalone",
        start_url: "/helper/",
        scope: "/helper/",
        icons: [
          {
            src: "icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,jpg,ico,txt,webmanifest}"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: "/helper/index.html",
        navigateFallbackDenylist: [/^\/helper\/outreach/],
      },
    }),
  ],
});

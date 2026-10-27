import { resolve } from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

// O Cloudflare Pages serve o app na raiz do domínio.
const base = process.env.BASE_PATH ?? "/"

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg", "apple-touch-icon-180x180.png", "favicon.ico"],
      manifest: {
        name: "Sayang",
        short_name: "Sayang",
        description: "Marcel & Gabriela: horários lado a lado, Itaúna e Jakarta.",
        lang: "pt-BR",
        theme_color: "#1f2660",
        background_color: "#f1f3f9",
        display: "standalone",
        start_url: base,
        scope: base,
        icons: [
          { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "maskable-icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
        // entrar/ sempre vai pela rede, pra passar pelo login do Cloudflare (ver src/lib/access.ts).
        globIgnores: ["entrar/**"],
        navigateFallbackDenylist: [new RegExp(`^${base}entrar`)],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "./src"),
    },
  },
})

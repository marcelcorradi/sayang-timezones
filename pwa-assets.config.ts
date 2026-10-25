import { defineConfig, minimal2023Preset } from "@vite-pwa/assets-generator/config"

// O ícone já ocupa o quadrado inteiro e deixa o desenho dentro da área segura,
// então nenhuma variante precisa de margem extra.
export default defineConfig({
  preset: {
    ...minimal2023Preset,
    transparent: { ...minimal2023Preset.transparent, padding: 0 },
    maskable: { ...minimal2023Preset.maskable, padding: 0 },
    apple: { ...minimal2023Preset.apple, padding: 0 },
  },
  images: ["public/icon.svg"],
})

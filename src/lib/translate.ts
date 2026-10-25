import type { Lang } from "@/data/types"

interface TranslatorLike {
  translate(text: string): Promise<string>
}

interface TranslatorApi {
  availability(o: { sourceLanguage: string; targetLanguage: string }): Promise<string>
  create(o: { sourceLanguage: string; targetLanguage: string }): Promise<TranslatorLike>
}

/**
 * Tradução dentro do app quando o navegador tem tradutor embutido (Chrome no computador).
 * Se não tiver, devolve null e quem chama abre o Google Tradutor.
 */
export async function translateInline(text: string, from: Lang, to: Lang): Promise<string | null> {
  const api = (globalThis as { Translator?: TranslatorApi }).Translator
  if (!api) return null
  try {
    const options = { sourceLanguage: from, targetLanguage: to }
    if ((await api.availability(options)) === "unavailable") return null
    return await (await api.create(options)).translate(text)
  } catch {
    return null
  }
}

export function googleTranslateUrl(text: string, from: Lang, to: Lang) {
  const params = new URLSearchParams({ sl: from, tl: to, text, op: "translate" })
  return `https://translate.google.com/?${params}`
}

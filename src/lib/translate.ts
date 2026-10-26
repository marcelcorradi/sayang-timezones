import type { Lang } from "@/data/types"

interface TranslatorLike {
  translate(text: string): Promise<string>
}

interface TranslatorApi {
  availability(o: { sourceLanguage: string; targetLanguage: string }): Promise<string>
  create(o: { sourceLanguage: string; targetLanguage: string }): Promise<TranslatorLike>
}

const cache = new Map<string, Promise<string | null>>()

/**
 * Tradução dentro do app: primeiro o tradutor embutido do navegador (Chrome no computador),
 * que não manda o texto pra fora; senão o Google Tradutor, que funciona em qualquer celular.
 * Devolve null sem rede, e quem chama mostra o original.
 */
export function translateInline(text: string, from: Lang, to: Lang): Promise<string | null> {
  const key = `${from}>${to}:${text}`
  let result = cache.get(key)
  if (!result) {
    result = translateUncached(text, from, to)
    cache.set(key, result)
    // Uma falha não fica guardada: na próxima vez tenta de novo.
    result.then((r) => r ?? cache.delete(key))
  }
  return result
}

async function translateUncached(text: string, from: Lang, to: Lang) {
  return (await translateBuiltIn(text, from, to)) ?? (await translateGoogle(text, from, to))
}

async function translateBuiltIn(text: string, from: Lang, to: Lang): Promise<string | null> {
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

async function translateGoogle(text: string, from: Lang, to: Lang): Promise<string | null> {
  try {
    const params = new URLSearchParams({ client: "gtx", sl: from, tl: to, dt: "t", q: text })
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?${params}`)
    if (!res.ok) return null
    // [[["trecho traduzido", "trecho original", …], …], …]
    const body = (await res.json()) as [[string, string][]]
    return body[0].map((part) => part[0]).join("") || null
  } catch {
    return null
  }
}

export function googleTranslateUrl(text: string, from: Lang, to: Lang) {
  const params = new URLSearchParams({ sl: from, tl: to, text, op: "translate" })
  return `https://translate.google.com/?${params}`
}

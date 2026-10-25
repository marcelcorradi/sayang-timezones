import type { Lang } from "@/data/types"

/** Pronúncia pela voz do próprio celular (Web Speech API). Não precisa de internet nem de chave. */
const LOCALES: Record<Lang, string> = { pt: "pt-BR", en: "en-US", id: "id-ID" }

export const canSpeak = () => typeof window !== "undefined" && "speechSynthesis" in window

function voiceFor(lang: Lang) {
  const voices = window.speechSynthesis.getVoices()
  const locale = LOCALES[lang].toLowerCase()
  return (
    voices.find((v) => v.lang.replace("_", "-").toLowerCase() === locale) ??
    voices.find((v) => v.lang.toLowerCase().startsWith(locale.slice(0, 2)))
  )
}

/** Se o aparelho tem voz nesse idioma. As vozes carregam aos poucos, então "não sei ainda" conta como sim. */
export function hasVoice(lang: Lang) {
  if (!canSpeak()) return false
  const voices = window.speechSynthesis.getVoices()
  return voices.length === 0 || voiceFor(lang) !== undefined
}

export function speak(text: string, lang: Lang) {
  if (!canSpeak()) return
  const synth = window.speechSynthesis
  synth.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = LOCALES[lang]
  const voice = voiceFor(lang)
  if (voice) utterance.voice = voice
  utterance.rate = 0.9
  synth.speak(utterance)
}

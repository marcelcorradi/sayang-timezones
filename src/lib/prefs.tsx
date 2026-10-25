import * as React from "react"

import { couple } from "@/data/couple"
import type { Lang, PersonId } from "@/data/types"
import { detectLang, translate, type TranslationKey } from "@/lib/i18n"

const STORAGE_KEY = "sayang:prefs"
const LANGS: Lang[] = ["pt", "en", "id"]

interface Prefs {
  me: PersonId | null
  lang: Lang
}

interface PrefsState extends Prefs {
  setMe: (me: PersonId) => void
  setLang: (lang: Lang) => void
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string
}

const PrefsContext = React.createContext<PrefsState | undefined>(undefined)

const isPerson = (v: unknown): v is PersonId => typeof v === "string" && v in couple.people
const isLang = (v: unknown): v is Lang => LANGS.includes(v as Lang)

function readStored(): Partial<Prefs> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}")
  } catch {
    return {}
  }
}

/** Links compartilhados podem trazer ?me=gabriela&lang=id e já abrem configurados. */
function readInitial(): Prefs {
  const stored = readStored()
  const params = new URLSearchParams(window.location.search)
  const urlMe = params.get("me")
  const urlLang = params.get("lang")
  if (urlMe || urlLang) {
    params.delete("me")
    params.delete("lang")
    const query = params.toString()
    window.history.replaceState(null, "", window.location.pathname + (query ? `?${query}` : "") + window.location.hash)
  }
  const me = isPerson(urlMe) ? urlMe : isPerson(stored.me) ? stored.me : null
  const lang = isLang(urlLang)
    ? urlLang
    : isLang(stored.lang)
      ? stored.lang
      : me
        ? couple.people[me].defaultLang
        : detectLang()
  return { me, lang }
}

export function PrefsProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = React.useState<Prefs>(readInitial)

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
    } catch {
      // Sem armazenamento (aba anônima): as escolhas valem só nesta visita.
    }
    document.documentElement.lang = prefs.lang === "pt" ? "pt-BR" : prefs.lang
  }, [prefs])

  const value = React.useMemo<PrefsState>(
    () => ({
      ...prefs,
      setMe: (me) => setPrefs((p) => ({ me, lang: p.me ? p.lang : couple.people[me].defaultLang })),
      setLang: (lang) => setPrefs((p) => ({ ...p, lang })),
      t: (key, vars) => translate(prefs.lang, key, vars),
    }),
    [prefs]
  )

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>
}

export function usePrefs() {
  const context = React.useContext(PrefsContext)
  if (!context) throw new Error("usePrefs must be used within a PrefsProvider")
  return context
}

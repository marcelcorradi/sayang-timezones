import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { TranslateIcon } from "@hugeicons/core-free-icons"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import type { Lang } from "@/data/types"
import { usePrefs } from "@/lib/prefs"
import { googleTranslateUrl, translateInline } from "@/lib/translate"

/** Tradução automática pro idioma de quem lê; null enquanto carrega, sem rede ou no mesmo idioma. */
export function useTranslated(text: string, lang: Lang, enabled = true) {
  const { lang: myLang } = usePrefs()
  const [translation, setTranslation] = React.useState<{ key: string; text: string } | null>(null)
  const key = `${lang}>${myLang}:${text}`
  const wanted = enabled && lang !== myLang

  React.useEffect(() => {
    if (!wanted) return
    let cancelled = false
    translateInline(text, lang, myLang).then((result) => {
      if (!cancelled && result) setTranslation({ key, text: result })
    })
    return () => {
      cancelled = true
    }
  }, [wanted, key, text, lang, myLang])

  return wanted && translation?.key === key ? translation.text : null
}

/**
 * Texto escrito pelo outro, no idioma de quem lê quando der pra traduzir:
 * por padrão já aparece traduzido, com o original a um toque (`auto={false}` só oferece o botão).
 */
export function Translatable({ text, lang, auto = true, className }: { text: string; lang: Lang; auto?: boolean; className?: string }) {
  const { lang: myLang, t } = usePrefs()
  const [asked, setAsked] = React.useState(false)
  const [showOriginal, setShowOriginal] = React.useState(false)
  const translation = useTranslated(text, lang, auto || asked)

  const translate = async () => {
    setAsked(true)
    if (!(await translateInline(text, lang, myLang))) window.open(googleTranslateUrl(text, lang, myLang), "_blank", "noopener")
  }

  if (auto && translation) {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <p className="whitespace-pre-line" lang={myLang}>
          {translation}
        </p>
        {showOriginal && (
          <p className="whitespace-pre-line text-muted-foreground" lang={lang}>
            {text}
          </p>
        )}
        <Button variant="ghost" size="xs" className="self-start" onClick={() => setShowOriginal((v) => !v)}>
          <HugeiconsIcon icon={TranslateIcon} strokeWidth={2} data-icon="inline-start" />
          {showOriginal ? t("hideOriginal") : t("showOriginal")}
        </Button>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <p className="whitespace-pre-line" lang={lang}>
        {text}
      </p>
      {translation && (
        <p className="whitespace-pre-line text-muted-foreground" lang={myLang}>
          {translation}
        </p>
      )}
      {lang !== myLang && !translation && (
        <Button variant="ghost" size="xs" className="self-start" onClick={translate}>
          <HugeiconsIcon icon={TranslateIcon} strokeWidth={2} data-icon="inline-start" />
          {t("translate")}
        </Button>
      )}
    </div>
  )
}

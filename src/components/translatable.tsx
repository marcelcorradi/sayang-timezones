import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { TranslateIcon } from "@hugeicons/core-free-icons"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import type { Lang } from "@/data/types"
import { usePrefs } from "@/lib/prefs"
import { googleTranslateUrl, translateInline } from "@/lib/translate"

/** Texto escrito pelo outro, com um botão de traduzir quando está em outro idioma. */
export function Translatable({ text, lang, className }: { text: string; lang: Lang; className?: string }) {
  const { lang: myLang, t } = usePrefs()
  const [translation, setTranslation] = React.useState<string | null>(null)

  const translate = async () => {
    const inline = await translateInline(text, lang, myLang)
    if (inline) setTranslation(inline)
    else window.open(googleTranslateUrl(text, lang, myLang), "_blank", "noopener")
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

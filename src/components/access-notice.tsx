import { HugeiconsIcon } from "@hugeicons/react"
import { Login03Icon } from "@hugeicons/core-free-icons"

import { LOGIN_URL, useAccessExpired } from "@/lib/access"
import { usePrefs } from "@/lib/prefs"

/** Aparece só quando a sessão do Cloudflare venceu: o app segue funcionando, mas sem novidades. */
export function AccessNotice() {
  const { t } = usePrefs()
  const expired = useAccessExpired()

  if (!expired) return null

  return (
    <a
      href={LOGIN_URL}
      className="mb-3 flex items-center gap-3 rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground"
    >
      <HugeiconsIcon icon={Login03Icon} strokeWidth={2} className="size-5 shrink-0 text-foreground" />
      <span>{t("accessExpired")}</span>
    </a>
  )
}

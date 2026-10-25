import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { FavouriteIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { VaultCta } from "@/components/vault-setup"
import { couple } from "@/data/couple"
import type { PersonId } from "@/data/types"
import { translate, type TranslationKey } from "@/lib/i18n"
import { PERSON_LOOK } from "@/lib/look"
import { recentToques, sendToque, topicFor, type Toque } from "@/lib/ntfy"
import { usePrefs } from "@/lib/prefs"
import { formatClock, HOUR, localParts } from "@/lib/time"
import { useVault } from "@/lib/vault/vault"

type Kind = "thinking" | "callMe" | "free" | "morning" | "night"

const KINDS: Record<Kind, { button: TranslationKey; message: TranslationKey }> = {
  thinking: { button: "toqueThinking", message: "msgThinking" },
  callMe: { button: "toqueCallMe", message: "msgCallMe" },
  free: { button: "toqueFree", message: "msgFree" },
  morning: { button: "toqueMorning", message: "msgMorning" },
  night: { button: "toqueNight", message: "msgNight" },
}

/** Toques rápidos que chegam como notificação no celular do outro (via ntfy). */
export function Toques({ me, partner, now }: { me: PersonId; partner: PersonId; now: number }) {
  const { t } = usePrefs()
  const { doc, state } = useVault()
  const [sent, setSent] = React.useState<{ kind: Kind; ok: boolean } | null>(null)
  const received = useReceived(doc ? topicFor(doc.ntfyTopic, me) : null, now)

  if (!doc) {
    return state.status === "loading" ? null : <VaultCta className="self-center" />
  }

  const send = async (kind: Kind) => {
    const partnerLang = couple.people[partner].defaultLang
    const myName = couple.people[me].name
    try {
      await sendToque(topicFor(doc.ntfyTopic, partner), myName, translate(partnerLang, KINDS[kind].message, { name: myName }))
      setSent({ kind, ok: true })
    } catch {
      setSent({ kind, ok: false })
    }
    setTimeout(() => setSent(null), 2500)
  }

  const label = (kind: Kind) => (sent?.kind === kind ? t(sent.ok ? "toqueSent" : "toqueError") : t(KINDS[kind].button))
  const hour = localParts(now, couple.people[me].timeZone).hour
  const greeting: Kind | null = hour >= 4 && hour < 12 ? "morning" : hour >= 19 || hour < 4 ? "night" : null

  return (
    <div className="flex flex-col items-center gap-2">
      {received && (
        <p className="text-center text-sm">
          {received.message} <span className="text-muted-foreground">{formatClock(received.time, couple.people[me].timeZone)}</span>
        </p>
      )}
      <Button size="lg" className={PERSON_LOOK[partner].button} onClick={() => send("thinking")}>
        <HugeiconsIcon icon={FavouriteIcon} strokeWidth={2} data-icon="inline-start" />
        {label("thinking")}
      </Button>
      <div className="flex flex-wrap justify-center gap-2">
        {(["callMe", "free", ...(greeting ? [greeting] : [])] as Kind[]).map((kind) => (
          <Button key={kind} variant="outline" size="sm" onClick={() => send(kind)}>
            {label(kind)}
          </Button>
        ))}
      </div>
    </div>
  )
}

/** O último toque recebido nas últimas 6h. */
function useReceived(topic: string | null, now: number) {
  const [last, setLast] = React.useState<Toque | null>(null)
  const minute = Math.floor(now / 60_000)

  React.useEffect(() => {
    if (!topic) return
    let cancelled = false
    recentToques(topic)
      .then((list) => !cancelled && setLast(list.at(-1) ?? null))
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [topic, minute])

  return last && now - last.time < 6 * HOUR ? last : null
}

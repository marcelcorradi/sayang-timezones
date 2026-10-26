import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"

import { Translatable, useTranslated } from "@/components/translatable"
import { VaultCta } from "@/components/vault-setup"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field } from "@/components/ui/field"
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { couple } from "@/data/couple"
import type { PersonId } from "@/data/types"
import { usePrefs } from "@/lib/prefs"
import { randomId } from "@/lib/vault/crypto"
import type { Reason } from "@/lib/vault/types"
import { useVault } from "@/lib/vault/vault"

const pickRandom = <T,>(list: T[]): T | null => list[Math.floor(Math.random() * list.length)] ?? null

/** O meu pote tem os motivos que o outro escreveu pra mim. */
export function Jar({ me, partner }: { me: PersonId; partner: PersonId }) {
  const { t } = usePrefs()
  const { doc, state, update } = useVault()
  const [drawn, setDrawn] = React.useState<Reason | null>(null)
  const partnerName = couple.people[partner].name

  const mine = doc?.reasons.filter((r) => r.from === partner) ?? []
  const unread = mine.filter((r) => !r.readAt)
  const read = mine.filter((r) => r.readAt).sort((a, b) => b.readAt!.localeCompare(a.readAt!))
  const given = doc?.reasons.filter((r) => r.from === me).length ?? 0

  // Sorteio só entre os que ainda não li; os lidos ficam na lista pra reler.
  const draw = () => {
    const reason = pickRandom(unread)
    if (!reason) return
    setDrawn(reason)
    update((d) => {
      const found = d.reasons.find((r) => r.id === reason.id)
      if (found && !found.readAt) found.readAt = new Date().toISOString()
    })
  }

  const description = !mine.length
    ? t("jarEmpty", { name: partnerName })
    : unread.length === 1
      ? t("jarOneUnread", { name: partnerName })
      : unread.length
        ? t("jarUnread", { n: unread.length, name: partnerName })
        : t("jarAllRead", { name: partnerName })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl font-semibold">{t("jarTitle")}</CardTitle>
        <CardDescription>{doc && description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <JarArt count={unread.length} color={partner === "marcel" ? "var(--ipe)" : "var(--orchid)"} />
        {drawn && (
          <div className="w-full -rotate-1 rounded-xl bg-[#fffaf0] px-4 py-3 text-base text-[#1b2140] shadow-sm ring-1 ring-black/5">
            <Translatable text={drawn.text} lang={drawn.lang} />
          </div>
        )}
        {!doc && state.status !== "loading" && <VaultCta />}
      </CardContent>
      {doc && (
        <CardFooter className="flex flex-col gap-2">
          {unread.length > 0 && (
            <Button size="lg" className="w-full" onClick={draw}>
              {t("jarDraw")}
            </Button>
          )}
          {read.length > 0 && <ReadReasons reasons={read} onPick={setDrawn} />}
          <AddReason me={me} partner={partner} />
          {given > 0 && (
            <p className="text-xs text-muted-foreground">{t("jarYours", { n: given, name: partnerName })}</p>
          )}
        </CardFooter>
      )}
    </Card>
  )
}

/** Os motivos que já saíram do pote, pra escolher qual reler. */
function ReadReasons({ reasons, onPick }: { reasons: Reason[]; onPick: (reason: Reason) => void }) {
  const { t } = usePrefs()
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="ghost" className="w-full" />}>
        {t("jarReadList", { n: reasons.length })}
      </SheetTrigger>
      <SheetContent side="bottom" className="mx-auto max-h-[85svh] max-w-md overflow-y-auto rounded-t-3xl pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <SheetHeader className="pr-14">
          <SheetTitle>{t("jarReadTitle")}</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-2 px-6">
          {reasons.map((r) => (
            <ReadRow
              key={r.id}
              reason={r}
              onClick={() => {
                onPick(r)
                setOpen(false)
              }}
            />
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function ReadRow({ reason, onClick }: { reason: Reason; onClick: () => void }) {
  const text = useTranslated(reason.text, reason.lang) ?? reason.text
  return (
    <button
      className="truncate rounded-2xl bg-muted/60 px-3 py-2.5 text-left outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50"
      onClick={onClick}
    >
      {text.split("\n")[0]}
    </button>
  )
}

function AddReason({ me, partner }: { me: PersonId; partner: PersonId }) {
  const { lang, t } = usePrefs()
  const { update, saving } = useVault()
  const [open, setOpen] = React.useState(false)
  const [text, setText] = React.useState("")
  const title = t("jarAdd", { name: couple.people[partner].name })

  const save = async () => {
    const ok = await update((d) => {
      d.reasons.push({ id: randomId(), from: me, text: text.trim(), lang, createdAt: new Date().toISOString() })
    })
    if (ok) {
      setText("")
      setOpen(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="outline" className="w-full" />}>
        <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
        {title}
      </SheetTrigger>
      <SheetContent side="bottom" className="mx-auto max-w-md rounded-t-3xl pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <SheetHeader className="pr-14">
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <div className="px-6">
          <Field>
            <Textarea
              autoFocus
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("jarPlaceholder")}
              aria-label={title}
            />
          </Field>
        </div>
        <SheetFooter>
          <Button size="lg" disabled={saving || !text.trim()} onClick={save}>
            {saving ? t("saving") : t("send")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

/** Pote de vidro com um papelzinho dobrado para cada motivo (até 28 aparecem). */
function JarArt({ count, color }: { count: number; color: string }) {
  const slips = Array.from({ length: Math.min(count, 28) }, (_, i) => {
    // Posições fixas por índice: o pote enche de baixo para cima sem "pular" a cada render.
    const row = Math.floor(i / 4)
    const col = i % 4
    const x = 32 + col * 17 + (row % 2) * 6 + ((i * 7) % 4)
    const y = 146 - row * 11 - ((i * 3) % 4)
    const rotate = ((i * 37) % 50) - 25
    const fill = i % 3 === 0 ? "var(--together)" : i % 3 === 1 ? color : "#f7e7c6"
    return { x, y, rotate, fill }
  })

  return (
    <svg viewBox="0 0 140 170" className="h-40 w-auto" aria-hidden>
      <rect x="42" y="8" width="56" height="16" rx="5" fill={color} />
      <rect x="38" y="22" width="64" height="8" rx="3" fill={color} opacity="0.75" />
      <path
        d="M40 30 h60 c0 8 14 12 14 26 v92 c0 10 -8 16 -18 16 h-52 c-10 0 -18 -6 -18 -16 v-92 c0 -14 14 -18 14 -26z"
        fill="currentColor"
        className="text-muted"
        opacity="0.55"
      />
      {slips.map((s, i) => (
        <rect
          key={i}
          x={s.x}
          y={s.y}
          width="16"
          height="9"
          rx="2"
          fill={s.fill}
          transform={`rotate(${s.rotate} ${s.x + 8} ${s.y + 4.5})`}
        />
      ))}
      <path
        d="M40 30 h60 c0 8 14 12 14 26 v92 c0 10 -8 16 -18 16 h-52 c-10 0 -18 -6 -18 -16 v-92 c0 -14 14 -18 14 -26z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        className="text-foreground/30"
      />
      <path d="M36 62 v70" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}

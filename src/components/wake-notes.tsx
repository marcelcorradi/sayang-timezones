import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Note01Icon } from "@hugeicons/core-free-icons"
import { cn } from "cn"

import { Translatable } from "@/components/translatable"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription } from "@/components/ui/field"
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { couple } from "@/data/couple"
import type { PersonId } from "@/data/types"
import { PERSON_LOOK } from "@/lib/look"
import { usePrefs } from "@/lib/prefs"
import { nextWake } from "@/lib/schedule"
import { formatClock } from "@/lib/time"
import { randomId } from "@/lib/vault/crypto"
import { useVault } from "@/lib/vault/vault"
import { whenText } from "@/lib/when"

/** Recados que o outro deixou e que já podem aparecer (quem recebe acordou). */
export function ReceivedNotes({ me, now }: { me: PersonId; now: number }) {
  const { t } = usePrefs()
  const { doc, update, saving } = useVault()
  const notes = doc?.notes.filter((n) => n.to === me && !n.seenAt && n.showAt <= now) ?? []

  return notes.map((note) => (
    <Card key={note.id} className={cn("border-l-4", note.from === "marcel" ? "border-l-ipe" : "border-l-orchid")}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading text-lg">
          <span className={cn("size-2.5 rounded-full", PERSON_LOOK[note.from].dot)} />
          {t("noteFrom", { name: couple.people[note.from].name })}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-base">
        <Translatable text={note.text} lang={note.lang} />
      </CardContent>
      <CardFooter>
        <Button
          disabled={saving}
          onClick={() =>
            update((d) => {
              const found = d.notes.find((n) => n.id === note.id)
              if (found) found.seenAt = new Date().toISOString()
            })
          }
        >
          {t("noteReceived")}
        </Button>
      </CardFooter>
    </Card>
  ))
}

/** Deixar um recado que só aparece quando o outro acordar. */
export function NoteComposer({ me, partner, now }: { me: PersonId; partner: PersonId; now: number }) {
  const { lang, t } = usePrefs()
  const { doc, update, saving } = useVault()
  const [open, setOpen] = React.useState(false)
  const [text, setText] = React.useState("")
  if (!doc) return null

  const partnerName = couple.people[partner].name
  const myTz = couple.people[me].timeZone
  const showAt = nextWake(partner, now)
  const pending = doc.notes.filter((n) => n.from === me && !n.seenAt).length

  const send = async () => {
    const ok = await update((d) => {
      d.notes.push({ id: randomId(), from: me, to: partner, text: text.trim(), lang, showAt, createdAt: new Date().toISOString() })
      // Recados vistos há mais de 30 dias saem do cofre, para ele não crescer à toa.
      d.notes = d.notes.filter((n) => !n.seenAt || Date.now() - Date.parse(n.seenAt) < 30 * 86_400_000)
    })
    if (ok) {
      setText("")
      setOpen(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="ghost" />}>
          <HugeiconsIcon icon={Note01Icon} strokeWidth={2} data-icon="inline-start" />
          {t("noteWrite", { name: partnerName })}
        </SheetTrigger>
        <SheetContent side="bottom" className="mx-auto max-w-md rounded-t-3xl pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <SheetHeader className="pr-14">
            <SheetTitle>{t("noteWrite", { name: partnerName })}</SheetTitle>
          </SheetHeader>
          <div className="px-6">
            <Field>
              <Textarea
                autoFocus
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t("notePlaceholder", { name: partnerName })}
                aria-label={t("noteWrite", { name: partnerName })}
              />
              <FieldDescription>
                {t("noteWhen", { name: partnerName, when: whenText(showAt, now, myTz, lang) })}{" "}
                ({t("forPartner", { time: formatClock(showAt, couple.people[partner].timeZone), name: partnerName })})
              </FieldDescription>
            </Field>
          </div>
          <SheetFooter>
            <Button size="lg" disabled={saving || !text.trim()} onClick={send}>
              {saving ? t("saving") : t("send")}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      {pending > 0 && <p className="text-xs text-muted-foreground">{t("notePending", { name: partnerName })}</p>}
    </div>
  )
}

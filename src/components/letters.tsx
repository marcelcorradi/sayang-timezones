import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { LockIcon, Mail01Icon, MailOpen01Icon } from "@hugeicons/core-free-icons"

import { Translatable } from "@/components/translatable"
import { VaultCta } from "@/components/vault-setup"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { couple } from "@/data/couple"
import type { DateKey, PersonId } from "@/data/types"
import type { TranslationKey } from "@/lib/i18n"
import { usePrefs } from "@/lib/prefs"
import { addDays, daysBetween, formatDateKey, localParts } from "@/lib/time"
import { randomId } from "@/lib/vault/crypto"
import type { Feeling, Letter } from "@/lib/vault/types"
import { useVault } from "@/lib/vault/vault"

const FEELINGS: Record<Feeling, TranslationKey> = {
  miss: "feelMiss",
  sad: "feelSad",
  badDay: "feelBadDay",
  cantSleep: "feelCantSleep",
  happy: "feelHappy",
  laugh: "feelLaugh",
}

function useLetterTitle() {
  const { lang, t } = usePrefs()
  return (letter: Letter) =>
    "feeling" in letter.when
      ? t(FEELINGS[letter.when.feeling])
      : t("letterOnDate", { date: formatDateKey(letter.when.date, lang, { day: "numeric", month: "long" }) })
}

/** Quantos dias faltam para a carta abrir (0 = já pode), no calendário de quem recebe. */
function daysUntilOpen(letter: Letter, now: number) {
  if ("feeling" in letter.when) return 0
  const today = localParts(now, couple.people[letter.to].timeZone).dateKey
  return Math.max(0, daysBetween(today, letter.when.date))
}

export function Letters({ me, partner, now }: { me: PersonId; partner: PersonId; now: number }) {
  const { t } = usePrefs()
  const { doc, state } = useVault()
  const title = useLetterTitle()
  const partnerName = couple.people[partner].name
  const toMe = doc?.letters.filter((l) => l.to === me) ?? []
  const fromMe = doc?.letters.filter((l) => l.from === me) ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl font-semibold">{t("lettersTitle")}</CardTitle>
        {doc && toMe.length === 0 && <CardDescription>{t("lettersEmpty", { name: partnerName })}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {!doc && state.status !== "loading" && <VaultCta className="self-start" />}
        {toMe.map((letter) => (
          <LetterRow key={letter.id} letter={letter} now={now} />
        ))}
        {fromMe.length > 0 && (
          <>
            <Separator className="my-2" />
            <p className="text-xs font-medium text-muted-foreground">{t("lettersFromYou", { name: partnerName })}</p>
            {fromMe.map((letter) => (
              <div key={letter.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate">{title(letter)}</span>
                <Badge variant={letter.openedAt ? "default" : "secondary"}>
                  {t(letter.openedAt ? "letterOpened" : "letterClosed")}
                </Badge>
              </div>
            ))}
          </>
        )}
      </CardContent>
      {doc && (
        <CardFooter>
          <WriteLetter me={me} partner={partner} now={now} />
        </CardFooter>
      )}
    </Card>
  )
}

function LetterRow({ letter, now }: { letter: Letter; now: number }) {
  const { lang, t } = usePrefs()
  const { update } = useVault()
  const title = useLetterTitle()
  const wait = daysUntilOpen(letter, now)
  const from = couple.people[letter.from].name

  if (wait > 0) {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-muted/60 px-3 py-2.5 text-muted-foreground">
        <HugeiconsIcon icon={LockIcon} strokeWidth={2} className="size-5 shrink-0" />
        <span className="flex-1 truncate">{title(letter)}</span>
        <span className="shrink-0 text-xs">{wait === 1 ? t("letterTomorrow") : t("letterInDays", { n: wait })}</span>
      </div>
    )
  }

  const markOpened = () => {
    if (letter.openedAt) return
    update((d) => {
      const found = d.letters.find((l) => l.id === letter.id)
      if (found && !found.openedAt) found.openedAt = new Date().toISOString()
    })
  }

  return (
    <Sheet onOpenChange={(open) => open && markOpened()}>
      <SheetTrigger className="flex items-center gap-3 rounded-2xl bg-muted/60 px-3 py-2.5 text-left outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50">
        <HugeiconsIcon icon={letter.openedAt ? MailOpen01Icon : Mail01Icon} strokeWidth={2} className="size-5 shrink-0" />
        <span className="flex-1 truncate font-medium">{title(letter)}</span>
        <span className="shrink-0 text-xs text-muted-foreground">{t(letter.openedAt ? "letterOpened" : "letterOpen")}</span>
      </SheetTrigger>
      <SheetContent side="bottom" className="mx-auto max-h-[85svh] max-w-md overflow-y-auto rounded-t-3xl pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <SheetHeader className="pr-14">
          <SheetTitle className="font-heading text-xl">{title(letter)}</SheetTitle>
          <SheetDescription>
            {from}, {formatDateKey(letter.createdAt.slice(0, 10) as DateKey, lang, { day: "numeric", month: "long", year: "numeric" })}
          </SheetDescription>
        </SheetHeader>
        <Translatable text={letter.text} lang={letter.lang} className="px-6 text-base leading-relaxed" />
      </SheetContent>
    </Sheet>
  )
}

function WriteLetter({ me, partner, now }: { me: PersonId; partner: PersonId; now: number }) {
  const { lang, t } = usePrefs()
  const { update, saving } = useVault()
  const [open, setOpen] = React.useState(false)
  const [kind, setKind] = React.useState<"feeling" | "date">("feeling")
  const [feeling, setFeeling] = React.useState<Feeling>("miss")
  const tomorrow = addDays(localParts(now, couple.people[partner].timeZone).dateKey, 1)
  const [date, setDate] = React.useState<string>(tomorrow)
  const [text, setText] = React.useState("")
  const title = t("letterWrite", { name: couple.people[partner].name })

  const save = async () => {
    const ok = await update((d) => {
      d.letters.push({
        id: randomId(),
        from: me,
        to: partner,
        when: kind === "feeling" ? { feeling } : { date: date as DateKey },
        text: text.trim(),
        lang,
        createdAt: new Date().toISOString(),
      })
    })
    if (ok) {
      setText("")
      setOpen(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="outline" className="w-full" />}>
        <HugeiconsIcon icon={Mail01Icon} strokeWidth={2} data-icon="inline-start" />
        {title}
      </SheetTrigger>
      <SheetContent side="bottom" className="mx-auto max-h-[90svh] max-w-md overflow-y-auto rounded-t-3xl pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <SheetHeader className="pr-14">
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <FieldGroup className="px-6">
          <Field>
            <FieldLabel>{t("letterKind")}</FieldLabel>
            <ToggleGroup value={[kind]} onValueChange={(v) => v[0] && setKind(v[0] as typeof kind)} variant="outline">
              <ToggleGroupItem value="feeling">{t("letterKindFeeling")}</ToggleGroupItem>
              <ToggleGroupItem value="date">{t("letterKindDate")}</ToggleGroupItem>
            </ToggleGroup>
          </Field>
          {kind === "feeling" ? (
            <ToggleGroup
              value={[feeling]}
              onValueChange={(v) => v[0] && setFeeling(v[0] as Feeling)}
              orientation="vertical"
              variant="outline"
              className="w-full"
            >
              {(Object.keys(FEELINGS) as Feeling[]).map((f) => (
                <ToggleGroupItem key={f} value={f} className="justify-start">
                  {t(FEELINGS[f])}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          ) : (
            <Field>
              <Input type="date" min={tomorrow} value={date} onChange={(e) => setDate(e.target.value)} aria-label={t("letterKindDate")} />
            </Field>
          )}
          <Field>
            <Textarea
              rows={6}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("letterPlaceholder")}
              aria-label={t("letterPlaceholder")}
            />
          </Field>
        </FieldGroup>
        <SheetFooter>
          <Button size="lg" disabled={saving || !text.trim() || (kind === "date" && !date)} onClick={save}>
            {saving ? t("saving") : t("send")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

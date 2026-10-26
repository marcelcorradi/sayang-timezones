import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, Delete02Icon, FeatherIcon } from "@hugeicons/core-free-icons"
import { cn } from "cn"

import { Translatable, useTranslated } from "@/components/translatable"
import { VaultCta } from "@/components/vault-setup"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { couple } from "@/data/couple"
import type { Lang, PersonId } from "@/data/types"
import { translate, type TranslationKey } from "@/lib/i18n"
import { PERSON_LOOK } from "@/lib/look"
import { sendToque, topicFor } from "@/lib/ntfy"
import { usePrefs } from "@/lib/prefs"
import { formatClock, formatDateKey, localParts } from "@/lib/time"
import { randomId } from "@/lib/vault/crypto"
import type { Fear } from "@/lib/vault/types"
import { useVault } from "@/lib/vault/vault"

const REPLY_BORDER: Record<PersonId, string> = { marcel: "border-ipe", gabriela: "border-orchid" }

/** Tem algo do outro (o medo ou uma resposta) que eu ainda não vi. */
function isNewFor(fear: Fear, me: PersonId) {
  const seen = fear.seenAt?.[me] ?? ""
  return [fear, ...fear.replies].some((item) => item.from !== me && item.createdAt > seen)
}

const lastActivity = (fear: Fear) => fear.replies.at(-1)?.createdAt ?? fear.createdAt

/** Avisa o outro no ntfy sem o texto: o ntfy.sh recebe a mensagem sem criptografia. */
function useNotify(me: PersonId, partner: PersonId) {
  const { doc } = useVault()
  return async (key: TranslationKey) => {
    if (!doc) return
    const myName = couple.people[me].name
    try {
      await sendToque(topicFor(doc.ntfyTopic, partner), myName, translate(couple.people[partner].defaultLang, key, { name: myName }))
    } catch {
      // Sem rede: o que foi salvo continua salvo, só o aviso não chega.
    }
  }
}

export function Fears({ me, partner }: { me: PersonId; partner: PersonId }) {
  const { t } = usePrefs()
  const { doc, state } = useVault()
  const all = doc?.fears ?? []
  const hasNew = (person: PersonId) => all.some((f) => f.from === person && isNewFor(f, me))
  // Abre na aba que tem novidade; sem novidade, nos medos do outro.
  const [tab, setTab] = React.useState<PersonId>(() => (!hasNew(partner) && hasNew(me) ? me : partner))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl font-semibold">{t("fearsTitle")}</CardTitle>
        <CardDescription>{t("fearsIntro")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {!doc && state.status !== "loading" && <VaultCta className="self-start" />}
        {doc && (
          <Tabs value={tab} onValueChange={(v) => setTab(v as PersonId)}>
            <TabsList className="w-full">
              {[partner, me].map((person) => (
                <TabsTrigger key={person} value={person}>
                  <span className={cn("size-2 rounded-full", PERSON_LOOK[person].dot)} />
                  {couple.people[person].name}
                  {hasNew(person) && <span className="size-1.5 rounded-full bg-primary" aria-label={t("fearNew")} />}
                </TabsTrigger>
              ))}
            </TabsList>
            {[partner, me].map((person) => (
              <TabsContent key={person} value={person} className="flex flex-col gap-2 pt-1">
                <FearList person={person} fears={all.filter((f) => f.from === person)} me={me} partner={partner} />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
      {doc && (
        <CardFooter>
          <ShareFear me={me} partner={partner} onShared={() => setTab(me)} />
        </CardFooter>
      )}
    </Card>
  )
}

function FearList({ person, fears, me, partner }: { person: PersonId; fears: Fear[]; me: PersonId; partner: PersonId }) {
  const { t } = usePrefs()
  if (!fears.length) {
    return (
      <p className="py-2 text-sm text-muted-foreground">
        {person === me ? t("fearsEmptyMine") : t("fearsEmptyPartner", { name: couple.people[person].name })}
      </p>
    )
  }
  // Uma lista só, com os mais leves no fim: assim marcar "mais leve" não remonta a linha e a sheet continua aberta.
  const sorted = [...fears].sort(
    (a, b) => Number(!!a.easedAt) - Number(!!b.easedAt) || lastActivity(b).localeCompare(lastActivity(a)),
  )
  const firstEased = sorted.find((f) => f.easedAt)
  return sorted.map((fear) => (
    <React.Fragment key={fear.id}>
      {fear === firstEased && (
        <>
          <Separator className="my-2" />
          <p className="text-xs font-medium text-muted-foreground">{t("fearsEased")}</p>
        </>
      )}
      <FearThread fear={fear} me={me} partner={partner} />
    </React.Fragment>
  ))
}

function FearThread({ fear, me, partner }: { fear: Fear; me: PersonId; partner: PersonId }) {
  const { lang, t } = usePrefs()
  const { update, saving } = useVault()
  const notify = useNotify(me, partner)
  const [text, setText] = React.useState("")
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const mine = fear.from === me
  const fresh = isNewFor(fear, me)
  const n = fear.replies.length
  const preview = useTranslated(fear.text, fear.lang, !mine) ?? fear.text

  const withFear = (change: (f: Fear) => void) =>
    update((d) => {
      const found = d.fears?.find((f) => f.id === fear.id)
      if (found) change(found)
    })

  const markSeen = () => {
    if (!fresh) return
    withFear((f) => {
      f.seenAt = { ...f.seenAt, [me]: new Date().toISOString() }
    })
  }

  const reply = async () => {
    const now = new Date().toISOString()
    const ok = await withFear((f) => {
      f.replies.push({ id: randomId(), from: me, text: text.trim(), lang, createdAt: now })
      f.seenAt = { ...f.seenAt, [me]: now }
    })
    if (ok) {
      setText("")
      notify("fearNotifyReply")
    }
  }

  const remove = () => {
    if (!confirmDelete) return setConfirmDelete(true)
    update((d) => {
      d.fears = (d.fears ?? []).filter((f) => f.id !== fear.id)
    })
  }

  return (
    <Sheet
      onOpenChange={(isOpen) => {
        if (isOpen) markSeen()
        else setConfirmDelete(false)
      }}
    >
      <SheetTrigger className="flex items-center gap-3 rounded-2xl bg-muted/60 px-3 py-2.5 text-left outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50">
        <span className={cn("size-2 shrink-0 rounded-full", PERSON_LOOK[fear.from].dot)} />
        <span className={cn("flex-1 truncate", fear.easedAt ? "text-muted-foreground" : "font-medium")}>{preview}</span>
        {fresh ? (
          <Badge>{t("fearNew")}</Badge>
        ) : (
          n > 0 && <span className="shrink-0 text-xs text-muted-foreground">{n === 1 ? t("fearOneReply") : t("fearReplies", { n })}</span>
        )}
      </SheetTrigger>
      <SheetContent side="bottom" className="mx-auto max-h-[90svh] max-w-md overflow-y-auto rounded-t-3xl pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <SheetHeader className="pr-14">
          <SheetTitle className="font-heading text-xl">
            {mine ? t("fearMine") : t("fearOf", { name: couple.people[fear.from].name })}
          </SheetTitle>
          <SheetDescription>{when(fear.createdAt, me, lang)}</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-6">
          {mine ? (
            <p className="text-base leading-relaxed whitespace-pre-line">{fear.text}</p>
          ) : (
            <Translatable text={fear.text} lang={fear.lang} className="text-base leading-relaxed" />
          )}
          {fear.replies.map((r) => (
            <div key={r.id} className={cn("flex flex-col gap-1 border-l-[3px] pl-3", REPLY_BORDER[r.from])}>
              <span className="text-xs text-muted-foreground">
                {couple.people[r.from].name}, {when(r.createdAt, me, lang)}
              </span>
              {r.from === me ? <p className="whitespace-pre-line">{r.text}</p> : <Translatable text={r.text} lang={r.lang} />}
            </div>
          ))}
          <Field>
            <Textarea
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("fearReplyPlaceholder")}
              aria-label={t("fearReply")}
            />
          </Field>
        </div>
        <SheetFooter>
          <Button size="lg" disabled={saving || !text.trim()} onClick={reply}>
            {saving ? t("saving") : t("fearReply")}
          </Button>
          {mine && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                disabled={saving}
                onClick={() =>
                  withFear((f) => {
                    f.easedAt = f.easedAt ? undefined : new Date().toISOString()
                  })
                }
              >
                <HugeiconsIcon icon={FeatherIcon} strokeWidth={2} data-icon="inline-start" />
                {fear.easedAt ? t("fearUnease") : t("fearEase")}
              </Button>
              <Button variant={confirmDelete ? "destructive" : "ghost"} disabled={saving} onClick={remove}>
                <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} data-icon="inline-start" />
                {confirmDelete ? t("fearDeleteConfirm") : t("fearDelete")}
              </Button>
            </div>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

/** Data e hora no fuso de quem está olhando. */
function when(iso: string, me: PersonId, lang: Lang) {
  const t = Date.parse(iso)
  const tz = couple.people[me].timeZone
  return `${formatDateKey(localParts(t, tz).dateKey, lang, { day: "numeric", month: "long" })}, ${formatClock(t, tz)}`
}

function ShareFear({ me, partner, onShared }: { me: PersonId; partner: PersonId; onShared: () => void }) {
  const { lang, t } = usePrefs()
  const { update, saving } = useVault()
  const notify = useNotify(me, partner)
  const [open, setOpen] = React.useState(false)
  const [text, setText] = React.useState("")

  const save = async () => {
    const now = new Date().toISOString()
    const ok = await update((d) => {
      ;(d.fears ??= []).push({ id: randomId(), from: me, text: text.trim(), lang, createdAt: now, replies: [], seenAt: { [me]: now } })
    })
    if (ok) {
      setText("")
      setOpen(false)
      onShared()
      notify("fearNotifyNew")
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="outline" className="w-full" />}>
        <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
        {t("fearShare")}
      </SheetTrigger>
      <SheetContent side="bottom" className="mx-auto max-w-md rounded-t-3xl pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <SheetHeader className="pr-14">
          <SheetTitle>{t("fearShare")}</SheetTitle>
          <SheetDescription>{t("fearsIntro")}</SheetDescription>
        </SheetHeader>
        <div className="px-6">
          <Field>
            <Textarea
              autoFocus
              rows={5}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("fearPlaceholder")}
              aria-label={t("fearShare")}
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

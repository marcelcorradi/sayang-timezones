import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "cn"

import { Badge } from "@/components/ui/badge"
import { ACTIVITIES } from "@/data/activities"
import { couple } from "@/data/couple"
import type { PersonId } from "@/data/types"
import { usePrefs } from "@/lib/prefs"
import { PERSON_LOOK, skyFor, statusLabel } from "@/lib/look"
import { nextChange, recentWake, statusAt } from "@/lib/schedule"
import { translate } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { daysBetween, formatClock, formatDate, localParts } from "@/lib/time"

/**
 * O "céu" de uma pessoa: hora local grande sobre o céu da cidade dela agora,
 * com o que ela está fazendo e o que vem depois.
 */
export function SkyPanel({ person, viewer, now }: { person: PersonId; viewer: PersonId; now: number }) {
  const { lang, t } = usePrefs()
  const info = couple.people[person]
  const viewerTz = couple.people[viewer].timeZone
  const local = localParts(now, info.timeZone)
  const sky = skyFor(now, info)
  const status = statusAt(person, now)
  const next = nextChange(person, now)
  const isPartner = person !== viewer
  // Atividade que normalmente ocupa, mas nesta regra dá pra responder mensagem.
  const canText = status.availability === "limited" && ACTIVITIES[status.activity].availability === "busy"
  const dayDiff = daysBetween(localParts(now, viewerTz).dateKey, local.dateKey)
  const relative = dayDiff === 1 ? t("tomorrow") : dayDiff === -1 ? t("yesterday") : null

  const clock = (at: number) =>
    isPartner
      ? `${formatClock(at, info.timeZone)} (${t("forYou", { time: formatClock(at, viewerTz) })})`
      : formatClock(at, info.timeZone)

  return (
    <section
      aria-label={info.name}
      className={cn(
        "relative isolate overflow-hidden rounded-3xl px-5 pt-4 pb-5",
        sky.dark ? "text-white" : "text-[#1b2140]"
      )}
      style={{ background: sky.background }}
    >
      {sky.phase === "night" && <div aria-hidden className="stars absolute inset-0 -z-10" />}

      <header className="flex items-center gap-2 text-sm">
        <span className={cn("size-2.5 rounded-full ring-2 ring-white/60", PERSON_LOOK[person].dot)} />
        <span className="font-heading text-base font-semibold">{info.name}</span>
        <span className="truncate opacity-75">
          {info.city}, {info.region}
        </span>
        <span className="ml-auto text-lg" aria-hidden>
          {info.flag}
        </span>
      </header>

      <div className="mt-2 flex flex-wrap items-end gap-x-3 gap-y-1">
        <time
          dateTime={new Date(now).toISOString()}
          className="font-heading text-[4.5rem] leading-[0.9] font-semibold tracking-tight tabular-nums"
        >
          {formatClock(now, info.timeZone)}
        </time>
        <div className="flex flex-col items-start gap-1 pb-1 text-sm">
          {relative && (
            <Badge variant="secondary" className="bg-white/25 text-current">
              {relative}
            </Badge>
          )}
          <span className="opacity-80">
            {formatDate(now, info.timeZone, lang, { weekday: "short", day: "numeric", month: "short" })}
          </span>
        </div>
      </div>

      <div
        className={cn(
          "mt-4 flex items-center gap-2.5 rounded-2xl px-3 py-2.5",
          sky.dark ? "bg-white/12" : "bg-white/55"
        )}
      >
        <HugeiconsIcon icon={ACTIVITIES[status.activity].icon} strokeWidth={2} className="size-5 shrink-0" />
        <div className="flex min-w-0 flex-col">
          <span className="font-semibold">
            {statusLabel(status, lang)}
            {status.dayOff && <span className="font-normal opacity-75"> ({t("dayOff").toLowerCase()})</span>}
          </span>
          {(next || canText) && (
            <span className="text-sm opacity-80">
              {[next && t("until", { time: clock(next.at) }), canText && t("canText")].filter(Boolean).join(", ")}
            </span>
          )}
        </div>
      </div>

      {isPartner && recentWake(person, now) !== null && (
        <Button
          size="sm"
          className="mt-3 bg-white/85 text-[#1b2140] hover:bg-white"
          render={
            <a
              href={`https://wa.me/?text=${encodeURIComponent(translate(info.defaultLang, "msgMorning"))}`}
              target="_blank"
              rel="noreferrer"
            />
          }
        >
          {t("whatsappMorning")}
        </Button>
      )}

      {next && (
        <p className="mt-2 px-1 text-sm opacity-80">
          {t("then", { activity: statusLabel(next.status, lang), time: formatClock(next.at, info.timeZone) })}
        </p>
      )}
    </section>
  )
}

import { HugeiconsIcon } from "@hugeicons/react"
import {
  Airplane01Icon,
  CloudAngledRainZapIcon,
  CloudIcon,
  CloudLittleRainIcon,
  FavouriteIcon,
  Moon01Icon,
  SnowIcon,
  Sun01Icon,
  SunCloud01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "cn"

import { Jar } from "@/components/jar"
import { Letters } from "@/components/letters"
import { MoonCard } from "@/components/moon-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import { couple } from "@/data/couple"
import type { DateKey, Lang, PersonId } from "@/data/types"
import { useWeather } from "@/hooks/use-weather"
import { usePrefs } from "@/lib/prefs"
import { PERSON_LOOK } from "@/lib/look"
import { PEOPLE, partnerOf } from "@/lib/schedule"
import { daysBetween, formatClock, formatDateKey, localParts } from "@/lib/time"

export function UsView({ me, now }: { me: PersonId; now: number }) {
  const todayKey = localParts(now, couple.people[me].timeZone).dateKey
  // O que ainda não foi preenchido vai pro fim, pra não empurrar o resto pra baixo.
  const hasVisit = couple.nextVisit !== null && couple.nextVisit.date >= todayKey
  return (
    <div className="flex flex-col gap-4">
      {hasVisit && <Countdown todayKey={todayKey} />}
      <Jar me={me} partner={partnerOf(me)} />
      <Letters me={me} partner={partnerOf(me)} now={now} />
      <MoonCard me={me} now={now} />
      <WeatherCard now={now} />
      {couple.together && <Together todayKey={todayKey} />}
      <ImportantDates todayKey={todayKey} />
      {!hasVisit && <Countdown todayKey={todayKey} />}
      {!couple.together && <Together todayKey={todayKey} />}
    </div>
  )
}

function Countdown({ todayKey }: { todayKey: DateKey }) {
  const { lang, t } = usePrefs()
  const visit = couple.nextVisit
  const daysLeft = visit ? daysBetween(todayKey, visit.date) : null

  if (!visit || daysLeft === null || daysLeft < 0) {
    return (
      <Card>
        <Empty className="gap-2 p-5">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={Airplane01Icon} strokeWidth={2} />
            </EmptyMedia>
            <EmptyTitle>{t("countdownEmpty")}</EmptyTitle>
            <EmptyDescription>{t("countdownEmptyHint")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardDescription>{t("countdownTitle")}</CardDescription>
        <CardTitle className="font-heading text-6xl leading-none font-semibold tracking-tight tabular-nums">
          {daysLeft === 0 ? t("visitToday") : daysLeft === 1 ? t("oneDay") : t("days", { n: daysLeft })}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground">
        {visit.label?.[lang] ?? visit.label?.pt ?? formatDateKey(visit.date, lang, { day: "numeric", month: "long", year: "numeric" })}
      </CardContent>
    </Card>
  )
}

function Together({ todayKey }: { todayKey: DateKey }) {
  const { lang, t } = usePrefs()
  if (!couple.together) {
    return (
      <Card>
        <Empty className="gap-2 p-5">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={FavouriteIcon} strokeWidth={2} />
            </EmptyMedia>
            <EmptyTitle>{t("togetherEmpty")}</EmptyTitle>
            <EmptyDescription>{t("togetherEmptyHint")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </Card>
    )
  }
  const n = daysBetween(couple.together, todayKey)
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>{t("togetherTitle")}</CardDescription>
        <CardTitle className="font-heading text-3xl font-semibold tabular-nums">
          {n === 1 ? t("oneDay") : t("days", { n: n.toLocaleString(lang) })}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground">
        {formatDateKey(couple.together, lang, { day: "numeric", month: "long", year: "numeric" })}
      </CardContent>
    </Card>
  )
}

function WeatherCard({ now }: { now: number }) {
  const { t } = usePrefs()
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{t("weatherTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {PEOPLE.map((person, i) => (
          <div key={person} className="flex flex-col gap-3">
            {i > 0 && <Separator />}
            <WeatherRow person={person} now={now} />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function WeatherRow({ person, now }: { person: PersonId; now: number }) {
  const { lang, t } = usePrefs()
  const info = couple.people[person]
  const { weather, failed } = useWeather(info)
  const look = weather ? weatherLook(weather.code, weather.isDay) : null

  return (
    <div className="flex items-center gap-3">
      <span className={cn("size-2 shrink-0 rounded-full", PERSON_LOOK[person].dot)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="font-medium">{info.city}</span>
        <span className="text-xs text-muted-foreground">
          {failed && !weather ? t("weatherError") : `${look ? look.label[lang] : "…"}, ${formatClock(now, info.timeZone)}`}
        </span>
      </div>
      {look && <HugeiconsIcon icon={look.icon} strokeWidth={2} className="size-6 text-muted-foreground" />}
      <span className="w-14 text-right font-heading text-2xl font-semibold tabular-nums">
        {weather ? `${Math.round(weather.temperature)}°` : "–"}
      </span>
    </div>
  )
}

/** Códigos WMO da Open-Meteo agrupados no que importa pra quem está longe. */
function weatherLook(code: number, isDay: boolean): { icon: typeof Sun01Icon; label: Record<Lang, string> } {
  if (code === 0) return { icon: isDay ? Sun01Icon : Moon01Icon, label: { pt: "Céu limpo", en: "Clear", id: "Cerah" } }
  if (code <= 2) return { icon: SunCloud01Icon, label: { pt: "Algumas nuvens", en: "Partly cloudy", id: "Cerah berawan" } }
  if (code === 3) return { icon: CloudIcon, label: { pt: "Nublado", en: "Cloudy", id: "Berawan" } }
  if (code <= 48) return { icon: CloudIcon, label: { pt: "Neblina", en: "Fog", id: "Berkabut" } }
  if (code <= 57) return { icon: CloudLittleRainIcon, label: { pt: "Garoa", en: "Drizzle", id: "Gerimis" } }
  if (code <= 67) return { icon: CloudLittleRainIcon, label: { pt: "Chuva", en: "Rain", id: "Hujan" } }
  if (code <= 77) return { icon: SnowIcon, label: { pt: "Neve", en: "Snow", id: "Salju" } }
  if (code <= 82) return { icon: CloudLittleRainIcon, label: { pt: "Pancadas de chuva", en: "Showers", id: "Hujan sesaat" } }
  return { icon: CloudAngledRainZapIcon, label: { pt: "Tempestade", en: "Thunderstorm", id: "Hujan petir" } }
}

function ImportantDates({ todayKey }: { todayKey: DateKey }) {
  const { lang, t } = usePrefs()
  const year = Number(todayKey.slice(0, 4))
  const upcoming = couple.importantDates
    .map((d) => {
      let key = (d.date.length === 5 ? `${year}-${d.date}` : d.date) as DateKey
      if (d.date.length === 5 && key < todayKey) key = `${year + 1}-${d.date}` as DateKey
      return { ...d, key, inDays: daysBetween(todayKey, key) }
    })
    .filter((d) => d.inDays >= 0)
    .sort((a, b) => a.inDays - b.inDays)
    .slice(0, 5)

  if (!upcoming.length) return null

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{t("datesTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {upcoming.map((d) => (
          <div key={d.id} className="flex items-baseline justify-between gap-3">
            <span className="truncate">{d.label[lang] ?? d.label.pt}</span>
            <span className="shrink-0 text-muted-foreground tabular-nums">
              {formatDateKey(d.key, lang, { day: "numeric", month: "short" })}
              {" "}
              ({d.inDays === 0 ? t("today") : d.inDays === 1 ? t("oneDay") : t("days", { n: d.inDays })})
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "cn"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ACTIVITIES } from "@/data/activities"
import { couple } from "@/data/couple"
import type { DateKey, PersonId } from "@/data/types"
import { usePrefs } from "@/lib/prefs"
import { PERSON_LOOK, statusLabel } from "@/lib/look"
import { availabilityOf, dayBounds, partnerOf, segmentsBetween, talkWindows, type Segment } from "@/lib/schedule"
import { addDays, formatClock, formatDate, formatDateKey, HOUR, localParts, MINUTE } from "@/lib/time"

const HOUR_PX = 48
const PX_PER_MIN = HOUR_PX / 60

export function DayView({ me, now }: { me: PersonId; now: number }) {
  const { lang, t } = usePrefs()
  const partner = partnerOf(me)
  const myTz = couple.people[me].timeZone
  const partnerTz = couple.people[partner].timeZone
  const todayKey = localParts(now, myTz).dateKey
  const [selected, setSelected] = React.useState<DateKey>(todayKey)
  const days = React.useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(todayKey, i)), [todayKey])
  const dayKey = days.includes(selected) ? selected : todayKey

  const { start, end } = dayBounds(me, dayKey)
  const data = React.useMemo(
    () => ({
      mine: segmentsBetween(me, start, end),
      theirs: segmentsBetween(partner, start, end),
      windows: talkWindows(start, end),
    }),
    [me, partner, start, end]
  )

  const nowLine = React.useRef<HTMLDivElement>(null)
  const isToday = dayKey === todayKey
  React.useEffect(() => {
    if (isToday) nowLine.current?.scrollIntoView({ block: "center" })
  }, [isToday])

  // Meia-noite de quem está do outro lado, para marcar onde o dia dela/dele vira.
  const partnerMidnights: number[] = []
  for (let h = 1; h < 24; h++) {
    const at = start + h * HOUR
    if (localParts(at, partnerTz).minuteOfDay === 0) partnerMidnights.push(at)
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-1 px-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{t("dayTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("dayHint", { name: couple.people[partner].name })}</p>
      </header>

      <ToggleGroup
        value={[dayKey]}
        onValueChange={(value) => value[0] && setSelected(value[0] as DateKey)}
        variant="outline"
        size="sm"
        className="-mx-4 w-auto max-w-none overflow-x-auto px-4 pb-1"
      >
        {days.map((key, i) => (
          <ToggleGroupItem key={key} value={key}>
            {i === 0 ? t("today") : formatDateKey(key, lang, { weekday: "short", day: "numeric" })}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <Card size="sm">
        <CardHeader>
          <CardTitle>{t("windowsTitle")}</CardTitle>
          <CardDescription>{formatDateKey(dayKey, lang, { weekday: "long", day: "numeric", month: "long" })}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {data.windows.length === 0 && <p className="text-muted-foreground">{t("windowsEmpty")}</p>}
          {data.windows.map((w) => (
            <div key={w.start} className="flex items-center gap-3">
              <span className={cn("h-8 w-1.5 shrink-0 rounded-full", w.quality === "great" ? "bg-together" : "bg-together/35")} />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="font-heading font-semibold tabular-nums">
                  {formatClock(w.start, myTz)}–{formatClock(w.end, myTz)}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {t("forPartner", {
                    time: `${formatClock(w.start, partnerTz)}–${formatClock(w.end, partnerTz)}`,
                    name: couple.people[partner].name,
                  })}
                </span>
              </div>
              <Badge variant={w.quality === "great" ? "default" : "secondary"}>
                {t(w.quality === "great" ? "legendGreat" : "legendOk")}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-[2.75rem_1fr_0.5rem_1fr_2.75rem] gap-x-1.5 text-xs">
        <ColumnHeader person={me} />
        <span />
        <ColumnHeader person={partner} className="col-span-2" />

        <div className="relative col-span-5 mt-2" style={{ height: 24 * HOUR_PX }}>
          {Array.from({ length: 25 }, (_, h) => (
            <div
              key={h}
              className="absolute inset-x-0 flex items-start justify-between border-t border-border/70 text-muted-foreground tabular-nums"
              style={{ top: h * HOUR_PX }}
            >
              {h < 24 && (
                <>
                  <span className="-translate-y-1/2 bg-background pr-1">{formatClock(start + h * HOUR, myTz)}</span>
                  <span className="-translate-y-1/2 bg-background pl-1">{formatClock(start + h * HOUR, partnerTz)}</span>
                </>
              )}
            </div>
          ))}

          <div className="absolute inset-y-0 right-[calc(2.75rem+0.375rem)] left-[calc(2.75rem+0.375rem)] grid grid-cols-[1fr_0.5rem_1fr] gap-x-1.5">
            <Column segments={data.mine} person={me} dayStart={start} />
            <div className="relative rounded-full bg-muted">
              {data.windows.map((w) => (
                <div
                  key={w.start}
                  className={cn("absolute inset-x-0 rounded-full", w.quality === "great" ? "bg-together" : "bg-together/35")}
                  style={{ top: (w.start - start) / MINUTE * PX_PER_MIN, height: (w.end - w.start) / MINUTE * PX_PER_MIN }}
                />
              ))}
            </div>
            <Column segments={data.theirs} person={partner} dayStart={start}>
              {partnerMidnights.map((at) => (
                <div
                  key={at}
                  className="absolute inset-x-0 z-10 flex justify-center"
                  style={{ top: (at - start) / MINUTE * PX_PER_MIN }}
                >
                  <Badge variant="outline" className="-translate-y-1/2 bg-background">
                    {formatDate(at, partnerTz, lang, { weekday: "short", day: "numeric" })}
                  </Badge>
                </div>
              ))}
            </Column>
          </div>

          {isToday && now >= start && now < end && (
            <div
              ref={nowLine}
              aria-hidden
              className="absolute inset-x-0 z-20 flex items-center"
              style={{ top: (now - start) / MINUTE * PX_PER_MIN }}
            >
              <span className="size-2 -translate-x-1/2 rounded-full bg-foreground" />
              <span className="h-0.5 flex-1 bg-foreground" />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 px-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-1.5 rounded-full bg-together" /> {t("legendGreat")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-1.5 rounded-full bg-together/35" /> {t("legendOk")}
        </span>
      </div>
    </div>
  )
}

function ColumnHeader({ person, className }: { person: PersonId; className?: string }) {
  const info = couple.people[person]
  return (
    <div className={cn("col-span-2 flex items-center gap-1.5 font-medium", className)}>
      <span className={cn("size-2 rounded-full", PERSON_LOOK[person].dot)} />
      <span className="truncate">
        {info.name} <span className="text-muted-foreground">{info.city}</span>
      </span>
    </div>
  )
}

function Column({
  segments,
  person,
  dayStart,
  children,
}: {
  segments: Segment[]
  person: PersonId
  dayStart: number
  children?: React.ReactNode
}) {
  const { lang } = usePrefs()
  const tz = couple.people[person].timeZone
  return (
    <div className="relative">
      {segments.map((s) => {
        const top = ((s.start - dayStart) / MINUTE) * PX_PER_MIN
        const height = ((s.end - s.start) / MINUTE) * PX_PER_MIN
        const availability = availabilityOf(s.status)
        return (
          <div
            key={s.start}
            className={cn(
              "absolute inset-x-0 overflow-hidden rounded-lg px-1.5 py-1",
              PERSON_LOOK[person].block[availability]
            )}
            style={{ top: top + 1, height: Math.max(height - 2, 2) }}
            title={`${statusLabel(s.status, lang)} ${formatClock(s.start, tz)}–${formatClock(s.end, tz)}`}
          >
            {height >= 22 && (
              <span className="flex items-center gap-1 font-medium">
                <HugeiconsIcon icon={ACTIVITIES[s.status.activity].icon} strokeWidth={2} className="size-3.5 shrink-0" />
                <span className="truncate">{statusLabel(s.status, lang)}</span>
              </span>
            )}
            {height >= 44 && (
              <span className="block truncate opacity-75 tabular-nums">
                {formatClock(s.start, tz)}–{formatClock(s.end, tz)}
              </span>
            )}
          </div>
        )
      })}
      {children}
    </div>
  )
}

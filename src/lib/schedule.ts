import { ACTIVITIES, type Availability, type StatusId } from "@/data/activities"
import { couple } from "@/data/couple"
import type { CoupleData, DateKey, DayOff, Localized, OneOffEvent, PersonId, Weekday } from "@/data/types"
import { addDays, clockToMinutes, localParts, MINUTE, zonedToInstant } from "@/lib/time"

export const PEOPLE: PersonId[] = ["marcel", "gabriela"]

export function partnerOf(person: PersonId): PersonId {
  return person === "marcel" ? "gabriela" : "marcel"
}

export interface Status {
  activity: StatusId
  label?: Localized
  /** Só existe quando a regra muda a disponibilidade padrão da atividade. */
  availability?: Availability
  source: "free" | "rule" | "event"
  dayOff?: DayOff
}

const appliesTo = (who: PersonId | "both", person: PersonId) => who === "both" || who === person

const inRange = (key: DateKey, from?: DateKey, until?: DateKey) =>
  (!from || key >= from) && (!until || key <= until)

export function dayOffFor(person: PersonId, key: DateKey, data: CoupleData = couple) {
  return data.daysOff.find((d) => appliesTo(d.who, person) && inRange(key, d.from, d.until ?? d.from))
}

/**
 * O que a pessoa está fazendo no instante `t`.
 * Compromissos avulsos vencem a rotina; entre regras, vence a de maior prioridade
 * e, empatando, a que aparece por último no arquivo.
 */
export function statusAt(person: PersonId, t: number, data: CoupleData = couple): Status {
  const p = localParts(t, data.people[person].timeZone)
  const today = p.dateKey
  const yesterday = addDays(today, -1)
  const yesterdayWeekday = ((p.weekday + 6) % 7) as Weekday
  const m = p.minuteOfDay
  const offToday = dayOffFor(person, today, data)
  const offYesterday = dayOffFor(person, yesterday, data)

  let best = null as { priority: number; status: Status } | null
  const consider = (priority: number, status: Status) => {
    if (!best || priority >= best.priority) best = { priority, status }
  }

  for (const rule of data.rules) {
    if (!appliesTo(rule.who, person)) continue
    const s = clockToMinutes(rule.start)
    const e = clockToMinutes(rule.end)
    const crosses = e <= s
    const keep = (off: DayOff | undefined) => !off || rule.activity === "sleep"
    const status: Status = {
      activity: rule.activity,
      label: rule.label,
      availability: rule.availability,
      source: "rule",
    }
    const priority = ACTIVITIES[rule.activity].priority

    const startsToday =
      rule.days.includes(p.weekday) && inRange(today, rule.from, rule.until) && keep(offToday)
    if (startsToday && m >= s && (crosses || m < e)) consider(priority, status)

    const startedYesterday =
      crosses &&
      rule.days.includes(yesterdayWeekday) &&
      inRange(yesterday, rule.from, rule.until) &&
      keep(offYesterday)
    if (startedYesterday && m < e) consider(priority, status)
  }

  for (const event of data.events) {
    if (!appliesTo(event.who, person)) continue
    const { start, end } = eventSpan(event, person, data)
    if (t >= start && t < end) {
      consider(100 + ACTIVITIES[event.activity].priority, {
        activity: event.activity,
        label: event.label,
        source: "event",
      })
    }
  }

  const result: Status = best?.status ?? { activity: "free", source: "free" }
  return offToday ? { ...result, dayOff: offToday } : result
}

/** Início e fim de um compromisso, lidos no relógio de `clockOf` (ou de quem faz). */
export function eventSpan(event: OneOffEvent, person: PersonId, data: CoupleData = couple) {
  const tz = data.people[event.clockOf ?? person].timeZone
  const s = clockToMinutes(event.start)
  const e = clockToMinutes(event.end)
  return {
    start: zonedToInstant(event.date, s, tz),
    end: zonedToInstant(e > s ? event.date : addDays(event.date, 1), e, tz),
  }
}

export const availabilityOf = (status: Status): Availability =>
  status.availability ?? ACTIVITIES[status.activity].availability

const sameStatus = (a: Status, b: Status) =>
  a.activity === b.activity &&
  a.availability === b.availability &&
  JSON.stringify(a.label) === JSON.stringify(b.label)

export interface Segment {
  start: number
  end: number
  status: Status
}

export function segmentsBetween(person: PersonId, from: number, to: number, data: CoupleData = couple): Segment[] {
  const segments: Segment[] = []
  for (let t = from; t < to; t += MINUTE) {
    const status = statusAt(person, t, data)
    const last = segments[segments.length - 1]
    if (last && sameStatus(last.status, status)) last.end = t + MINUTE
    else segments.push({ start: t, end: t + MINUTE, status })
  }
  return segments
}

/** Início e fim do dia `key` no fuso de `person`. */
export function dayBounds(person: PersonId, key: DateKey, data: CoupleData = couple) {
  const tz = data.people[person].timeZone
  return { start: zonedToInstant(key, 0, tz), end: zonedToInstant(addDays(key, 1), 0, tz) }
}

export function nextChange(person: PersonId, t: number, data: CoupleData = couple, horizonHours = 48) {
  const current = statusAt(person, t, data)
  const start = Math.floor(t / MINUTE) * MINUTE + MINUTE
  for (let x = start; x < t + horizonHours * 60 * MINUTE; x += MINUTE) {
    const status = statusAt(person, x, data)
    if (!sameStatus(status, current)) return { at: x, status }
  }
  return null
}

export type TalkQuality = "great" | "ok" | "no"

/** great: os dois livres · ok: dá pra trocar mensagem · no: alguém dormindo ou ocupado */
export function talkQuality(a: Availability, b: Availability): TalkQuality {
  if (a === "free" && b === "free") return "great"
  const chatty = (x: Availability) => x === "free" || x === "limited"
  return chatty(a) && chatty(b) ? "ok" : "no"
}

export function talkQualityAt(t: number, data: CoupleData = couple): TalkQuality {
  return talkQuality(
    availabilityOf(statusAt("marcel", t, data)),
    availabilityOf(statusAt("gabriela", t, data))
  )
}

export interface TalkWindow {
  start: number
  end: number
  quality: Exclude<TalkQuality, "no">
}

export function talkWindows(from: number, to: number, data: CoupleData = couple, minMinutes = 20): TalkWindow[] {
  const windows: TalkWindow[] = []
  let current: TalkWindow | null = null
  for (let t = from; t < to; t += MINUTE) {
    const q = talkQualityAt(t, data)
    if (current && current.quality === q) {
      current.end = t + MINUTE
      continue
    }
    if (current) windows.push(current)
    current = q === "no" ? null : { start: t, end: t + MINUTE, quality: q }
  }
  if (current) windows.push(current)
  return windows.filter((w) => w.end - w.start >= minMinutes * MINUTE)
}

/** Próxima janela em que os dois estão livres, a partir de `t` (pode ser a atual). */
export function nextGreatWindow(t: number, data: CoupleData = couple, horizonHours = 72) {
  const from = Math.floor(t / MINUTE) * MINUTE
  return talkWindows(from, from + horizonHours * 60 * MINUTE, data).find((w) => w.quality === "great") ?? null
}

const isAsleep = (person: PersonId, t: number, data: CoupleData) => statusAt(person, t, data).activity === "sleep"

/** Quando a pessoa acorda de novo: o fim do sono atual ou, se está acordada, o fim do próximo sono. */
export function nextWake(person: PersonId, t: number, data: CoupleData = couple, horizonHours = 48) {
  let sawSleep = false
  for (let x = Math.floor(t / MINUTE) * MINUTE; x < t + horizonHours * 60 * MINUTE; x += MINUTE) {
    if (isAsleep(person, x, data)) sawSleep = true
    else if (sawSleep) return x
  }
  return t
}

/** Se a pessoa acordou nos últimos `withinMinutes`, o instante em que acordou. */
export function recentWake(person: PersonId, t: number, data: CoupleData = couple, withinMinutes = 90) {
  const start = Math.floor(t / MINUTE) * MINUTE
  if (isAsleep(person, start, data)) return null
  for (let x = start - MINUTE; x >= start - withinMinutes * MINUTE; x -= MINUTE) {
    if (isAsleep(person, x, data)) return x + MINUTE
  }
  return null
}

import type { DateKey, Lang, Weekday } from "@/data/types"

export const MINUTE = 60_000
export const HOUR = 60 * MINUTE
export const DAY = 24 * HOUR

export interface LocalParts {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  weekday: Weekday
  minuteOfDay: number
  dateKey: DateKey
}

const formatters = new Map<string, Intl.DateTimeFormat>()
const offsets = new Map<string, number>()

function partsFormatter(timeZone: string) {
  let f = formatters.get(timeZone)
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
    formatters.set(timeZone, f)
  }
  return f
}

/** Diferença do fuso para o UTC, em minutos. Cacheado por hora, porque é chamado a cada minuto da linha do tempo. */
export function offsetMinutes(t: number, timeZone: string): number {
  const key = `${timeZone}|${Math.floor(t / HOUR)}`
  const cached = offsets.get(key)
  if (cached !== undefined) return cached

  const seconds = Math.floor(t / 1000) * 1000
  const p: Record<string, number> = {}
  for (const part of partsFormatter(timeZone).formatToParts(new Date(seconds))) {
    if (part.type !== "literal") p[part.type] = Number(part.value)
  }
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second)
  const offset = Math.round((asUtc - seconds) / MINUTE)
  offsets.set(key, offset)
  return offset
}

const pad = (n: number) => String(n).padStart(2, "0")

export function toDateKey(year: number, month: number, day: number): DateKey {
  return `${year}-${pad(month)}-${pad(day)}` as DateKey
}

export function localParts(t: number, timeZone: string): LocalParts {
  const d = new Date(t + offsetMinutes(t, timeZone) * MINUTE)
  const year = d.getUTCFullYear()
  const month = d.getUTCMonth() + 1
  const day = d.getUTCDate()
  const hour = d.getUTCHours()
  const minute = d.getUTCMinutes()
  return {
    year,
    month,
    day,
    hour,
    minute,
    weekday: d.getUTCDay() as Weekday,
    minuteOfDay: hour * 60 + minute,
    dateKey: toDateKey(year, month, day),
  }
}

function parseKey(key: string) {
  const [y, m, d] = key.split("-").map(Number)
  return { y, m, d }
}

export function addDays(key: DateKey, days: number): DateKey {
  const { y, m, d } = parseKey(key)
  const date = new Date(Date.UTC(y, m - 1, d + days))
  return toDateKey(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate())
}

export function weekdayOf(key: DateKey): Weekday {
  const { y, m, d } = parseKey(key)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay() as Weekday
}

/** Dias corridos de `a` até `b` (positivo se `b` vem depois). */
export function daysBetween(a: DateKey, b: DateKey): number {
  const pa = parseKey(a)
  const pb = parseKey(b)
  return Math.round((Date.UTC(pb.y, pb.m - 1, pb.d) - Date.UTC(pa.y, pa.m - 1, pa.d)) / DAY)
}

/** O instante em que o relógio de `timeZone` marca `minuteOfDay` no dia `key`. */
export function zonedToInstant(key: DateKey, minuteOfDay: number, timeZone: string): number {
  const { y, m, d } = parseKey(key)
  const guess = Date.UTC(y, m - 1, d) + minuteOfDay * MINUTE
  const first = offsetMinutes(guess, timeZone)
  const t = guess - first * MINUTE
  const second = offsetMinutes(t, timeZone)
  return second === first ? t : guess - second * MINUTE
}

export function clockToMinutes(clock: string): number {
  const [h, m] = clock.split(":").map(Number)
  return h * 60 + m
}

export function formatClock(t: number, timeZone: string): string {
  const p = localParts(t, timeZone)
  return `${pad(p.hour)}:${pad(p.minute)}`
}

export function formatMinutes(minuteOfDay: number): string {
  return `${pad(Math.floor(minuteOfDay / 60) % 24)}:${pad(minuteOfDay % 60)}`
}

export const LOCALES: Record<Lang, string> = { pt: "pt-BR", en: "en-US", id: "id-ID" }

export function formatDate(t: number, timeZone: string, lang: Lang, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(LOCALES[lang], { timeZone, ...options }).format(t)
}

export function formatDateKey(key: DateKey, lang: Lang, options: Intl.DateTimeFormatOptions) {
  const { y, m, d } = parseKey(key)
  return new Intl.DateTimeFormat(LOCALES[lang], { timeZone: "UTC", ...options }).format(Date.UTC(y, m - 1, d))
}

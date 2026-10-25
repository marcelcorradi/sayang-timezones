import type { Lang } from "@/data/types"
import { translate } from "@/lib/i18n"
import { daysBetween, formatClock, formatDate, localParts } from "@/lib/time"

/** "hoje", "amanhã", "ontem" ou o dia da semana, sempre no fuso `timeZone`. */
export function dayWord(t: number, now: number, timeZone: string, lang: Lang) {
  const diff = daysBetween(localParts(now, timeZone).dateKey, localParts(t, timeZone).dateKey)
  if (diff === 0) return translate(lang, "today")
  if (diff === 1) return translate(lang, "tomorrow")
  if (diff === -1) return translate(lang, "yesterday")
  return formatDate(t, timeZone, lang, { weekday: "long" })
}

/** "amanhã às 21:00" */
export function whenText(t: number, now: number, timeZone: string, lang: Lang) {
  return translate(lang, "atTime", { day: dayWord(t, now, timeZone, lang), time: formatClock(t, timeZone) })
}

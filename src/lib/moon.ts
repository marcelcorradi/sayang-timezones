import { getMoonIllumination, getMoonPosition, getPosition } from "suncalc"

import type { Person } from "@/data/types"
import { MINUTE } from "@/lib/time"

/** Altura do sol em graus: guia o céu dos painéis com o nascer e o pôr do sol reais de cada cidade. */
export function sunAltitude(t: number, person: Person) {
  return getPosition(new Date(t), person.latitude, person.longitude).altitude
}

export function moonAltitude(t: number, person: Person) {
  return getMoonPosition(new Date(t), person.latitude, person.longitude).altitude
}

export type MoonPhase =
  | "new"
  | "waxingCrescent"
  | "firstQuarter"
  | "waxingGibbous"
  | "full"
  | "waningGibbous"
  | "lastQuarter"
  | "waningCrescent"

export function moonPhase(t: number) {
  const { fraction, phase, waxing } = getMoonIllumination(new Date(t))
  const names: MoonPhase[] = [
    "new",
    "waxingCrescent",
    "firstQuarter",
    "waxingGibbous",
    "full",
    "waningGibbous",
    "lastQuarter",
    "waningCrescent",
  ]
  return { fraction, phase, waxing, name: names[Math.round(phase * 8) % 8] }
}

/** Lua acima de 3° do horizonte nas duas cidades ao mesmo tempo, procurando nas próximas `hours` horas. */
export function sharedMoonWindow(t: number, a: Person, b: Person, hours = 36) {
  const step = 5 * MINUTE
  const up = (x: number) => moonAltitude(x, a) > 3 && moonAltitude(x, b) > 3
  const from = Math.floor(t / step) * step
  let start: number | null = null
  for (let x = from; x < t + hours * 60 * MINUTE; x += step) {
    if (up(x)) {
      if (start === null) start = x
    } else if (start !== null) {
      return { start, end: x }
    }
  }
  return start === null ? null : { start, end: t + hours * 60 * MINUTE }
}

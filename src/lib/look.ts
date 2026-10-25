import { ACTIVITIES, type Availability } from "@/data/activities"
import type { Lang, Person, PersonId } from "@/data/types"
import { sunAltitude } from "@/lib/moon"
import type { Status } from "@/lib/schedule"
import { localParts } from "@/lib/time"

/** Classes estáticas por pessoa (o Tailwind precisa ver os nomes completos no código). */
export const PERSON_LOOK: Record<PersonId, { dot: string; ink: string; button: string; block: Record<Availability, string> }> = {
  marcel: {
    dot: "bg-ipe",
    ink: "text-ipe-ink",
    button: "bg-ipe text-[#1b2140] hover:bg-ipe/85",
    block: {
      free: "border-l-[3px] border-ipe bg-ipe/25",
      limited: "border-l-[3px] border-dashed border-ipe bg-ipe/10",
      busy: "hatch bg-muted text-muted-foreground",
      asleep: "bg-night text-white/75",
    },
  },
  gabriela: {
    dot: "bg-orchid",
    ink: "text-orchid-ink",
    button: "bg-orchid text-white hover:bg-orchid/85",
    block: {
      free: "border-l-[3px] border-orchid bg-orchid/20",
      limited: "border-l-[3px] border-dashed border-orchid bg-orchid/10",
      busy: "hatch bg-muted text-muted-foreground",
      asleep: "bg-night text-white/75",
    },
  },
}

export function statusLabel(status: Status, lang: Lang) {
  return status.label?.[lang] ?? status.label?.pt ?? ACTIVITIES[status.activity].label[lang]
}

export type SkyPhase = "night" | "dawn" | "day" | "dusk"

const SKIES: Record<SkyPhase, { background: string; dark: boolean }> = {
  dawn: { dark: false, background: "linear-gradient(170deg, #9dbbe8 0%, #f5c7ae 62%, #f7dca0 100%)" },
  day: { dark: false, background: "linear-gradient(170deg, #b8daf7 0%, #dcecfb 60%, #eef6fd 100%)" },
  dusk: { dark: true, background: "linear-gradient(170deg, #3d3a7c 0%, #9a4f86 55%, #ee9a72 100%)" },
  night: { dark: true, background: "linear-gradient(170deg, #0f1435 0%, #1f2660 70%, #2c3477 100%)" },
}

/** O céu de verdade da cidade: pela altura do sol (crepúsculo civil entre -6° e 6°). */
export function skyFor(t: number, person: Person) {
  const altitude = sunAltitude(t, person)
  const morning = localParts(t, person.timeZone).hour < 12
  const phase: SkyPhase = altitude > 6 ? "day" : altitude < -6 ? "night" : morning ? "dawn" : "dusk"
  return { phase, ...SKIES[phase] }
}

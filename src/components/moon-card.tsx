import { cn } from "cn"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { couple } from "@/data/couple"
import type { PersonId } from "@/data/types"
import { PERSON_LOOK } from "@/lib/look"
import { moonAltitude, moonPhase, sharedMoonWindow } from "@/lib/moon"
import { usePrefs } from "@/lib/prefs"
import { PEOPLE, partnerOf } from "@/lib/schedule"
import { formatClock } from "@/lib/time"
import { whenText } from "@/lib/when"

/** A lua é a mesma para os dois: fase de hoje e quando ela está no céu das duas cidades ao mesmo tempo. */
export function MoonCard({ me, now }: { me: PersonId; now: number }) {
  const { lang, t } = usePrefs()
  const partner = partnerOf(me)
  const people = couple.people
  const moon = moonPhase(now)
  const shared = sharedMoonWindow(now, people[me], people[partner])
  const southern = PEOPLE.every((p) => people[p].latitude < 0)
  const myTz = people[me].timeZone

  return (
    <Card className="bg-night text-white ring-0">
      <CardHeader>
        <CardDescription className="text-white/70">{t("moonTitle")}</CardDescription>
        <CardTitle className="font-heading text-2xl font-semibold">{t(`moon_${moon.name}`)}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-5">
          <MoonGlyph phase={moon.phase} southern={southern} className="size-24 shrink-0" />
          <div className="flex flex-col gap-1.5 text-sm">
            <span className="text-white/70">{t("moonLit", { n: Math.round(moon.fraction * 100) })}</span>
            {PEOPLE.map((p) => (
              <span key={p} className="flex items-center gap-2">
                <span className={cn("size-2 rounded-full", PERSON_LOOK[p].dot)} />
                {people[p].city}: {moonAltitude(now, people[p]) > 0 ? t("moonUp") : t("moonDown")}
              </span>
            ))}
          </div>
        </div>
        <Separator className="bg-white/15" />
        <p className="text-base text-balance">
          {!shared
            ? t("moonNone")
            : shared.start <= now
              ? t("moonNow")
              : `${t("moonNext", { when: whenText(shared.start, now, myTz, lang) })} (${t("forPartner", {
                  time: formatClock(shared.start, people[partner].timeZone),
                  name: people[partner].name,
                })})`}
        </p>
        {southern && <p className="text-sm text-white/70">{t("moonSouth")}</p>}
      </CardContent>
    </Card>
  )
}

/**
 * Desenho da fase: metade iluminada + elipse do terminador.
 * No hemisfério sul a lua crescente é iluminada do lado esquerdo, então o desenho é espelhado.
 */
function MoonGlyph({ phase, southern, className }: { phase: number; southern: boolean; className?: string }) {
  const r = 46
  const c = 50
  const waxing = phase < 0.5
  const k = Math.cos(2 * Math.PI * phase)
  const rx = Math.abs(k) * r
  const limbSweep = waxing ? 1 : 0
  const termSweep = waxing ? (k > 0 ? 0 : 1) : k < 0 ? 0 : 1
  const lit = `M ${c} ${c - r} A ${r} ${r} 0 0 ${limbSweep} ${c} ${c + r} A ${rx} ${r} 0 0 ${termSweep} ${c} ${c - r} Z`

  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <defs>
        <radialGradient id="moon-glow" cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="#f7e7c6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#f7e7c6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={c} cy={c} r="50" fill="url(#moon-glow)" />
      <circle cx={c} cy={c} r={r} fill="#2c3477" />
      <path d={lit} fill="#f7e7c6" transform={southern ? `scale(-1 1) translate(-100 0)` : undefined} />
      <circle cx="38" cy="40" r="6" fill="#1b2140" opacity="0.08" />
      <circle cx="60" cy="62" r="9" fill="#1b2140" opacity="0.08" />
      <circle cx="62" cy="34" r="4" fill="#1b2140" opacity="0.08" />
    </svg>
  )
}

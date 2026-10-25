import { cn } from "cn"

import { couple } from "@/data/couple"
import { usePrefs } from "@/lib/prefs"
import { PERSON_LOOK } from "@/lib/look"
import { PEOPLE } from "@/lib/schedule"
import { formatClock } from "@/lib/time"

/** Primeira visita: escolher quem está olhando. */
export function Welcome({ now }: { now: number }) {
  const { setMe, t } = usePrefs()
  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col justify-center gap-8 px-6 py-10">
      <div className="flex flex-col gap-2">
        <Logo className="text-4xl" />
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{t("whoAreYou")}</h1>
        <p className="text-muted-foreground">{t("whoAreYouHint")}</p>
      </div>
      <div className="flex flex-col gap-3">
        {PEOPLE.map((p) => {
          const info = couple.people[p]
          return (
            <button
              key={p}
              type="button"
              onClick={() => setMe(p)}
              className="flex items-center gap-4 rounded-3xl border bg-card p-5 text-left transition-colors outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <span className={cn("size-3 rounded-full", PERSON_LOOK[p].dot)} />
              <span className="flex flex-1 flex-col">
                <span className="font-heading text-xl font-semibold">{info.name}</span>
                <span className="text-sm text-muted-foreground">
                  {info.city}, {info.region}
                </span>
              </span>
              <span className="font-heading text-2xl font-semibold tabular-nums">{formatClock(now, info.timeZone)}</span>
            </button>
          )
        })}
      </div>
    </main>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-heading font-bold tracking-tight", className)}>
      <span aria-hidden className="relative inline-flex">
        <span className="size-[0.55em] rounded-full bg-ipe" />
        <span className="-ml-[0.2em] size-[0.55em] rounded-full bg-orchid mix-blend-multiply dark:mix-blend-screen" />
      </span>
      Sayang
    </span>
  )
}

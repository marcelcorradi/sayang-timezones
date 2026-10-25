import { cn } from "cn"

import { SkyPanel } from "@/components/sky-panel"
import { Toques } from "@/components/toques"
import { NoteComposer, ReceivedNotes } from "@/components/wake-notes"
import { couple } from "@/data/couple"
import type { PersonId } from "@/data/types"
import { formatDuration } from "@/lib/i18n"
import { usePrefs } from "@/lib/prefs"
import { nextGreatWindow, partnerOf, talkQualityAt } from "@/lib/schedule"
import { formatClock, MINUTE, offsetMinutes } from "@/lib/time"
import { whenText } from "@/lib/when"

export function NowView({ me, now }: { me: PersonId; now: number }) {
  const partner = partnerOf(me)
  return (
    <div className="flex flex-col gap-3">
      <ReceivedNotes me={me} now={now} />
      <SkyPanel person={me} viewer={me} now={now} />
      <Bridge me={me} partner={partner} now={now} />
      <SkyPanel person={partner} viewer={me} now={now} />
      <div className="mt-2 flex flex-col gap-3">
        <Toques me={me} partner={partner} now={now} />
        <NoteComposer me={me} partner={partner} now={now} />
      </div>
    </div>
  )
}

const VERDICT = {
  great: { key: "verdictGreat", pill: "bg-together text-white", dot: "bg-white" },
  ok: { key: "verdictOk", pill: "bg-together-soft text-foreground", dot: "bg-together" },
  no: { key: "verdictNo", pill: "bg-muted text-muted-foreground", dot: "bg-muted-foreground/50" },
} as const

/** A ponte entre os dois céus: dá ou não dá pra conversar agora, e quando dá. */
function Bridge({ me, partner, now }: { me: PersonId; partner: PersonId; now: number }) {
  const { lang, t } = usePrefs()
  const myTz = couple.people[me].timeZone
  const partnerTz = couple.people[partner].timeZone
  const partnerName = couple.people[partner].name
  const quality = talkQualityAt(now)
  const verdict = VERDICT[quality]
  const slot = nextGreatWindow(now)
  const diff = offsetMinutes(now, partnerTz) - offsetMinutes(now, myTz)
  const insideWindow = slot && slot.start <= now

  return (
    <div className="flex flex-col items-center gap-1.5 py-1 text-center">
      <div className={cn("flex items-center gap-2 rounded-full px-4 py-2 font-heading font-semibold", verdict.pill)}>
        <span className={cn("size-2 rounded-full", verdict.dot, quality === "great" && "motion-safe:animate-pulse")} />
        {t(verdict.key)}
      </div>
      {slot && (
        <p className="text-sm text-balance">
          {insideWindow
            ? t("nextWindowNow", { time: formatClock(slot.end, myTz) })
            : t("nextWindow", { when: whenText(slot.start, now, myTz, lang) })}
          <span className="text-muted-foreground">
            {" "}
            ({t("forPartner", { time: formatClock(insideWindow ? slot.end : slot.start, partnerTz), name: partnerName })})
          </span>
          {!insideWindow && (
            <span className="block text-muted-foreground">
              {t("inDuration", { duration: formatDuration(slot.start - now, lang) })}
            </span>
          )}
        </p>
      )}
      {diff !== 0 && (
        <p className="text-xs text-muted-foreground">
          {t(diff > 0 ? "ahead" : "behind", { name: partnerName, diff: formatDuration(Math.abs(diff) * MINUTE, lang) })}
        </p>
      )}
    </div>
  )
}

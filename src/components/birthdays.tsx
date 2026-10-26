import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { BirthdayCakeIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { couple } from "@/data/couple"
import type { DateKey, PersonId } from "@/data/types"
import { usePrefs } from "@/lib/prefs"
import { partnerOf } from "@/lib/schedule"
import { localParts } from "@/lib/time"
import { useVault } from "@/lib/vault/vault"

/** Cada um coloca o próprio aniversário; ele aparece nas datas especiais dos dois. */
export function MyBirthday({ me, now }: { me: PersonId; now: number }) {
  const { t } = usePrefs()
  const { doc, update, saving } = useVault()
  const saved = doc?.birthdays?.[me] ?? ""
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<string>(saved)
  const today = localParts(now, couple.people[me].timeZone).dateKey

  const save = async () => {
    const ok = await update((d) => {
      d.birthdays = { ...d.birthdays, [me]: date as DateKey }
    })
    if (ok) setOpen(false)
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (next) setDate(saved)
        setOpen(next)
      }}
    >
      <SheetTrigger render={<Button variant={saved ? "ghost" : "outline"} className="w-full" />}>
        <HugeiconsIcon icon={BirthdayCakeIcon} strokeWidth={2} data-icon="inline-start" />
        {saved ? t("birthdayChange") : t("birthdayAdd")}
      </SheetTrigger>
      <SheetContent side="bottom" className="mx-auto max-w-md rounded-t-3xl pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <SheetHeader className="pr-14">
          <SheetTitle>{t("birthdayMine")}</SheetTitle>
          <SheetDescription>{t("birthdayHint", { name: couple.people[partnerOf(me)].name })}</SheetDescription>
        </SheetHeader>
        <div className="px-6">
          <Field>
            <Input type="date" max={today} value={date} onChange={(e) => setDate(e.target.value)} aria-label={t("birthdayMine")} />
          </Field>
        </div>
        <SheetFooter>
          <Button size="lg" disabled={saving || !date || date === saved} onClick={save}>
            {saving ? t("saving") : t("save")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

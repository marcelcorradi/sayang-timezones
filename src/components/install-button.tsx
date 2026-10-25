import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Download04Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useInstall } from "@/lib/install"
import type { TranslationKey } from "@/lib/i18n"
import { usePrefs } from "@/lib/prefs"

const STEPS: Record<"ios" | "android" | "inApp" | "desktop", TranslationKey[]> = {
  ios: ["installIos1", "installIos2", "installIos3"],
  android: ["installAndroid1", "installAndroid2"],
  inApp: ["installInApp"],
  desktop: ["installDesktop"],
}

/** "Instalar": usa o diálogo nativo quando o navegador oferece; senão mostra o passo a passo. */
export function InstallButton() {
  const { t } = usePrefs()
  const install = useInstall()
  const [open, setOpen] = React.useState(false)

  if (install.installed) return null

  const onClick = async () => {
    if (install.canPrompt && (await install.prompt())) return
    setOpen(true)
  }

  const steps = STEPS[install.platform]

  return (
    <>
      <Button variant="outline" size="sm" onClick={onClick}>
        <HugeiconsIcon icon={Download04Icon} strokeWidth={2} data-icon="inline-start" />
        {t("install")}
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="mx-auto max-w-md rounded-t-3xl pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <SheetHeader className="pr-14">
            <SheetTitle>{t("installTitle")}</SheetTitle>
            <SheetDescription>{t("installIntro")}</SheetDescription>
          </SheetHeader>
          <ol className="flex flex-col gap-3 px-6">
            {steps.map((key, i) => (
              <li key={key} className="flex items-start gap-3">
                {steps.length > 1 && (
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted font-heading font-semibold">
                    {i + 1}
                  </span>
                )}
                <span className="pt-0.5">{t(key)}</span>
              </li>
            ))}
          </ol>
        </SheetContent>
      </Sheet>
    </>
  )
}

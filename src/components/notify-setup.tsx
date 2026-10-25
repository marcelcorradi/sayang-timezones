import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, Notification03Icon, Tick02Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { couple } from "@/data/couple"
import type { PersonId } from "@/data/types"
import { useCopy } from "@/hooks/use-copy"
import { NTFY_APPS, sendToque, topicFor } from "@/lib/ntfy"
import { usePrefs } from "@/lib/prefs"

type Os = "android" | "ios" | "other"

function detectOs(): Os {
  const ua = navigator.userAgent
  if (/Android/i.test(ua)) return "android"
  if (/iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) return "ios"
  return "other"
}

/**
 * Passo a passo para receber os toques como notificação.
 * No Android o link ntfy:// abre o app já assinando o tópico; no iPhone é copiar e colar.
 */
export function NotifySetup({ me, baseTopic }: { me: PersonId; baseTopic: string }) {
  const { t } = usePrefs()
  const { copied, copy } = useCopy()
  const [test, setTest] = React.useState<"idle" | "sent" | "error">("idle")
  const [os] = React.useState(detectOs)
  const topic = topicFor(baseTopic, me)
  const partner = me === "marcel" ? "gabriela" : "marcel"

  const sendTest = async () => {
    try {
      await sendToque(topic, "Sayang", t("notifyTestMsg"))
      setTest("sent")
    } catch {
      setTest("error")
    }
  }

  const stores = (
    <div className="flex gap-2">
      {os !== "ios" && (
        <Button variant="outline" size="sm" render={<a href={NTFY_APPS.android} target="_blank" rel="noreferrer" />}>
          Google Play
        </Button>
      )}
      {os !== "android" && (
        <Button variant="outline" size="sm" render={<a href={NTFY_APPS.ios} target="_blank" rel="noreferrer" />}>
          App Store
        </Button>
      )}
    </div>
  )

  const copyTopic = (
    <div className="flex items-center gap-2 rounded-2xl bg-muted px-3 py-2">
      <code className="flex-1 truncate text-xs">{topic}</code>
      <Button variant="ghost" size="sm" onClick={() => copy(topic)}>
        <HugeiconsIcon icon={copied ? Tick02Icon : Copy01Icon} strokeWidth={2} data-icon="inline-start" />
        {copied ? t("copied") : t("copyTopic")}
      </Button>
    </div>
  )

  const steps: { title: string; body?: React.ReactNode }[] = [{ title: t("notifyStepInstall"), body: stores }]
  if (os === "android") {
    steps.push({
      title: t("notifyStepSubscribe"),
      body: (
        <Button
          className="self-start"
          render={<a href={`ntfy://ntfy.sh/${topic}?display=${encodeURIComponent("Sayang 💗")}`} />}
        >
          <HugeiconsIcon icon={Notification03Icon} strokeWidth={2} data-icon="inline-start" />
          {t("notifySubscribe")}
        </Button>
      ),
    })
  } else {
    steps.push({ title: t("notifyStepCopy"), body: copyTopic }, { title: t("notifyStepPaste") })
  }
  steps.push({
    title: t("notifyStepTest"),
    body: (
      <div className="flex flex-col gap-1">
        <Button variant="outline" size="sm" className="self-start" onClick={sendTest}>
          {test === "sent" ? t("notifyTestSent") : test === "error" ? t("toqueError") : t("notifyTest")}
        </Button>
        {test === "sent" && <p className="text-xs text-muted-foreground">{t("notifyAllowHint")}</p>}
      </div>
    ),
  })

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">{t("notifyHint", { name: couple.people[partner].name })}</p>
      <ol className="flex flex-col gap-3">
        {steps.map((step, i) => (
          <li key={step.title} className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted font-heading text-sm font-semibold">
              {i + 1}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-2 pt-0.5 text-sm">
              <span>{step.title}</span>
              {step.body}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

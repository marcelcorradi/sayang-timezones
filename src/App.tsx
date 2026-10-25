import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Clock01Icon, FavouriteIcon, Calendar01Icon } from "@hugeicons/core-free-icons"

import { DayView } from "@/components/day-view"
import { InstallButton } from "@/components/install-button"
import { NowView } from "@/components/now-view"
import { SettingsSheet } from "@/components/settings-sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UsView } from "@/components/us-view"
import { Logo, Welcome } from "@/components/welcome"
import { useNow } from "@/hooks/use-now"
import { usePrefs } from "@/lib/prefs"

const TABS = [
  { value: "now", icon: Clock01Icon, label: "tabNow" },
  { value: "day", icon: Calendar01Icon, label: "tabDay" },
  { value: "us", icon: FavouriteIcon, label: "tabUs" },
] as const

type Tab = (typeof TABS)[number]["value"]

export function App() {
  const { me, t } = usePrefs()
  const now = useNow()
  const [tab, setTab] = React.useState<Tab>("now")

  if (!me) return <Welcome now={now} />

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="mx-auto min-h-svh max-w-md gap-0">
      <header className="sticky top-0 z-30 flex items-center justify-between bg-background/85 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 backdrop-blur">
        <Logo className="text-xl" />
        <div className="flex items-center gap-1">
          <InstallButton />
          <SettingsSheet />
        </div>
      </header>

      <main className="px-4 pt-2 pb-28">
        <TabsContent value="now">
          <NowView me={me} now={now} />
        </TabsContent>
        <TabsContent value="day">
          <DayView me={me} now={now} />
        </TabsContent>
        <TabsContent value="us">
          <UsView me={me} now={now} />
        </TabsContent>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/90 backdrop-blur">
        <div className="mx-auto max-w-md px-4 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <TabsList className="w-full group-data-horizontal/tabs:h-12">
            {TABS.map((item) => (
              <TabsTrigger key={item.value} value={item.value} className="gap-2 rounded-3xl">
                <HugeiconsIcon icon={item.icon} strokeWidth={2} data-icon="inline-start" />
                {t(item.label)}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </nav>
    </Tabs>
  )
}

export default App

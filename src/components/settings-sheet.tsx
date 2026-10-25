import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, Settings02Icon, Tick02Icon } from "@hugeicons/core-free-icons"

import { useTheme } from "@/components/theme-provider"
import { VaultCta } from "@/components/vault-setup"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { couple } from "@/data/couple"
import type { Lang, PersonId } from "@/data/types"
import { useCopy } from "@/hooks/use-copy"
import { LANG_NAMES } from "@/lib/i18n"
import { NTFY_APPS, topicFor } from "@/lib/ntfy"
import { usePrefs } from "@/lib/prefs"
import { PEOPLE, partnerOf } from "@/lib/schedule"
import { useVault } from "@/lib/vault/vault"

export function SettingsSheet() {
  const { me, lang, setMe, setLang, t } = usePrefs()
  const { theme, setTheme } = useTheme()
  const { doc, state, setupLink, disconnect } = useVault()
  const { copied, copy } = useCopy()
  const partner = me ? partnerOf(me) : null

  // Com o cofre conectado, o link pro outro já leva a chave e a senha.
  const shareLink = () => {
    if (!partner) return ""
    const partnerLang = couple.people[partner].defaultLang
    const withVault = setupLink(partner, partnerLang)
    if (withVault && doc) return withVault
    const url = new URL(window.location.href)
    url.hash = ""
    url.search = new URLSearchParams({ me: partner, lang: partnerLang }).toString()
    return url.toString()
  }

  return (
    <Sheet>
      <SheetTrigger render={<Button variant="ghost" size="icon" aria-label={t("settings")} />}>
        <HugeiconsIcon icon={Settings02Icon} strokeWidth={2} />
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[90svh] max-w-md overflow-y-auto rounded-t-3xl pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        <SheetHeader>
          <SheetTitle>{t("settings")}</SheetTitle>
          <SheetDescription>{t("editHint")}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-5 px-6">
          <Setting label={t("whoAreYou")}>
            <ToggleGroup
              value={me ? [me] : []}
              onValueChange={(v) => v[0] && setMe(v[0] as PersonId)}
              variant="outline"
            >
              {PEOPLE.map((p) => (
                <ToggleGroupItem key={p} value={p}>
                  {couple.people[p].flag} {couple.people[p].name}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </Setting>

          <Setting label={t("language")}>
            <ToggleGroup value={[lang]} onValueChange={(v) => v[0] && setLang(v[0] as Lang)} variant="outline">
              {(Object.keys(LANG_NAMES) as Lang[]).map((l) => (
                <ToggleGroupItem key={l} value={l} lang={l}>
                  {l === "id" ? "Indonesia" : LANG_NAMES[l]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </Setting>

          <Setting label={t("theme")}>
            <ToggleGroup
              value={[theme]}
              onValueChange={(v) => v[0] && setTheme(v[0] as typeof theme)}
              variant="outline"
            >
              <ToggleGroupItem value="light">{t("themeLight")}</ToggleGroupItem>
              <ToggleGroupItem value="dark">{t("themeDark")}</ToggleGroupItem>
              <ToggleGroupItem value="system">{t("themeSystem")}</ToggleGroupItem>
            </ToggleGroup>
          </Setting>

          <Separator />

          <Setting label={t("vaultTitle")}>
            {doc ? (
              <p className="text-sm text-muted-foreground">{t("vaultConnected")}</p>
            ) : (
              state.status !== "loading" && <VaultCta className="self-start" />
            )}
          </Setting>

          {doc && me && (
            <Setting label={t("notifyTitle")}>
              <p className="text-sm text-muted-foreground">
                {t("notifyHint", { name: partner ? couple.people[partner].name : "" })}
              </p>
              <div className="flex items-center gap-2 rounded-2xl bg-muted px-3 py-2">
                <code className="flex-1 truncate text-xs">{topicFor(doc.ntfyTopic, me)}</code>
                <Button variant="ghost" size="sm" onClick={() => copy(topicFor(doc.ntfyTopic, me), "topic")}>
                  <HugeiconsIcon
                    icon={copied === "topic" ? Tick02Icon : Copy01Icon}
                    strokeWidth={2}
                    data-icon="inline-start"
                  />
                  {copied === "topic" ? t("copied") : t("copyTopic")}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" render={<a href={NTFY_APPS.android} target="_blank" rel="noreferrer" />}>
                  Android
                </Button>
                <Button variant="outline" size="sm" render={<a href={NTFY_APPS.ios} target="_blank" rel="noreferrer" />}>
                  iPhone
                </Button>
              </div>
            </Setting>
          )}

          {partner && (
            <>
              <Separator />
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="lg" onClick={() => copy(shareLink(), "share")}>
                  <HugeiconsIcon
                    icon={copied === "share" ? Tick02Icon : Copy01Icon}
                    strokeWidth={2}
                    data-icon="inline-start"
                  />
                  {copied === "share"
                    ? t("copied")
                    : t(doc ? "vaultShare" : "shareLink", { name: couple.people[partner].name })}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  {t(doc ? "vaultShareHint" : "shareLinkHint", { name: couple.people[partner].name })}
                </p>
              </div>
            </>
          )}

          {doc && (
            <Button variant="ghost" size="sm" className="self-center text-muted-foreground" onClick={disconnect}>
              {t("vaultDisconnect")}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function Setting({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </div>
  )
}

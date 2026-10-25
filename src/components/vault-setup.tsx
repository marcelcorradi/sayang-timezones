import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { SquareLock02Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import type { TranslationKey } from "@/lib/i18n"
import { usePrefs } from "@/lib/prefs"
import { useVault, type VaultError } from "@/lib/vault/vault"

const ERRORS: Record<Exclude<VaultError, "missing">, TranslationKey> = {
  "bad-token": "vaultErrBadToken",
  forbidden: "vaultErrForbidden",
  "wrong-pass": "vaultErrWrongPass",
  network: "vaultErrNetwork",
  conflict: "vaultErrConflict",
}

const TOKEN_URL = "https://github.com/settings/personal-access-tokens/new"

/** Botão que abre a configuração do cofre. Aparece onde uma função depende dele. */
export function VaultCta({ className }: { className?: string }) {
  const { t } = usePrefs()
  const [open, setOpen] = React.useState(false)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="outline" className={className} />}>
        <HugeiconsIcon icon={SquareLock02Icon} strokeWidth={2} data-icon="inline-start" />
        {t("vaultCta")}
      </SheetTrigger>
      <SheetContent side="bottom" className="mx-auto max-h-[90svh] max-w-md overflow-y-auto rounded-t-3xl pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <SheetHeader className="pr-14">
          <SheetTitle>{t("vaultTitle")}</SheetTitle>
          <SheetDescription>{t("vaultIntro")}</SheetDescription>
        </SheetHeader>
        <VaultForm onDone={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}

function VaultForm({ onDone }: { onDone: () => void }) {
  const { t } = usePrefs()
  const { connect } = useVault()
  const [token, setToken] = React.useState("")
  const [passphrase, setPassphrase] = React.useState("")
  const [error, setError] = React.useState<VaultError | null>(null)
  const [busy, setBusy] = React.useState(false)

  const submit = async (create: boolean) => {
    setBusy(true)
    const result = await connect({ token: token.trim(), passphrase }, { create })
    setBusy(false)
    setError(result)
    if (!result) onDone()
  }

  return (
    <form
      className="flex flex-col gap-5 px-6"
      onSubmit={(e) => {
        e.preventDefault()
        submit(false)
      }}
    >
      <FieldGroup>
        <Field data-invalid={error === "bad-token" || error === "forbidden" || undefined}>
          <FieldLabel htmlFor="vault-token">{t("vaultToken")}</FieldLabel>
          <Input
            id="vault-token"
            type="password"
            autoComplete="off"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            aria-invalid={error === "bad-token" || error === "forbidden" || undefined}
            required
          />
          <FieldDescription>
            {t("vaultTokenHint")}{" "}
            <a href={TOKEN_URL} target="_blank" rel="noreferrer">
              {t("vaultTokenLink")}
            </a>
          </FieldDescription>
        </Field>
        <Field data-invalid={error === "wrong-pass" || undefined}>
          <FieldLabel htmlFor="vault-pass">{t("vaultPass")}</FieldLabel>
          <Input
            id="vault-pass"
            type="password"
            autoComplete="new-password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            aria-invalid={error === "wrong-pass" || undefined}
            minLength={6}
            required
          />
          <FieldDescription>{t("vaultPassHint")}</FieldDescription>
        </Field>
        {error && error !== "missing" && <FieldError>{t(ERRORS[error])}</FieldError>}
      </FieldGroup>

      {error === "missing" ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">{t("vaultMissing")}</p>
          <Button type="button" size="lg" disabled={busy} onClick={() => submit(true)}>
            {busy ? t("saving") : t("vaultCreate")}
          </Button>
        </div>
      ) : (
        <Button type="submit" size="lg" disabled={busy || !token || passphrase.length < 6}>
          {busy ? t("saving") : t("vaultConnect")}
        </Button>
      )}
    </form>
  )
}

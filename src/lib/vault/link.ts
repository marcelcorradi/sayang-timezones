import { fromBase64 } from "./crypto"

export interface Creds {
  token: string
  passphrase: string
}

/**
 * Link de configuração: ...#vault=<base64 de {t, p}>. O que vem depois do # nunca sai do aparelho.
 * Também serve colado no app: no iPhone o app instalado não enxerga o que foi aberto no Safari.
 */
export function parseSetupLink(text: string): Creds | null {
  const match = text.match(/vault=([^&\s]+)/)
  if (!match) return null
  try {
    const { t, p } = JSON.parse(new TextDecoder().decode(fromBase64(decodeURIComponent(match[1]))))
    return typeof t === "string" && typeof p === "string" ? { token: t, passphrase: p } : null
  } catch {
    return null
  }
}

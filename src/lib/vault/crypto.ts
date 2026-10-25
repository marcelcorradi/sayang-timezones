import type { VaultDoc, VaultFile } from "./types"

const ITERATIONS = 310_000
const encoder = new TextEncoder()
const decoder = new TextDecoder()
const keys = new Map<string, Promise<CryptoKey>>()

export function toBase64(bytes: Uint8Array): string {
  let binary = ""
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary)
}

export function fromBase64(text: string): Uint8Array<ArrayBuffer> {
  const binary = atob(text)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

export function randomId(bytes = 12): string {
  return toBase64(crypto.getRandomValues(new Uint8Array(bytes))).replace(/[+/=]/g, "")
}

/** Derivar a chave é lento de propósito (PBKDF2); por isso fica em cache por senha + sal. */
function deriveKey(passphrase: string, salt: string, iterations: number) {
  const cacheKey = `${salt}|${iterations}|${passphrase}`
  let key = keys.get(cacheKey)
  if (!key) {
    key = crypto.subtle
      .importKey("raw", encoder.encode(passphrase.normalize("NFC")), "PBKDF2", false, ["deriveKey"])
      .then((base) =>
        crypto.subtle.deriveKey(
          { name: "PBKDF2", salt: fromBase64(salt), iterations, hash: "SHA-256" },
          base,
          { name: "AES-GCM", length: 256 },
          false,
          ["encrypt", "decrypt"]
        )
      )
    keys.set(cacheKey, key)
  }
  return key
}

export async function encryptDoc(doc: VaultDoc, passphrase: string, previous?: VaultFile): Promise<VaultFile> {
  const salt = previous?.salt ?? toBase64(crypto.getRandomValues(new Uint8Array(16)))
  const iterations = previous?.iterations ?? ITERATIONS
  const key = await deriveKey(passphrase, salt, iterations)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const data = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(JSON.stringify(doc)))
  return { app: "sayang", v: 1, salt, iterations, iv: toBase64(iv), data: toBase64(new Uint8Array(data)) }
}

export class WrongPassphraseError extends Error {}

export async function decryptDoc(file: VaultFile, passphrase: string): Promise<VaultDoc> {
  const key = await deriveKey(passphrase, file.salt, file.iterations)
  try {
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromBase64(file.iv) }, key, fromBase64(file.data))
    return JSON.parse(decoder.decode(plain))
  } catch {
    throw new WrongPassphraseError()
  }
}

export function emptyDoc(): VaultDoc {
  return { version: 1, ntfyTopic: `sayang-${randomId(18)}`, reasons: [], letters: [], notes: [] }
}

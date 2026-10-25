import * as React from "react"

import type { PersonId } from "@/data/types"

import { decryptDoc, emptyDoc, encryptDoc, toBase64, WrongPassphraseError } from "./crypto"
import { parseSetupLink, type Creds } from "./link"
import { githubStorage, localStorageBackend, StorageError, type StorageErrorCode, type VaultStorage } from "./storage"
import type { VaultDoc, VaultFile } from "./types"

const CREDS_KEY = "sayang:vault"
const POLL = 60_000
const useLocal = import.meta.env.VITE_VAULT_LOCAL === "1"

export type { Creds }
export { parseSetupLink }

export type VaultError = StorageErrorCode | "wrong-pass" | "missing"

type State =
  | { status: "off" }
  | { status: "loading" }
  | { status: "ready"; doc: VaultDoc }
  | { status: "error"; error: VaultError }

interface VaultContext {
  state: State
  doc: VaultDoc | null
  saving: boolean
  connect: (creds: Creds, options?: { create?: boolean }) => Promise<VaultError | null>
  disconnect: () => void
  /** Aplica `change` sobre a versão mais recente do cofre e salva. Tenta de novo se o outro salvou ao mesmo tempo. */
  update: (change: (doc: VaultDoc) => void) => Promise<boolean>
  setupLink: (person: PersonId, lang: string) => string | null
}

const Context = React.createContext<VaultContext | undefined>(undefined)

function storageFor(creds: Creds): VaultStorage {
  return useLocal ? localStorageBackend() : githubStorage(creds.token)
}

function readCreds(): Creds | null {
  const fromLink = parseSetupLink(window.location.hash)
  if (fromLink) {
    window.history.replaceState(null, "", window.location.pathname + window.location.search)
    return fromLink
  }
  try {
    return JSON.parse(localStorage.getItem(CREDS_KEY) ?? "null")
  } catch {
    return null
  }
}

function saveCreds(creds: Creds | null) {
  try {
    if (creds) localStorage.setItem(CREDS_KEY, JSON.stringify(creds))
    else localStorage.removeItem(CREDS_KEY)
  } catch {
    // Sem armazenamento: o cofre vale só nesta visita.
  }
}

async function load(creds: Creds): Promise<{ doc: VaultDoc; file: VaultFile; sha: string | null } | null> {
  const stored = await storageFor(creds).read()
  if (!stored) return null
  const file = JSON.parse(stored.text) as VaultFile
  return { doc: await decryptDoc(file, creds.passphrase), file, sha: stored.sha }
}

function toError(e: unknown): VaultError {
  if (e instanceof WrongPassphraseError) return "wrong-pass"
  if (e instanceof StorageError) return e.code
  return "network"
}

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const [creds, setCreds] = React.useState<Creds | null>(readCreds)
  const [state, setState] = React.useState<State>(() => (creds ? { status: "loading" } : { status: "off" }))
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (!creds) return
    saveCreds(creds)
    let cancelled = false
    const refresh = async (quiet: boolean) => {
      try {
        const loaded = await load(creds)
        if (cancelled) return
        setState(loaded ? { status: "ready", doc: loaded.doc } : { status: "error", error: "missing" })
      } catch (e) {
        // Num refresh em segundo plano, um erro de rede não apaga o que já está na tela.
        if (cancelled || (quiet && e instanceof StorageError && e.code === "network")) return
        setState({ status: "error", error: toError(e) })
      }
    }
    refresh(false)
    const tick = () => document.visibilityState === "visible" && refresh(true)
    const id = setInterval(tick, POLL)
    document.addEventListener("visibilitychange", tick)
    return () => {
      cancelled = true
      clearInterval(id)
      document.removeEventListener("visibilitychange", tick)
    }
  }, [creds])

  const connect = React.useCallback(async (next: Creds, options: { create?: boolean } = {}) => {
    try {
      let loaded = await load(next)
      if (!loaded) {
        if (!options.create) return "missing" as const
        const file = await encryptDoc(emptyDoc(), next.passphrase)
        await storageFor(next).write(JSON.stringify(file, null, 2), null)
        loaded = await load(next)
        if (!loaded) return "network" as const
      }
      setState({ status: "ready", doc: loaded.doc })
      setCreds(next)
      return null
    } catch (e) {
      return toError(e)
    }
  }, [])

  const disconnect = React.useCallback(() => {
    saveCreds(null)
    setCreds(null)
    setState({ status: "off" })
  }, [])

  const update = React.useCallback(
    async (change: (doc: VaultDoc) => void) => {
      if (!creds) return false
      setSaving(true)
      try {
        for (let attempt = 0; attempt < 3; attempt++) {
          const loaded = await load(creds)
          if (!loaded) return false
          const doc = structuredClone(loaded.doc)
          change(doc)
          const file = await encryptDoc(doc, creds.passphrase, loaded.file)
          try {
            await storageFor(creds).write(JSON.stringify(file, null, 2), loaded.sha)
            setState({ status: "ready", doc })
            return true
          } catch (e) {
            if (!(e instanceof StorageError && e.code === "conflict")) throw e
          }
        }
        return false
      } catch (e) {
        setState({ status: "error", error: toError(e) })
        return false
      } finally {
        setSaving(false)
      }
    },
    [creds]
  )

  const setupLink = React.useCallback(
    (person: PersonId, lang: string) => {
      if (!creds) return null
      const json = JSON.stringify({ t: creds.token, p: creds.passphrase })
      const secret = encodeURIComponent(toBase64(new TextEncoder().encode(json)))
      return `${window.location.origin}${import.meta.env.BASE_URL}?me=${person}&lang=${lang}#vault=${secret}`
    },
    [creds]
  )

  const value = React.useMemo<VaultContext>(
    () => ({
      state,
      doc: state.status === "ready" ? state.doc : null,
      saving,
      connect,
      disconnect,
      update,
      setupLink,
    }),
    [state, saving, connect, disconnect, update, setupLink]
  )

  return <Context.Provider value={value}>{children}</Context.Provider>
}

export function useVault() {
  const context = React.useContext(Context)
  if (!context) throw new Error("useVault must be used within a VaultProvider")
  return context
}

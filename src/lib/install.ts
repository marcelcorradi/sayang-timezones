import * as React from "react"

/** O evento que o Chrome/Edge/Samsung dispara quando o site pode virar app. */
interface InstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

let deferred: InstallPromptEvent | null = null
const listeners = new Set<() => void>()
const notify = () => listeners.forEach((l) => l())

/** Chamado bem cedo (main.tsx), porque o evento pode chegar antes do React montar. */
export function listenForInstall() {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault()
    deferred = e as InstallPromptEvent
    notify()
  })
  window.addEventListener("appinstalled", () => {
    deferred = null
    notify()
  })
}

export type Platform = "ios" | "android" | "inApp" | "desktop"

function detectPlatform(): Platform {
  const ua = navigator.userAgent
  // Navegadores de dentro do WhatsApp, Instagram, Facebook etc. não instalam apps.
  if (/FBAN|FBAV|Instagram|Line\/|WhatsApp|Messenger|TikTok/i.test(ua)) return "inApp"
  if (/iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) return "ios"
  if (/Android/i.test(ua)) return "android"
  return "desktop"
}

export function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

export function useInstall() {
  const [, force] = React.useReducer((n: number) => n + 1, 0)
  React.useEffect(() => {
    listeners.add(force)
    return () => {
      listeners.delete(force)
    }
  }, [])

  return {
    installed: isStandalone(),
    platform: detectPlatform(),
    canPrompt: deferred !== null,
    /** Abre o diálogo nativo de instalação. Devolve false se não houver um disponível. */
    async prompt() {
      if (!deferred) return false
      await deferred.prompt()
      const { outcome } = await deferred.userChoice
      deferred = null
      notify()
      return outcome === "accepted"
    },
  }
}

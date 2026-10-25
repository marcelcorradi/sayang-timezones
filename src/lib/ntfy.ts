import type { PersonId } from "@/data/types"

/**
 * "Pensando em você" sem servidor próprio: o ntfy.sh entrega notificações de graça.
 * Cada pessoa assina o próprio tópico no app do ntfy; o nome do tópico fica guardado no cofre.
 */
const SERVER = "https://ntfy.sh"

export const NTFY_APPS = {
  android: "https://play.google.com/store/apps/details?id=io.heckel.ntfy",
  ios: "https://apps.apple.com/app/ntfy/id1625396347",
}

export const topicFor = (base: string, person: PersonId) => `${base}-${person}`

export async function sendToque(topic: string, title: string, message: string) {
  const res = await fetch(`${SERVER}/${topic}`, {
    method: "POST",
    body: message,
    headers: { Title: title, Tags: "two_hearts" },
  })
  if (!res.ok) throw new Error(String(res.status))
}

export interface Toque {
  id: string
  time: number
  title?: string
  message: string
}

/** Toques recebidos nas últimas horas (o ntfy.sh guarda as mensagens por cerca de 12h). */
export async function recentToques(topic: string): Promise<Toque[]> {
  const res = await fetch(`${SERVER}/${topic}/json?poll=1&since=12h`, { cache: "no-store" })
  if (!res.ok) return []
  const text = await res.text()
  return text
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line))
    .filter((m) => m.event === "message")
    .map((m) => ({ id: m.id, time: m.time * 1000, title: m.title, message: m.message }))
}

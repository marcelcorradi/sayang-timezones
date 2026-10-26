import type { DateKey, Lang, PersonId } from "@/data/types"
import type { LearnStore } from "@/lib/learn"

/** Um motivo que `from` escreveu e vai para o pote do outro. */
export interface Reason {
  id: string
  from: PersonId
  text: string
  lang: Lang
  createdAt: string
}

export type Feeling = "miss" | "sad" | "badDay" | "cantSleep" | "happy" | "laugh"

/** Carta "abra quando…": fica trancada até a data ou até quem recebe sentir aquilo. */
export interface Letter {
  id: string
  from: PersonId
  to: PersonId
  when: { feeling: Feeling } | { date: DateKey }
  text: string
  lang: Lang
  createdAt: string
  openedAt?: string
}

/** Recado que aparece quando quem recebe acordar. */
export interface WakeNote {
  id: string
  from: PersonId
  to: PersonId
  text: string
  lang: Lang
  /** Instante em que o recado aparece (o próximo despertar de quem recebe). */
  showAt: number
  createdAt: string
  seenAt?: string
}

export interface FearReply {
  id: string
  from: PersonId
  text: string
  lang: Lang
  createdAt: string
}

/** Medo ou vulnerabilidade que `from` compartilhou; os dois conversam embaixo. */
export interface Fear {
  id: string
  from: PersonId
  text: string
  lang: Lang
  createdAt: string
  replies: FearReply[]
  /** Quem escreveu marcou que ficou mais leve. */
  easedAt?: string
  /** Última vez que cada um abriu, pra marcar "Novo". */
  seenAt?: Partial<Record<PersonId, string>>
}

export interface VaultDoc {
  version: 1
  /** Base dos tópicos do ntfy; cada pessoa recebe em `${ntfyTopic}-${pessoa}`. */
  ntfyTopic: string
  reasons: Reason[]
  letters: Letter[]
  notes: WakeNote[]
  /** Progresso do "Aprender" de cada um, pra valer em qualquer celular. Ausente em cofres antigos. */
  learn?: Partial<Record<PersonId, LearnStore>>
  /** Medos dos dois, com a conversa de cada um. Ausente em cofres antigos. */
  fears?: Fear[]
}

/** O que fica salvo no repositório: só texto criptografado. */
export interface VaultFile {
  app: "sayang"
  v: 1
  salt: string
  iterations: number
  iv: string
  data: string
}

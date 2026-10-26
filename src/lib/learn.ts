import * as React from "react"

import { couple } from "@/data/couple"
import type { DateKey, Lang, PersonId } from "@/data/types"
import { SENTENCES, tokensOf, type Sentence } from "@/data/sentences"
import { CONFUSABLE, VOCAB, type Topic, type VocabItem } from "@/data/vocab"
import { daysBetween } from "@/lib/time"

/**
 * Progresso do "Aprender", separado por pessoa. Fica no localStorage do aparelho e, com o cofre
 * conectado, também no cofre (`doc.learn`, ver `learn-sync.ts`), pra valer em qualquer celular.
 * Repetição espaçada em caixas: acertou, a palavra sobe de caixa e volta mais tarde; errou, volta pra caixa 0.
 */
const STORAGE_KEY = "sayang:learn"
const BOX_DAYS = [0, 1, 2, 4, 7, 15]
/** Conta como aprendida depois do primeiro acerto; errar depois devolve pra caixa 0 e ela sai da conta. */
export const LEARNED_BOX = 1
export const XP_PER_ANSWER = 10

interface ItemProgress {
  box: number
  due: number
  /** Dia da última resposta: decide qual aparelho tem a versão mais nova da palavra. */
  seen?: number
}

export interface LangProgress {
  items: Record<string, ItemProgress>
  xp: number
  streak: number
  lastDay: number | null
}

/** O progresso de uma pessoa. */
export interface LearnStore {
  /** Idioma escolhido para aprender, por idioma da interface. */
  target: Partial<Record<Lang, Lang>>
  progress: Partial<Record<Lang, LangProgress>>
}

type Device = Partial<Record<PersonId, LearnStore>>

const EMPTY: LangProgress = { items: {}, xp: 0, streak: 0, lastDay: null }
export const EMPTY_STORE: LearnStore = { target: {}, progress: {} }
const PEOPLE = Object.keys(couple.people) as PersonId[]

/**
 * Antes o aparelho guardava um progresso só, sem dono. Cada idioma vai pra quem escolheu aprendê-lo
 * ou, se ninguém escolheu, pra quem não fala aquele idioma (o indonésio é do Marcel, o português da Gabriela).
 */
function migrate(old: LearnStore): Device {
  const device: Device = {}
  for (const [lang, p] of Object.entries(old.progress) as [Lang, LangProgress][]) {
    const owner =
      PEOPLE.find((person) => old.target[couple.people[person].defaultLang] === lang) ??
      PEOPLE.find((person) => couple.people[person].defaultLang !== lang) ??
      PEOPLE[0]
    const mine = device[owner] ?? { target: old.target, progress: {} }
    device[owner] = { ...mine, progress: { ...mine.progress, [lang]: p } }
  }
  return device
}

function load(): Device {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null")
    if (parsed?.people) return parsed.people
    if (parsed?.progress) return migrate({ target: parsed.target ?? {}, progress: parsed.progress })
  } catch {
    // Sem armazenamento: o progresso vale só nesta visita.
  }
  return {}
}

let device: Device | null = null
const listeners = new Set<() => void>()

function getDevice() {
  device ??= load()
  return device
}

function setDevice(next: Device) {
  device = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 2, people: next }))
  } catch {
    // Idem: segue só em memória.
  }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const storeOf = (me: PersonId) => getDevice()[me] ?? EMPTY_STORE

export function setStoreOf(me: PersonId, next: LearnStore) {
  setDevice({ ...getDevice(), [me]: next })
}

export function useLearnStore(me: PersonId) {
  return React.useSyncExternalStore(subscribe, () => storeOf(me))
}

/** Número do dia (no calendário de quem está olhando), para comparar datas com conta simples. */
export const dayNumber = (key: DateKey) => daysBetween("2026-01-01", key)

export const progressOf = (s: LearnStore, target: Lang) => s.progress[target] ?? EMPTY

export function setTarget(me: PersonId, base: Lang, target: Lang) {
  const s = storeOf(me)
  setStoreOf(me, { ...s, target: { ...s.target, [base]: target } })
}

/** Acerto só sobe de caixa quando a palavra é nova ou já venceu: acertar de novo no mesmo dia não conta. */
export function recordAnswer(me: PersonId, target: Lang, key: string, correct: boolean, today: number) {
  const s = storeOf(me)
  const p = progressOf(s, target)
  const current = p.items[key]
  if (correct && current && current.due > today) {
    setStoreOf(me, { ...s, progress: { ...s.progress, [target]: { ...p, xp: p.xp + XP_PER_ANSWER } } })
    return
  }
  const box = correct ? Math.min((current?.box ?? 0) + 1, BOX_DAYS.length - 1) : 0
  const items = { ...p.items, [key]: { box, due: today + BOX_DAYS[box], seen: today } }
  setStoreOf(me, { ...s, progress: { ...s.progress, [target]: { ...p, items, xp: p.xp + (correct ? XP_PER_ANSWER : 0) } } })
}

/** Fecha a lição do dia: conta a sequência de dias seguidos. */
export function finishLesson(me: PersonId, target: Lang, today: number) {
  const s = storeOf(me)
  const p = progressOf(s, target)
  const streak = p.lastDay === today ? p.streak : p.lastDay === today - 1 ? p.streak + 1 : 1
  setStoreOf(me, { ...s, progress: { ...s.progress, [target]: { ...p, streak, lastDay: today } } })
}

const seenOf = (item: ItemProgress) => item.seen ?? -1
const newer = (a: ItemProgress, b: ItemProgress) =>
  seenOf(a) !== seenOf(b) ? (seenOf(a) > seenOf(b) ? a : b) : a.box >= b.box ? a : b

function mergeProgress(a: LangProgress, b: LangProgress): LangProgress {
  const items = { ...b.items }
  for (const [key, item] of Object.entries(a.items)) items[key] = items[key] ? newer(item, items[key]) : item
  const dayA = a.lastDay ?? -1
  const dayB = b.lastDay ?? -1
  const recent = dayA !== dayB ? (dayA > dayB ? a : b) : a.streak >= b.streak ? a : b
  return { items, xp: Math.max(a.xp, b.xp), streak: recent.streak, lastDay: recent.lastDay }
}

/** Junta o progresso de dois aparelhos: em cada palavra vale a resposta mais recente; `a` decide o idioma escolhido. */
export function mergeStores(a: LearnStore, b: LearnStore | undefined): LearnStore {
  if (!b) return a
  const progress = { ...b.progress }
  for (const [lang, p] of Object.entries(a.progress) as [Lang, LangProgress][]) {
    const other = progress[lang]
    progress[lang] = other ? mergeProgress(p, other) : p
  }
  return { target: { ...b.target, ...a.target }, progress }
}

/** JSON com as chaves em ordem, pra comparar duas versões sem depender da ordem em que foram montadas. */
export const canonical = (value: unknown) =>
  JSON.stringify(value, (_, v) =>
    v && typeof v === "object" && !Array.isArray(v)
      ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)))
      : v
  )

export const currentStreak = (p: LangProgress, today: number) =>
  p.lastDay !== null && p.lastDay >= today - 1 ? p.streak : 0

export const isLearned = (p: LangProgress, key: string) => (p.items[key]?.box ?? 0) >= LEARNED_BOX

/** Resumo do progresso do outro: o idioma que ele mais estudou, quantas palavras aprendeu e a sequência. */
export function summaryOf(s: LearnStore | undefined, today: number) {
  const best = Object.entries(s?.progress ?? {}).sort(([, a], [, b]) => b.xp - a.xp)[0] as
    | [Lang, LangProgress]
    | undefined
  if (!best) return null
  const [lang, p] = best
  const words = VOCAB.filter((item) => isLearned(p, item.key)).length
  return words ? { lang, words, streak: currentStreak(p, today) } : null
}

const isDue = (p: LangProgress, key: string, today: number) => {
  const item = p.items[key]
  return item !== undefined && item.due <= today && item.box < BOX_DAYS.length - 1
}

export const dueItems = (p: LangProgress, today: number) => VOCAB.filter((item) => isDue(p, item.key, today))

export type QuestionKind = "meaning" | "word" | "listen"

export type Question =
  | { kind: QuestionKind; key: string; item: VocabItem; options: VocabItem[] }
  | { kind: "build"; key: string; sentence: Sentence; tiles: string[] }

const shuffle = <T,>(list: T[]) => {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

const same = (a: string, b: string) => a.toLocaleLowerCase() === b.toLocaleLowerCase()

const confusable = (a: string, b: string) => CONFUSABLE.some((group) => group.includes(a) && group.includes(b))

/**
 * Três alternativas erradas, sem repetir o texto da certa em nenhum dos dois idiomas
 * nem trazer uma palavra que também serviria de tradução (CONFUSABLE).
 * Primeiro as outras palavras da própria lição (que a pessoa acabou de ver), depois o mesmo tema.
 */
function optionsFor(item: VocabItem, target: Lang, base: Lang, lesson: VocabItem[]) {
  const clash = (other: VocabItem) =>
    other.key === item.key ||
    confusable(other.key, item.key) ||
    same(other.text[target], item.text[target]) ||
    same(other.text[base], item.text[base])
  const fromLesson = shuffle(lesson.filter((o) => !clash(o)))
  const sameTopic = shuffle(VOCAB.filter((o) => o.topic === item.topic && !clash(o) && !lesson.includes(o)))
  const others = shuffle(VOCAB.filter((o) => o.topic !== item.topic && !clash(o)))
  return shuffle([item, ...[...fromLesson, ...sameTopic, ...others].slice(0, 3)])
}

/** Se a frase usa a palavra, em qualquer uma das formas quando há variantes como "amigo, amiga". */
export function sentenceUses(sentence: Sentence, item: VocabItem, target: Lang) {
  const tokens = tokensOf(sentence.text[target]).map((w) => w.toLocaleLowerCase())
  return item.text[target].split(",").some((form) => {
    const words = tokensOf(form).map((w) => w.toLocaleLowerCase())
    return words.length > 0 && tokens.some((_, i) => words.every((w, j) => tokens[i + j] === w))
  })
}

/** Peças sem a maiúscula do começo da frase, que entregaria qual palavra vem primeiro (nomes e o "I" ficam). */
const tilesOf = (text: string) =>
  tokensOf(text).map((word, i) => (i === 0 && word !== "I" ? word.charAt(0).toLocaleLowerCase() + word.slice(1) : word))

/** As palavras da frase embaralhadas, mais duas de outras frases para não ficar fácil demais. */
function tilesFor(sentence: Sentence, target: Lang) {
  const tokens = tilesOf(sentence.text[target])
  const extras = shuffle(
    SENTENCES.filter((o) => o.key !== sentence.key)
      .flatMap((o) => tilesOf(o.text[target]))
      .filter((w) => !tokens.some((t) => same(t, w)))
  )
  const distractors = [...new Map(extras.map((w) => [w.toLocaleLowerCase(), w])).values()].slice(0, 2)
  return shuffle([...tokens, ...distractors])
}

/** Vale a frase principal ou qualquer outra ordem certa em `alt`. */
export function isBuildCorrect(sentence: Sentence, target: Lang, answer: string[]) {
  return [sentence.text[target], ...(sentence.alt?.[target] ?? [])].some((text) => {
    const expected = tokensOf(text)
    return answer.length === expected.length && answer.every((w, i) => same(w, expected[i]))
  })
}

const LESSON_SIZE = 10

/** Perguntas extras por palavra, além do "o que significa", pra uma revisão curta não repetir a mesma palavra 10 vezes. */
const EXTRA_PER_WORD = 2

/**
 * Monta uma lição: até 5 palavras (vencidas primeiro, depois novas, depois as mais fracas),
 * cada uma com "o que significa" primeiro; até 2 frases pra montar, só das que usam
 * uma dessas palavras (as da unidade `topic` primeiro); o resto alterna entre "como se diz" e "o que você ouviu".
 * Tudo gira em torno das palavras da lição, que são as mesmas apresentadas nos cartões.
 * Na revisão (`review`), as frases recebidas já foram vistas e entram mesmo sem palavra vencida.
 */
export function buildLesson(
  pool: VocabItem[],
  sentences: Sentence[],
  p: LangProgress,
  today: number,
  {
    target,
    base,
    canListen,
    topic,
    review = false,
  }: { target: Lang; base: Lang; canListen: boolean; topic?: Topic; review?: boolean }
): Question[] {
  const rank = (key: string) => {
    const progress = p.items[key]
    if (!progress) return 1
    if (progress.due <= today) return 0
    return 2 + progress.box
  }
  const focus = shuffle(pool)
    .sort((a, b) => rank(a.key) - rank(b.key))
    .slice(0, 5)
  const outside = (s: Sentence) => Number(topic !== undefined && s.topic !== topic)
  const builds = shuffle(sentences.filter((s) => review || focus.some((item) => sentenceUses(s, item, target))))
    .sort((a, b) => rank(a.key) - rank(b.key) || outside(a) - outside(b))
    .slice(0, 2)

  const intro: Question[] = focus.map((item) => ({
    kind: "meaning",
    key: item.key,
    item,
    options: optionsFor(item, target, base, focus),
  }))
  const rest: Question[] = builds.map((sentence) => ({
    kind: "build",
    key: sentence.key,
    sentence,
    tiles: tilesFor(sentence, target),
  }))
  const kinds: QuestionKind[] = canListen ? ["word", "listen"] : ["word"]
  for (let i = 0; i < focus.length * EXTRA_PER_WORD && intro.length + rest.length < LESSON_SIZE; i++) {
    const item = focus[i % focus.length]
    rest.push({ kind: kinds[i % kinds.length], key: item.key, item, options: optionsFor(item, target, base, focus) })
  }
  return [...intro, ...shuffle(rest)]
}

export const itemsOf = (topic: Topic) => VOCAB.filter((item) => item.topic === topic)
/** Frases da unidade primeiro; as de outras unidades entram se usarem alguma palavra da lição. */
export const sentencesOf = (topic: Topic) => [
  ...SENTENCES.filter((sentence) => sentence.topic === topic),
  ...SENTENCES.filter((sentence) => sentence.topic !== topic),
]
export const dueSentences = (p: LangProgress, today: number) => SENTENCES.filter((s) => isDue(p, s.key, today))

/** Um índice aleatório diferente de `current` (para "outra palavra"). */
export function otherIndex(length: number, current: number) {
  if (length < 2) return current
  const next = Math.floor(Math.random() * (length - 1))
  return next >= current ? next + 1 : next
}

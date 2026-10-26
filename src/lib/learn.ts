import * as React from "react"

import type { DateKey, Lang } from "@/data/types"
import { SENTENCES, tokensOf, type Sentence } from "@/data/sentences"
import { CONFUSABLE, VOCAB, type Topic, type VocabItem } from "@/data/vocab"
import { daysBetween } from "@/lib/time"

/**
 * Progresso do "Aprender", guardado só neste aparelho (localStorage).
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
}

export interface LangProgress {
  items: Record<string, ItemProgress>
  xp: number
  streak: number
  lastDay: number | null
}

interface Store {
  /** Idioma escolhido para aprender, por idioma da interface. */
  target: Partial<Record<Lang, Lang>>
  progress: Partial<Record<Lang, LangProgress>>
}

const EMPTY: LangProgress = { items: {}, xp: 0, streak: 0, lastDay: null }

function load(): Store {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null")
    if (parsed && typeof parsed === "object") return { target: parsed.target ?? {}, progress: parsed.progress ?? {} }
  } catch {
    // Sem armazenamento: o progresso vale só nesta visita.
  }
  return { target: {}, progress: {} }
}

let store: Store | null = null
const listeners = new Set<() => void>()

function getStore() {
  store ??= load()
  return store
}

function setStore(next: Store) {
  store = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
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

export function useLearnStore() {
  return React.useSyncExternalStore(subscribe, getStore)
}

/** Número do dia (no calendário de quem está olhando), para comparar datas com conta simples. */
export const dayNumber = (key: DateKey) => daysBetween("2026-01-01", key)

export const progressOf = (s: Store, target: Lang) => s.progress[target] ?? EMPTY

export function setTarget(base: Lang, target: Lang) {
  const s = getStore()
  setStore({ ...s, target: { ...s.target, [base]: target } })
}

/** Acerto só sobe de caixa quando a palavra é nova ou já venceu: acertar de novo no mesmo dia não conta. */
export function recordAnswer(target: Lang, key: string, correct: boolean, today: number) {
  const s = getStore()
  const p = progressOf(s, target)
  const current = p.items[key]
  if (correct && current && current.due > today) {
    setStore({ ...s, progress: { ...s.progress, [target]: { ...p, xp: p.xp + XP_PER_ANSWER } } })
    return
  }
  const box = correct ? Math.min((current?.box ?? 0) + 1, BOX_DAYS.length - 1) : 0
  const items = { ...p.items, [key]: { box, due: today + BOX_DAYS[box] } }
  setStore({ ...s, progress: { ...s.progress, [target]: { ...p, items, xp: p.xp + (correct ? XP_PER_ANSWER : 0) } } })
}

/** Fecha a lição do dia: conta a sequência de dias seguidos. */
export function finishLesson(target: Lang, today: number) {
  const s = getStore()
  const p = progressOf(s, target)
  const streak = p.lastDay === today ? p.streak : p.lastDay === today - 1 ? p.streak + 1 : 1
  setStore({ ...s, progress: { ...s.progress, [target]: { ...p, streak, lastDay: today } } })
}

export const currentStreak = (p: LangProgress, today: number) =>
  p.lastDay !== null && p.lastDay >= today - 1 ? p.streak : 0

export const isLearned = (p: LangProgress, key: string) => (p.items[key]?.box ?? 0) >= LEARNED_BOX

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

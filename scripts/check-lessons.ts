/**
 * Gera lições de todas as unidades e confere que cada pergunta é sobre uma palavra apresentada
 * (ou já aprendida) e que cada frase de montar usa uma palavra da lição. Confere também a revisão
 * só com frases vencidas, as ordens alternativas das frases e os grupos de CONFUSABLE.
 *
 *   npm run check:lessons
 */
import { SENTENCES, tokensOf } from "@/data/sentences"
import type { Lang } from "@/data/types"
import { CONFUSABLE, TOPICS, VOCAB } from "@/data/vocab"
import { buildLesson, isLearned, itemsOf, sentenceUses, sentencesOf, type LangProgress } from "@/lib/learn"

const pairs: [Lang, Lang][] = [
  ["id", "pt"],
  ["pt", "id"],
  ["pt", "en"],
  ["en", "pt"],
  ["en", "id"],
  ["id", "en"],
]
let lessons = 0
const problems: string[] = []

for (const [target, base] of pairs) {
  for (const topic of TOPICS) {
    for (let run = 0; run < 6; run++) {
      // Metade das vezes simula quem já fez lições antes: algumas palavras vistas, outras aprendidas.
      const items: LangProgress["items"] = {}
      if (run % 2) itemsOf(topic.id).forEach((item, i) => (items[item.key] = { box: i % 4, due: i % 3 }))
      const progress: LangProgress = { items, xp: 0, streak: 0, lastDay: null }
      const questions = buildLesson(itemsOf(topic.id), sentencesOf(topic.id), progress, 1, {
        target,
        base,
        canListen: true,
        topic: topic.id,
      })
      lessons++
      const words = questions.flatMap((q) => (q.kind === "build" ? [] : [q.item]))
      const cards = new Set(words.filter((w) => !isLearned(progress, w.key)).map((w) => w.key))
      for (const q of questions) {
        if (q.kind === "build") {
          if (!words.some((w) => sentenceUses(q.sentence, w, target)))
            problems.push(`${target}/${topic.id}: frase "${q.sentence.text[target]}" sem palavra da lição`)
        } else {
          const known = cards.has(q.key) || isLearned(progress, q.key)
          if (!known) problems.push(`${target}/${topic.id}: pergunta sobre "${q.item.text[target]}" sem cartão`)
          if (q.options.length !== 4) problems.push(`${target}/${topic.id}: ${q.options.length} alternativas`)
        }
      }
      if (questions.length !== 10) problems.push(`${target}/${topic.id}: ${questions.length} perguntas`)
    }
  }

  // Revisão só com uma frase vencida: precisa abrir com ela.
  const empty: LangProgress = { items: {}, xp: 0, streak: 0, lastDay: null }
  const review = buildLesson([], SENTENCES.slice(0, 1), empty, 1, { target, base, canListen: true, review: true })
  if (review.length !== 1) problems.push(`${target}: revisão só com frase gerou ${review.length} perguntas`)
}

const sorted = (text: string) =>
  tokensOf(text)
    .map((w) => w.toLocaleLowerCase())
    .sort()
    .join(" ")
for (const sentence of SENTENCES)
  for (const [lang, alts] of Object.entries(sentence.alt ?? {}) as [Lang, string[]][])
    for (const alt of alts)
      if (sorted(alt) !== sorted(sentence.text[lang]))
        problems.push(`${sentence.key}: "${alt}" não usa as mesmas palavras de "${sentence.text[lang]}"`)

for (const key of CONFUSABLE.flat())
  if (!VOCAB.some((item) => item.key === key)) problems.push(`CONFUSABLE: palavra "${key}" não existe`)

console.log(`${lessons} lições conferidas`)
console.log(problems.length ? [...new Set(problems)].join("\n") : "nenhum problema")
process.exit(problems.length ? 1 : 0)

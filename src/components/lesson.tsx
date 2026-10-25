import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon, VolumeHighIcon } from "@hugeicons/core-free-icons"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { couple } from "@/data/couple"
import { SENTENCES, tokensOf, type Sentence } from "@/data/sentences"
import type { Lang, PersonId } from "@/data/types"
import { introFor } from "@/data/units"
import { TOPICS, type Topic, type VocabItem } from "@/data/vocab"
import { translate } from "@/lib/i18n"
import { finishLesson, isBuildCorrect, recordAnswer, XP_PER_ANSWER, type Question } from "@/lib/learn"
import { sendToque, topicFor } from "@/lib/ntfy"
import { usePrefs } from "@/lib/prefs"
import { partnerOf } from "@/lib/schedule"
import { speak } from "@/lib/speech"
import { useVault } from "@/lib/vault/vault"

interface LessonProps {
  questions: Question[]
  /** Lição de unidade: abre com a explicação e as palavras novas antes das perguntas. */
  intro?: { topic: Topic; newItems: VocabItem[] }
  target: Lang
  base: Lang
  me: PersonId
  today: number
  onClose: () => void
}

/**
 * Lição em tela cheia, no jeito do Busuu: primeiro a explicação da unidade, depois as palavras
 * novas uma por vez, e só então as perguntas, conferidas na hora.
 */
export function Lesson({ questions, intro, target, base, me, today, onClose }: LessonProps) {
  const { t } = usePrefs()
  const [phase, setPhase] = React.useState<"intro" | "cards" | "quiz">(intro ? "intro" : "quiz")
  const [card, setCard] = React.useState(0)
  const [index, setIndex] = React.useState(0)
  const [result, setResult] = React.useState<boolean | null>(null)
  const [score, setScore] = React.useState(0)
  const question = questions[index]
  const done = index >= questions.length

  const answer = (correct: boolean) => {
    if (result !== null) return
    setResult(correct)
    if (correct) setScore((s) => s + 1)
    else navigator.vibrate?.(80)
    recordAnswer(target, question.key, correct, today)
    // Depois de responder, ouve a forma certa no idioma que está aprendendo.
    speak(question.kind === "build" ? question.sentence.text[target] : question.item.text[target], target)
  }

  // A barra conta tudo: explicação, palavras novas e perguntas.
  const before = intro ? 1 + intro.newItems.length : 0
  const position = phase === "intro" ? 0 : phase === "cards" ? 1 + card : before + Math.min(index, questions.length)
  const progress = (position / (before + questions.length)) * 100

  const next = () => {
    setResult(null)
    if (index + 1 >= questions.length) finishLesson(target, today)
    setIndex((i) => i + 1)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
      <div className="mx-auto flex min-h-full max-w-md flex-col px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label={t("closeLesson")} onClick={onClose}>
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
          </Button>
          <Progress value={progress} className="flex-1" />
        </div>

        {phase === "intro" && intro ? (
          <UnitIntro
            topic={intro.topic}
            newCount={intro.newItems.length}
            target={target}
            base={base}
            onNext={() => setPhase(intro.newItems.length ? "cards" : "quiz")}
          />
        ) : phase === "cards" && intro ? (
          <WordCard
            key={card}
            item={intro.newItems[card]}
            position={card + 1}
            total={intro.newItems.length}
            target={target}
            base={base}
            onNext={() => (card + 1 < intro.newItems.length ? setCard(card + 1) : setPhase("quiz"))}
          />
        ) : done ? (
          <Finished score={score} total={questions.length} target={target} me={me} onClose={onClose} />
        ) : (
          <>
            <div className="flex flex-1 flex-col gap-6 py-6">
              {question.kind === "build" ? (
                <BuildQuestion
                  key={index}
                  question={question}
                  target={target}
                  base={base}
                  locked={result !== null}
                  onAnswer={answer}
                />
              ) : (
                <ChoiceQuestion
                  key={index}
                  question={question}
                  target={target}
                  base={base}
                  locked={result !== null}
                  onAnswer={answer}
                />
              )}
            </div>
            {result !== null && (
              <Feedback correct={result} question={question} target={target} base={base} onNext={next} />
            )}
          </>
        )}
      </div>
    </div>
  )
}

type ChoiceQ = Extract<Question, { options: unknown }>
type BuildQ = Extract<Question, { kind: "build" }>

function ChoiceQuestion({
  question,
  target,
  base,
  locked,
  onAnswer,
}: {
  question: ChoiceQ
  target: Lang
  base: Lang
  locked: boolean
  onAnswer: (correct: boolean) => void
}) {
  const { t } = usePrefs()
  const [picked, setPicked] = React.useState<string | null>(null)
  const { item, kind } = question
  // Em "o que significa" e "o que você ouviu" a pergunta vem falada.
  const spoken = kind === "meaning" || kind === "listen"
  const optionLang = kind === "meaning" ? base : target

  React.useEffect(() => {
    if (spoken) speak(item.text[target], target)
  }, [spoken, item, target])

  const title = kind === "meaning" ? t("qMeaning") : kind === "word" ? t("qWord") : t("qListen")

  return (
    <>
      <div className="flex flex-col gap-3">
        <h2 className="font-heading text-xl font-semibold">{title}</h2>
        {kind === "listen" ? (
          <Button
            size="lg"
            variant="secondary"
            className="h-20 self-start px-8"
            onClick={() => speak(item.text[target], target)}
            aria-label={t("listen")}
          >
            <HugeiconsIcon icon={VolumeHighIcon} strokeWidth={2} className="size-8" />
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            <p
              lang={kind === "meaning" ? target : base}
              className="font-heading text-3xl leading-tight font-semibold tracking-tight"
            >
              {kind === "meaning" ? item.text[target] : item.text[base]}
            </p>
            {kind === "meaning" && <ListenButton text={item.text[target]} lang={target} />}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2.5">
        {question.options.map((option) => {
          const isRight = option.key === item.key
          const state = !locked ? null : isRight ? "right" : picked === option.key ? "wrong" : null
          return (
            <Button
              key={option.key}
              variant="outline"
              size="lg"
              lang={optionLang}
              disabled={locked && state === null}
              onClick={() => {
                if (locked) return
                setPicked(option.key)
                onAnswer(isRight)
              }}
              className={cn(
                "h-auto min-h-12 justify-start py-3 text-left text-base whitespace-normal",
                state === "right" && "border-together bg-together-soft text-foreground disabled:opacity-100",
                state === "wrong" && "border-destructive bg-destructive/10 text-foreground disabled:opacity-100"
              )}
            >
              {option.text[optionLang]}
            </Button>
          )
        })}
      </div>
    </>
  )
}

function BuildQuestion({
  question,
  target,
  base,
  locked,
  onAnswer,
}: {
  question: BuildQ
  target: Lang
  base: Lang
  locked: boolean
  onAnswer: (correct: boolean) => void
}) {
  const { t } = usePrefs()
  // Guardamos índices das peças, porque a mesma palavra pode aparecer duas vezes.
  const [chosen, setChosen] = React.useState<number[]>([])
  const tiles = question.tiles

  return (
    <>
      <div className="flex flex-col gap-3">
        <h2 className="font-heading text-xl font-semibold">{t("qBuild")}</h2>
        <p lang={base} className="font-heading text-2xl leading-snug font-semibold tracking-tight">
          {question.sentence.text[base]}
        </p>
      </div>
      <div className="flex min-h-24 flex-wrap content-start gap-2 border-y py-3">
        {chosen.map((tileIndex, i) => (
          <Button
            key={`${tileIndex}-${i}`}
            variant="secondary"
            lang={target}
            disabled={locked}
            onClick={() => setChosen((c) => c.filter((_, j) => j !== i))}
          >
            {tiles[tileIndex]}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {tiles.map((word, tileIndex) => (
          <Button
            key={tileIndex}
            variant="outline"
            lang={target}
            disabled={locked || chosen.includes(tileIndex)}
            onClick={() => setChosen((c) => [...c, tileIndex])}
          >
            {word}
          </Button>
        ))}
      </div>
      {!locked && (
        <div className="mt-auto flex gap-2">
          <Button variant="ghost" size="lg" disabled={!chosen.length} onClick={() => setChosen([])}>
            {t("clear")}
          </Button>
          <Button
            size="lg"
            className="flex-1"
            disabled={!chosen.length}
            onClick={() =>
              onAnswer(
                isBuildCorrect(
                  question.sentence,
                  target,
                  chosen.map((i) => tiles[i])
                )
              )
            }
          >
            {t("check")}
          </Button>
        </div>
      )}
    </>
  )
}

function Feedback({
  correct,
  question,
  target,
  base,
  onNext,
}: {
  correct: boolean
  question: Question
  target: Lang
  base: Lang
  onNext: () => void
}) {
  const { t } = usePrefs()
  const right =
    question.kind === "build"
      ? question.sentence.text[target]
      : question.kind === "meaning"
        ? question.item.text[base]
        : question.item.text[target]
  const note = question.kind !== "build" ? question.item.note?.[base] : undefined
  const meaning =
    question.kind === "build" ? null : question.kind === "meaning" ? question.item.text[target] : question.item.text[base]

  return (
    <div
      role="status"
      className={cn(
        "-mx-4 flex flex-col gap-3 rounded-t-3xl px-5 pt-4 pb-2",
        correct ? "bg-together-soft" : "bg-destructive/10"
      )}
    >
      <p className={cn("font-heading text-lg font-semibold", correct ? "text-together" : "text-destructive")}>
        {correct ? t("correct") : t("wrongAnswer")}
      </p>
      {(!correct || meaning) && (
        <p className="text-base">
          {!correct && <span className="font-semibold">{right}</span>}
          {meaning && (
            <span className="text-muted-foreground">
              {!correct && " "}({meaning})
            </span>
          )}
        </p>
      )}
      {note && <p className="text-sm text-muted-foreground">{note}</p>}
      <Button size="lg" onClick={onNext} autoFocus>
        {t("continue")}
      </Button>
    </div>
  )
}

function Finished({
  score,
  total,
  target,
  me,
  onClose,
}: {
  score: number
  total: number
  target: Lang
  me: PersonId
  onClose: () => void
}) {
  const { t } = usePrefs()
  const { doc } = useVault()
  const [told, setTold] = React.useState(false)
  const partner = partnerOf(me)
  const partnerLang = couple.people[partner].defaultLang

  const tell = async () => {
    if (!doc) return
    const message = translate(partnerLang, "msgLearned", {
      name: couple.people[me].name,
      lang: translate(partnerLang, `lang_${target}`),
    })
    try {
      await sendToque(topicFor(doc.ntfyTopic, partner), couple.people[me].name, message)
      setTold(true)
    } catch {
      // Sem rede: o botão continua lá pra tentar de novo.
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-10 text-center">
      <span className="text-6xl" aria-hidden>
        {score === total ? "🎉" : score >= total / 2 ? "✨" : "🌱"}
      </span>
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-3xl font-semibold tracking-tight">{t("lessonDone")}</h2>
        <p className="text-muted-foreground">{t("lessonScore", { n: score, total })}</p>
        <p className="font-heading text-2xl font-semibold text-together">{t("lessonXp", { n: score * XP_PER_ANSWER })}</p>
      </div>
      <div className="flex w-full flex-col gap-2">
        {doc && (
          <Button variant="outline" size="lg" disabled={told} onClick={tell}>
            {told ? t("toqueSent") : t("tellPartner", { name: couple.people[partner].name })}
          </Button>
        )}
        <Button size="lg" onClick={onClose}>
          {t("back")}
        </Button>
      </div>
    </div>
  )
}

export function ListenButton({ text, lang }: { text: string; lang: Lang }) {
  const { t } = usePrefs()
  return (
    <Button variant="ghost" size="icon" aria-label={t("listen")} onClick={() => speak(text, lang)}>
      <HugeiconsIcon icon={VolumeHighIcon} strokeWidth={2} />
    </Button>
  )
}

function UnitIntro({
  topic,
  newCount,
  target,
  base,
  onNext,
}: {
  topic: Topic
  newCount: number
  target: Lang
  base: Lang
  onNext: () => void
}) {
  const { t } = usePrefs()
  const unit = TOPICS.find((u) => u.id === topic)
  const text = introFor(topic, target, base)

  return (
    <div className="flex flex-1 flex-col gap-6 py-8">
      <div className="flex flex-col gap-3">
        <span className="text-5xl" aria-hidden>
          {unit?.emoji}
        </span>
        <h2 className="font-heading text-3xl font-semibold tracking-tight">{unit?.title[base]}</h2>
      </div>
      {text && <p className="text-lg leading-relaxed">{text}</p>}
      <p className="text-sm text-muted-foreground">
        {newCount === 0 ? t("introPractice") : newCount === 1 ? t("introOneNew") : t("introNew", { n: newCount })}
      </p>
      <Button size="lg" className="mt-auto" onClick={onNext}>
        {newCount ? t("seeWords") : t("practice")}
      </Button>
    </div>
  )
}

/** Uma frase das lições que use a palavra, para mostrar como exemplo. */
function exampleFor(item: VocabItem, target: Lang): Sentence | undefined {
  const words = tokensOf(item.text[target].split(",")[0]).map((w) => w.toLocaleLowerCase())
  if (!words.length) return undefined
  return SENTENCES.find((sentence) => {
    const tokens = tokensOf(sentence.text[target]).map((w) => w.toLocaleLowerCase())
    return tokens.some((_, i) => words.every((w, j) => tokens[i + j] === w))
  })
}

/** Apresenta uma palavra nova: grande, falada, com tradução, observação e um exemplo quando houver. */
function WordCard({
  item,
  position,
  total,
  target,
  base,
  onNext,
}: {
  item: VocabItem
  position: number
  total: number
  target: Lang
  base: Lang
  onNext: () => void
}) {
  const { t } = usePrefs()
  const example = exampleFor(item, target)

  React.useEffect(() => {
    speak(item.text[target], target)
  }, [item, target])

  return (
    <div className="flex flex-1 flex-col gap-6 py-8">
      <p className="text-sm text-muted-foreground">{t("newWord", { n: position, total })}</p>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <p lang={target} className="font-heading text-4xl leading-tight font-semibold tracking-tight">
            {item.text[target]}
          </p>
          <ListenButton text={item.text[target]} lang={target} />
        </div>
        <p lang={base} className="text-xl text-muted-foreground">
          {item.text[base]}
        </p>
      </div>
      {item.note?.[base] && <p className="rounded-2xl bg-muted px-4 py-3 text-base">{item.note[base]}</p>}
      {example && (
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">{t("example")}</p>
          <div className="flex items-center gap-2">
            <p lang={target} className="text-lg font-medium">
              {example.text[target]}
            </p>
            <ListenButton text={example.text[target]} lang={target} />
          </div>
          <p lang={base} className="text-muted-foreground">
            {example.text[base]}
          </p>
        </div>
      )}
      <Button size="lg" className="mt-auto" onClick={onNext}>
        {position < total ? t("nextWord") : t("practice")}
      </Button>
    </div>
  )
}


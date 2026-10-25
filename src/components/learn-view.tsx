import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowReloadHorizontalIcon, ArrowRight01Icon, FireIcon, StarIcon, BookOpen01Icon } from "@hugeicons/core-free-icons"

import { Lesson, ListenButton } from "@/components/lesson"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { couple } from "@/data/couple"
import { TIPS } from "@/data/tips"
import type { Lang, PersonId } from "@/data/types"
import { TOPICS, VOCAB, type Topic, type VocabItem } from "@/data/vocab"
import {
  buildLesson,
  currentStreak,
  dayNumber,
  dueItems,
  dueSentences,
  isLearned,
  itemsOf,
  otherIndex,
  progressOf,
  sentencesOf,
  setTarget,
  useLearnStore,
  type Question,
} from "@/lib/learn"
import { usePrefs } from "@/lib/prefs"
import { partnerOf } from "@/lib/schedule"
import { hasVoice } from "@/lib/speech"
import { localParts } from "@/lib/time"

const LANGS: Lang[] = ["id", "pt", "en"]

export function LearnView({ me, now }: { me: PersonId; now: number }) {
  const { lang: base, t } = usePrefs()
  const store = useLearnStore()
  const [lesson, setLesson] = React.useState<{
    questions: Question[]
    intro?: { topic: Topic; newItems: VocabItem[] }
  } | null>(null)

  const targets = LANGS.filter((l) => l !== base)
  const partnerLang = couple.people[partnerOf(me)].defaultLang
  const stored = store.target[base]
  const target = stored && targets.includes(stored) ? stored : targets.includes(partnerLang) ? partnerLang : targets[0]

  const todayKey = localParts(now, couple.people[me].timeZone).dateKey
  const today = dayNumber(todayKey)
  const progress = progressOf(store, target)
  const streak = currentStreak(progress, today)
  const learned = VOCAB.filter((item) => isLearned(progress, item.key)).length
  const due = [...dueItems(progress, today), ...dueSentences(progress, today)]

  const start = (topic: Topic | "review") => {
    const options = { target, base, canListen: hasVoice(target) }
    if (topic === "review") {
      const questions = buildLesson(dueItems(progress, today), dueSentences(progress, today), progress, today, options)
      if (questions.length) setLesson({ questions })
      return
    }
    const questions = buildLesson(itemsOf(topic), sentencesOf(topic), progress, today, options)
    // Palavras que a pessoa nunca viu ganham um cartão de apresentação antes das perguntas.
    const newItems = new Map<string, VocabItem>()
    for (const q of questions) if (q.kind !== "build" && !progress.items[q.key]) newItems.set(q.key, q.item)
    setLesson({ questions, intro: { topic, newItems: [...newItems.values()] } })
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-1 px-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{t("learnTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("learnHint")}</p>
      </header>

      <div className="flex flex-col gap-2 px-1">
        <span className="text-sm font-medium">{t("learnPick")}</span>
        <ToggleGroup value={[target]} onValueChange={(v) => v[0] && setTarget(base, v[0] as Lang)} variant="outline">
          {targets.map((l) => (
            <ToggleGroupItem key={l} value={l} className="capitalize">
              {t(`lang_${l}`)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 px-1 text-sm">
        <span className="flex items-center gap-1.5">
          <HugeiconsIcon icon={FireIcon} strokeWidth={2} className="size-4 text-ipe-ink" />
          {streak === 0 ? t("streakNone") : streak === 1 ? t("streakOne") : t("streakDays", { n: streak })}
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <HugeiconsIcon icon={StarIcon} strokeWidth={2} className="size-4" />
          {t("xp", { n: progress.xp })}
        </span>
        <span className="text-muted-foreground">{t("wordsLearned", { n: learned })}</span>
      </div>

      <WordOfTheDay target={target} base={base} day={today} />

      {due.length > 0 && (
        <Card size="sm">
          <CardHeader>
            <CardTitle>{t("reviewDue", { n: due.length })}</CardTitle>
            <CardDescription>{t("reviewHint")}</CardDescription>
            <CardAction>
              <Button onClick={() => start("review")}>{t("startLesson")}</Button>
            </CardAction>
          </CardHeader>
        </Card>
      )}

      <Card size="sm">
        <CardHeader>
          <CardTitle>{t("unitsTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col">
          {TOPICS.map((topic, i) => {
            const items = itemsOf(topic.id)
            const known = items.filter((item) => isLearned(progress, item.key)).length
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => start(topic.id)}
                className="-mx-2 flex items-center gap-3 rounded-2xl px-2 py-2.5 text-left outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <span className="w-5 shrink-0 text-right font-heading text-sm text-muted-foreground tabular-nums">
                  {i + 1}
                </span>
                <span className="text-xl" aria-hidden>
                  {topic.emoji}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="truncate font-medium">{topic.title[base]}</span>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {t("unitProgress", { n: known, total: items.length })}
                    </span>
                  </span>
                  <Progress value={(known / items.length) * 100} className="[&_[data-slot=progress-track]]:h-1.5" />
                </span>
                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-4 shrink-0 text-muted-foreground" />
              </button>
            )
          })}
        </CardContent>
      </Card>

      <Tips target={target} />

      {lesson && (
        <Lesson
          questions={lesson.questions}
          intro={lesson.intro}
          target={target}
          base={base}
          me={me}
          today={today}
          onClose={() => setLesson(null)}
        />
      )}
    </div>
  )
}

/** Palavra do dia no idioma que está aprendendo, com pronúncia e um botão de sortear outra. */
function WordOfTheDay({ target, base, day }: { target: Lang; base: Lang; day: number }) {
  const { t } = usePrefs()
  const [picked, setPicked] = React.useState<number | null>(null)
  const index = picked ?? ((day % VOCAB.length) + VOCAB.length) % VOCAB.length
  const word = VOCAB[index]
  const note = word.note?.[base]

  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>{t("wordTitle")}</CardDescription>
        <CardAction className="flex gap-1">
          <ListenButton text={word.text[target]} lang={target} />
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("anotherWord")}
            onClick={() => setPicked(otherIndex(VOCAB.length, index))}
          >
            <HugeiconsIcon icon={ArrowReloadHorizontalIcon} strokeWidth={2} />
          </Button>
        </CardAction>
        <CardTitle lang={target} className="font-heading text-3xl font-semibold tracking-tight">
          {word.text[target]}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <p className="text-base" lang={base}>
          {word.text[base]}
        </p>
        {note && <p className="text-muted-foreground">{note}</p>}
      </CardContent>
    </Card>
  )
}

function Tips({ target }: { target: Lang }) {
  const { lang, t } = usePrefs()
  const tips = TIPS.filter((tip) => tip.target === target)
  if (!tips.length) return null

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{t("tipsTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col">
        {tips.map((tip) => (
          <Sheet key={tip.key}>
            <SheetTrigger className="-mx-2 flex items-center gap-3 rounded-2xl px-2 py-2.5 text-left outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50">
              <HugeiconsIcon icon={BookOpen01Icon} strokeWidth={2} className="size-4 shrink-0 text-muted-foreground" />
              <span className="flex-1">{tip.title[lang]}</span>
              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-4 shrink-0 text-muted-foreground" />
            </SheetTrigger>
            <SheetContent side="bottom" className="mx-auto max-w-md rounded-t-3xl pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              <SheetHeader className="pr-14">
                <SheetTitle className="font-heading text-xl">{tip.title[lang]}</SheetTitle>
              </SheetHeader>
              <p className="px-6 text-base leading-relaxed">{tip.body[lang]}</p>
            </SheetContent>
          </Sheet>
        ))}
      </CardContent>
    </Card>
  )
}

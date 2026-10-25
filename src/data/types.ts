export type Lang = "pt" | "en" | "id"
export type PersonId = "marcel" | "gabriela"

/** 0 = domingo/Sunday/Minggu ... 6 = sábado/Saturday/Sabtu */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

/** "HH:MM" em 24h, no fuso da própria pessoa. */
export type Clock = `${number}:${number}`

/** "YYYY-MM-DD" no fuso da própria pessoa. */
export type DateKey = `${number}-${number}-${number}`

export type Localized = Partial<Record<Lang, string>>

/**
 * Quanto a pessoa está disponível para conversar.
 * free: pode ligar · limited: dá pra trocar mensagem · busy: só depois · asleep: dormindo
 */
export type Availability = "free" | "limited" | "busy" | "asleep"

export type ActivityId =
  | "sleep"
  | "work"
  | "lunch"
  | "dinner"
  | "commute"
  | "gym"
  | "study"
  | "church"
  | "family"
  | "errands"
  | "busy"
  | "travel"
  | "call"

export interface Person {
  name: string
  fullName: string
  city: string
  region: string
  timeZone: string
  latitude: number
  longitude: number
  defaultLang: Lang
  flag: string
}

/** Rotina que se repete toda semana. */
export interface Rule {
  id: string
  who: PersonId | "both"
  activity: ActivityId
  days: Weekday[]
  /** Se `end` for menor que `start`, a regra atravessa a meia-noite (ex.: sono 23:00 → 07:00). */
  start: Clock
  end: Clock
  /** Texto opcional que substitui o nome da atividade. */
  label?: Localized
  /** Muda a disponibilidade padrão da atividade só nesta regra (ex.: trabalho em que dá pra responder mensagem). */
  availability?: Availability
  /** Período em que a regra vale (inclusive). Sem isso, vale sempre. */
  from?: DateKey
  until?: DateKey
}

/** Dia (ou período) de folga: feriado, férias, atestado. Tira tudo da agenda menos o sono. */
export interface DayOff {
  id: string
  who: PersonId | "both"
  from: DateKey
  until?: DateKey
  label?: Localized
}

/** Compromisso de uma vez só. Sempre vence as regras da rotina. */
export interface OneOffEvent {
  id: string
  who: PersonId | "both"
  /** Data e horários no relógio de `clockOf`; sem ele, no relógio de quem faz. */
  date: DateKey
  start: Clock
  end: Clock
  activity: ActivityId
  label?: Localized
  /** De quem é o relógio de `date`/`start`/`end`. Obrigatório quando `who` é "both". */
  clockOf?: PersonId
}

export interface ImportantDate {
  id: string
  /** "MM-DD" para datas que repetem todo ano, ou "YYYY-MM-DD" para uma data só. */
  date: string
  label: Localized
  who?: PersonId | "both"
}

export interface CoupleData {
  people: Record<PersonId, Person>
  /** Data em que começaram a namorar ("YYYY-MM-DD"), ou null. */
  together: DateKey | null
  /** Próximo reencontro ("YYYY-MM-DD"), ou null. */
  nextVisit: { date: DateKey; label?: Localized } | null
  importantDates: ImportantDate[]
  rules: Rule[]
  daysOff: DayOff[]
  events: OneOffEvent[]
}

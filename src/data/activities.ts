import {
  Airplane01Icon,
  Book02Icon,
  Briefcase01Icon,
  Bus01Icon,
  Call02Icon,
  Calendar03Icon,
  ChurchIcon,
  Dumbbell01Icon,
  Moon02Icon,
  NoodlesIcon,
  Restaurant01Icon,
  ShoppingBag01Icon,
  Sun03Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"

import type { ActivityId, Availability } from "./types"

export type { Availability }

export type StatusId = ActivityId | "free"

export interface ActivityInfo {
  icon: typeof Sun03Icon
  availability: Availability
  /** Quem tem prioridade maior aparece quando duas regras se sobrepõem. */
  priority: number
  label: { pt: string; en: string; id: string }
}

export const ACTIVITIES: Record<StatusId, ActivityInfo> = {
  free: {
    icon: Sun03Icon,
    availability: "free",
    priority: 0,
    label: { pt: "Livre", en: "Free", id: "Santai" },
  },
  sleep: {
    icon: Moon02Icon,
    availability: "asleep",
    priority: 10,
    label: { pt: "Dormindo", en: "Sleeping", id: "Tidur" },
  },
  work: {
    icon: Briefcase01Icon,
    availability: "busy",
    priority: 20,
    label: { pt: "Trabalhando", en: "Working", id: "Kerja" },
  },
  study: {
    icon: Book02Icon,
    availability: "busy",
    priority: 20,
    label: { pt: "Estudando", en: "Studying", id: "Belajar" },
  },
  commute: {
    icon: Bus01Icon,
    availability: "limited",
    priority: 25,
    label: { pt: "No trânsito", en: "Commuting", id: "Di jalan" },
  },
  gym: {
    icon: Dumbbell01Icon,
    availability: "busy",
    priority: 30,
    label: { pt: "Academia", en: "Gym", id: "Olahraga" },
  },
  church: {
    icon: ChurchIcon,
    availability: "busy",
    priority: 30,
    label: { pt: "Igreja", en: "Church", id: "Ibadah" },
  },
  family: {
    icon: UserGroupIcon,
    availability: "limited",
    priority: 30,
    label: { pt: "Com a família", en: "With family", id: "Bareng keluarga" },
  },
  errands: {
    icon: ShoppingBag01Icon,
    availability: "limited",
    priority: 30,
    label: { pt: "Resolvendo coisas", en: "Running errands", id: "Ada urusan" },
  },
  busy: {
    icon: Calendar03Icon,
    availability: "busy",
    priority: 35,
    label: { pt: "Ocupado", en: "Busy", id: "Sibuk" },
  },
  lunch: {
    icon: Restaurant01Icon,
    availability: "limited",
    priority: 40,
    label: { pt: "Almoçando", en: "Lunch", id: "Makan siang" },
  },
  dinner: {
    icon: NoodlesIcon,
    availability: "limited",
    priority: 40,
    label: { pt: "Jantando", en: "Dinner", id: "Makan malam" },
  },
  travel: {
    icon: Airplane01Icon,
    availability: "limited",
    priority: 45,
    label: { pt: "Viajando", en: "Traveling", id: "Perjalanan" },
  },
  call: {
    icon: Call02Icon,
    availability: "free",
    priority: 50,
    label: { pt: "Chamada com você", en: "Call with you", id: "Telponan sama kamu" },
  },
}

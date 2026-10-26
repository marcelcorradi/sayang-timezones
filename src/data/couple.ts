/**
 * A agenda do casal. Este é o único arquivo que precisa mudar para adicionar
 * regras, folgas, compromissos e datas especiais.
 *
 * Horários sempre no fuso de quem faz a atividade:
 * Marcel → horário de Brasília, Gabriela → horário de Jacarta (WIB).
 *
 * Depois de editar, rode `npm run check` para ver a semana resolvida.
 */
import type { CoupleData, Weekday } from "./types"

const EVERY_DAY: Weekday[] = [0, 1, 2, 3, 4, 5, 6]
const WEEKDAYS: Weekday[] = [1, 2, 3, 4, 5]

export const couple: CoupleData = {
  people: {
    marcel: {
      name: "Marcel",
      fullName: "Marcel Corradi",
      city: "Itaúna",
      region: "MG, Brasil",
      timeZone: "America/Sao_Paulo",
      latitude: -20.0753,
      longitude: -44.5764,
      defaultLang: "pt",
      flag: "🇧🇷",
    },
    gabriela: {
      name: "Gabriela",
      fullName: "Gabriela Sitorus",
      city: "Jakarta",
      region: "Indonesia",
      timeZone: "Asia/Jakarta",
      latitude: -6.2088,
      longitude: 106.8456,
      defaultLang: "id",
      flag: "🇮🇩",
    },
  },

  // Quando o namoro ficou sério e exclusivo.
  together: "2026-10-25",
  nextVisit: null,
  importantDates: [],

  rules: [
    // Sono ainda é um palpite (23h → 7h). Ajustem quando quiserem.
    { id: "marcel-sleep", who: "marcel", activity: "sleep", days: EVERY_DAY, start: "23:00", end: "07:00" },
    // No trabalho do Marcel dá pra responder WhatsApp.
    { id: "marcel-work", who: "marcel", activity: "work", days: WEEKDAYS, start: "09:00", end: "18:00", availability: "limited" },
    { id: "marcel-lunch", who: "marcel", activity: "lunch", days: WEEKDAYS, start: "12:00", end: "13:00" },

    { id: "gabriela-sleep", who: "gabriela", activity: "sleep", days: EVERY_DAY, start: "23:00", end: "07:00" },
    { id: "gabriela-work", who: "gabriela", activity: "work", days: WEEKDAYS, start: "08:00", end: "19:00" },
    { id: "gabriela-lunch", who: "gabriela", activity: "lunch", days: WEEKDAYS, start: "12:00", end: "13:00" },
  ],

  daysOff: [],
  events: [],
}

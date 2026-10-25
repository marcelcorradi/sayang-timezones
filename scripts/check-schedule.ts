/**
 * Valida src/data/couple.ts e imprime a agenda resolvida.
 *
 *   npm run check                  → próximos 7 dias, a partir de hoje no Brasil
 *   npm run check -- 2026-12-24    → 7 dias a partir dessa data
 *   npm run check -- 2026-12-24 1  → só esse dia
 */
import { ACTIVITIES } from "@/data/activities"
import { couple } from "@/data/couple"
import type { DateKey, PersonId } from "@/data/types"
import { dayBounds, PEOPLE, segmentsBetween, talkWindows } from "@/lib/schedule"
import { addDays, formatClock, localParts } from "@/lib/time"

const errors: string[] = []
const clockRe = /^([01]\d|2[0-3]):[0-5]\d$/
const dateRe = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/
const people = Object.keys(couple.people)
const whoOk = (who: string) => who === "both" || people.includes(who)
const ids = new Set<string>()

function checkId(id: string, where: string) {
  if (ids.has(id)) errors.push(`${where}: id duplicado "${id}"`)
  ids.add(id)
}

for (const r of couple.rules) {
  const where = `rules[${r.id}]`
  checkId(r.id, where)
  if (!whoOk(r.who)) errors.push(`${where}: who inválido "${r.who}"`)
  if (!(r.activity in ACTIVITIES)) errors.push(`${where}: atividade desconhecida "${r.activity}"`)
  if (!clockRe.test(r.start) || !clockRe.test(r.end)) errors.push(`${where}: horário deve ser "HH:MM"`)
  if (r.availability && !["free", "limited", "busy", "asleep"].includes(r.availability))
    errors.push(`${where}: availability deve ser free, limited, busy ou asleep`)
  if (!r.days.length || r.days.some((d) => d < 0 || d > 6)) errors.push(`${where}: days deve ter números de 0 (dom) a 6 (sáb)`)
  for (const k of [r.from, r.until]) if (k && !dateRe.test(k)) errors.push(`${where}: data "${k}" deve ser "YYYY-MM-DD"`)
}
for (const d of couple.daysOff) {
  const where = `daysOff[${d.id}]`
  checkId(d.id, where)
  if (!whoOk(d.who)) errors.push(`${where}: who inválido "${d.who}"`)
  for (const k of [d.from, d.until]) if (k && !dateRe.test(k)) errors.push(`${where}: data "${k}" deve ser "YYYY-MM-DD"`)
}
for (const e of couple.events) {
  const where = `events[${e.id}]`
  checkId(e.id, where)
  if (!whoOk(e.who)) errors.push(`${where}: who inválido "${e.who}"`)
  if (!(e.activity in ACTIVITIES)) errors.push(`${where}: atividade desconhecida "${e.activity}"`)
  if (!dateRe.test(e.date)) errors.push(`${where}: data "${e.date}" deve ser "YYYY-MM-DD"`)
  if (!clockRe.test(e.start) || !clockRe.test(e.end)) errors.push(`${where}: horário deve ser "HH:MM"`)
  if (e.who === "both" && !e.clockOf) errors.push(`${where}: com who "both", diga de quem é o relógio em clockOf`)
  if (e.clockOf && !people.includes(e.clockOf)) errors.push(`${where}: clockOf inválido "${e.clockOf}"`)
}
for (const d of couple.importantDates) {
  checkId(d.id, `importantDates[${d.id}]`)
  if (!/^(\d{4}-)?\d{2}-\d{2}$/.test(d.date)) errors.push(`importantDates[${d.id}]: use "MM-DD" ou "YYYY-MM-DD"`)
}
if (couple.together && !dateRe.test(couple.together)) errors.push(`together: use "YYYY-MM-DD"`)
if (couple.nextVisit && !dateRe.test(couple.nextVisit.date)) errors.push(`nextVisit.date: use "YYYY-MM-DD"`)

if (errors.length) {
  console.error("✗ Problemas em src/data/couple.ts:\n  " + errors.join("\n  "))
  process.exit(1)
}
console.log(`✓ couple.ts ok — ${couple.rules.length} regras, ${couple.daysOff.length} folgas, ${couple.events.length} compromissos\n`)

const [startArg, daysArg] = process.argv.slice(2)
const base: PersonId = "marcel"
const baseTz = couple.people[base].timeZone
const startKey = (startArg as DateKey) ?? localParts(Date.now(), baseTz).dateKey
const dayCount = Number(daysArg ?? 7)
const tzOf = (p: PersonId) => couple.people[p].timeZone
const wd = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"]

for (let i = 0; i < dayCount; i++) {
  const key = addDays(startKey, i)
  const { start, end } = dayBounds(base, key)
  console.log(`━━ ${wd[localParts(start, baseTz).weekday]} ${key} (dia no Brasil) ━━`)
  for (const person of PEOPLE) {
    const other = person === "marcel" ? "gabriela" : "marcel"
    console.log(`  ${couple.people[person].name}`)
    for (const s of segmentsBetween(person, start, end)) {
      const label = s.status.label?.pt ?? ACTIVITIES[s.status.activity].label.pt
      const own = `${formatClock(s.start, tzOf(person))}–${formatClock(s.end, tzOf(person))}`
      const theirs = `${formatClock(s.start, tzOf(other))}–${formatClock(s.end, tzOf(other))}`
      const off = (s.status.dayOff ? " [folga]" : "") + (s.status.availability === "limited" ? " [dá pra mensagem]" : "")
      console.log(`    ${own} ${label.padEnd(18)} (= ${theirs} p/ ${couple.people[other].name})${off}`)
    }
  }
  const windows = talkWindows(start, end)
  console.log("  Janelas pra conversar (horário do Brasil / Jacarta):")
  for (const w of windows) {
    const tag = w.quality === "great" ? "os dois livres" : "dá pra trocar mensagem"
    console.log(
      `    ${formatClock(w.start, baseTz)}–${formatClock(w.end, baseTz)} / ${formatClock(w.start, tzOf("gabriela"))}–${formatClock(w.end, tzOf("gabriela"))}  ${tag}`
    )
  }
  if (!windows.length) console.log("    (nenhuma)")
  console.log()
}

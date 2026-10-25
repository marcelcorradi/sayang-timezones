/**
 * Palavras do dia. Quem é do Brasil vê a palavra em indonésio,
 * quem é da Indonésia vê a palavra em português.
 */
export interface Word {
  /** a palavra em indonésio */
  ind: string
  pt: string
  en: string
  note?: { pt: string; en: string; id: string }
}

export const WORDS: Word[] = [
  { ind: "sayang", pt: "querido, querida", en: "darling" },
  { ind: "rindu", pt: "saudade", en: "longing, missing someone" },
  { ind: "kangen", pt: "saudade (bem informal)", en: "miss you (casual)" },
  { ind: "aku cinta kamu", pt: "eu te amo", en: "I love you" },
  { ind: "selamat pagi", pt: "bom dia", en: "good morning" },
  { ind: "selamat siang", pt: "boa tarde (até umas 15h)", en: "good afternoon (until ~3pm)" },
  { ind: "selamat sore", pt: "boa tarde (fim de tarde)", en: "good late afternoon" },
  { ind: "selamat malam", pt: "boa noite", en: "good evening" },
  { ind: "selamat tidur", pt: "durma bem", en: "sleep well" },
  { ind: "mimpi indah", pt: "bons sonhos", en: "sweet dreams" },
  { ind: "terima kasih", pt: "obrigado, obrigada", en: "thank you" },
  { ind: "sama-sama", pt: "de nada", en: "you're welcome" },
  { ind: "apa kabar?", pt: "tudo bem?", en: "how are you?" },
  {
    ind: "sudah makan?",
    pt: "já comeu?",
    en: "have you eaten?",
    note: {
      pt: "Na Indonésia é um jeito carinhoso de perguntar se a pessoa está bem.",
      en: "In Indonesia it's a caring way to ask if someone is okay.",
      id: "Di Brasil orang lebih sering tanya “tudo bem?”.",
    },
  },
  { ind: "hati-hati", pt: "se cuida", en: "take care" },
  { ind: "cantik", pt: "linda", en: "beautiful" },
  { ind: "ganteng", pt: "bonito (pra homem)", en: "handsome" },
  { ind: "peluk", pt: "abraço", en: "hug" },
  { ind: "cium", pt: "beijo", en: "kiss" },
  { ind: "sampai jumpa", pt: "até logo", en: "see you" },
  { ind: "semangat!", pt: "força! vai dar certo!", en: "you've got this!" },
  { ind: "capek", pt: "cansado, cansada", en: "tired" },
  { ind: "lapar", pt: "com fome", en: "hungry" },
  { ind: "kerja", pt: "trabalho", en: "work" },
  { ind: "makan siang", pt: "almoço", en: "lunch" },
  { ind: "tidur", pt: "dormir", en: "to sleep" },
  { ind: "bangun", pt: "acordar", en: "to wake up" },
  { ind: "nanti", pt: "mais tarde", en: "later" },
  { ind: "sekarang", pt: "agora", en: "now" },
  { ind: "besok", pt: "amanhã", en: "tomorrow" },
  { ind: "kemarin", pt: "ontem", en: "yesterday" },
  { ind: "hari ini", pt: "hoje", en: "today" },
  { ind: "senang", pt: "feliz", en: "happy" },
  { ind: "sedih", pt: "triste", en: "sad" },
  { ind: "lucu", pt: "fofo, engraçado", en: "cute, funny" },
  { ind: "jauh", pt: "longe", en: "far" },
  { ind: "dekat", pt: "perto", en: "near" },
  { ind: "waktu", pt: "tempo, hora", en: "time" },
  { ind: "pacar", pt: "namorado, namorada", en: "boyfriend, girlfriend" },
  { ind: "cinta", pt: "amor", en: "love" },
  { ind: "kita", pt: "nós (eu e você)", en: "we (you and me)" },
  {
    ind: "jodoh",
    pt: "a pessoa destinada a você",
    en: "the one you're meant to be with",
  },
  { ind: "telepon aku ya", pt: "me liga, tá?", en: "call me, okay?" },
]

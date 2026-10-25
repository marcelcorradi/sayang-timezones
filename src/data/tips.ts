import type { Lang } from "./types"

/** Dicas curtas de gramática para quem está aprendendo `target`. O texto aparece no idioma da interface. */
export interface Tip {
  key: string
  target: Lang
  title: Record<Lang, string>
  body: Record<Lang, string>
}

export const TIPS: Tip[] = [
  {
    key: "id-no-conjugation",
    target: "id",
    title: { pt: "Verbo não muda", en: "Verbs don't change", id: "Kata kerja tidak berubah" },
    body: {
      pt: "Em indonésio o verbo é sempre igual: aku makan (eu como), dia makan (ele come), kami makan (nós comemos). O tempo vem de palavras: sudah makan (já comeu), lagi makan (está comendo), mau makan (vai comer).",
      en: "Indonesian verbs never change: aku makan (I eat), dia makan (she eats), kami makan (we eat). Time comes from extra words: sudah makan (already ate), lagi makan (is eating), mau makan (will eat).",
      id: "Kata kerja dalam bahasa Indonesia tidak berubah. Waktu ditunjukkan dengan kata seperti sudah, lagi, dan mau.",
    },
  },
  {
    key: "id-plural",
    target: "id",
    title: { pt: "Plural repetindo a palavra", en: "Plural by repeating", id: "Jamak dengan pengulangan" },
    body: {
      pt: "Pra fazer plural, repete-se a palavra: anak (criança), anak-anak (crianças). Com número nem precisa: dua anak (duas crianças).",
      en: "To make a plural, repeat the word: anak (child), anak-anak (children). With a number you don't need it: dua anak (two children).",
      id: "Bentuk jamak dibuat dengan mengulang kata: anak-anak. Kalau ada angka, tidak perlu diulang: dua anak.",
    },
  },
  {
    key: "id-adjective-after",
    target: "id",
    title: { pt: "A descrição vem depois", en: "Describing words come after", id: "Kata sifat di belakang" },
    body: {
      pt: "Igual ao português: rumah besar (casa grande), kopi manis (café doce), baju merah (roupa vermelha).",
      en: "The adjective comes after the noun: rumah besar (big house), kopi manis (sweet coffee), baju merah (red clothes).",
      id: "Kata sifat diletakkan setelah kata benda: rumah besar, kopi manis.",
    },
  },
  {
    key: "id-possessive",
    target: "id",
    title: { pt: "Meu e seu: -ku e -mu", en: "My and your: -ku and -mu", id: "Akhiran -ku dan -mu" },
    body: {
      pt: "Pra dizer “meu” e “seu”, gruda -ku ou -mu no fim: rumahku (minha casa), matamu (seus olhos), sayangku (meu amor).",
      en: "To say “my” and “your”, add -ku or -mu at the end: rumahku (my house), matamu (your eyes), sayangku (my love).",
      id: "Akhiran -ku berarti milikku dan -mu berarti milikmu: rumahku, matamu.",
    },
  },
  {
    key: "id-casual",
    target: "id",
    title: { pt: "Falado x escrito", en: "Spoken vs written", id: "Bahasa lisan dan tulisan" },
    body: {
      pt: "No dia a dia muita palavra muda: tidak vira nggak, sedang vira lagi, membeli vira beli, berbicara vira bicara. Pra falar também se usa outra palavra, ngomong. Com a Gabriela, use o jeito falado.",
      en: "Everyday speech changes many words: tidak becomes nggak, sedang becomes lagi, membeli becomes beli, berbicara becomes bicara. For “to talk” people also use a different word, ngomong.",
      id: "Dalam percakapan sehari-hari banyak kata berubah: nggak, lagi, beli, bicara. Untuk berbicara juga sering dipakai kata ngomong.",
    },
  },
  {
    key: "pt-gender",
    target: "pt",
    title: { pt: "Masculino e feminino", en: "Masculine and feminine", id: "Maskulin dan feminin" },
    body: {
      pt: "Toda palavra tem gênero: o carro, a casa. A descrição acompanha: menino bonito, menina bonita.",
      en: "Every Portuguese noun is masculine or feminine: o carro (the car), a casa (the house). Adjectives follow: menino bonito, menina bonita.",
      id: "Setiap kata benda dalam bahasa Portugis punya jenis: o carro (maskulin), a casa (feminin). Kata sifat ikut berubah: menino bonito, menina bonita.",
    },
  },
  {
    key: "pt-conjugation",
    target: "pt",
    title: { pt: "O verbo muda com a pessoa", en: "Verbs change with the person", id: "Kata kerja berubah" },
    body: {
      pt: "Eu falo, você fala, nós falamos, eles falam.",
      en: "Portuguese verbs change with who does the action: eu falo (I speak), você fala (you speak), nós falamos (we speak), eles falam (they speak).",
      id: "Dalam bahasa Portugis kata kerja berubah sesuai pelakunya: eu falo (aku bicara), você fala (kamu bicara), nós falamos (kita bicara).",
    },
  },
  {
    key: "pt-ser-estar",
    target: "pt",
    title: { pt: "Ser e estar", en: "Two verbs for “to be”", id: "Dua kata untuk “adalah”" },
    body: {
      pt: "Ser é pro que é permanente (eu sou brasileiro); estar é pro momento (eu estou cansado).",
      en: "Portuguese has two verbs for “to be”: ser for what's permanent (eu sou brasileiro, I am Brazilian) and estar for the moment (eu estou cansado, I am tired).",
      id: "Ada dua kata kerja: ser untuk hal yang tetap (eu sou indonésia, aku orang Indonesia) dan estar untuk keadaan sekarang (eu estou cansada, aku capek).",
    },
  },
  {
    key: "pt-voce-a-gente",
    target: "pt",
    title: { pt: "Você e a gente", en: "Você and a gente", id: "Você dan a gente" },
    body: {
      pt: "No Brasil se usa “você” no lugar de “tu”, e “a gente” no lugar de “nós” na conversa.",
      en: "In Brazil people say “você” for “you” and, in conversation, “a gente” for “we”: a gente se fala amanhã (we'll talk tomorrow).",
      id: "Di Brasil, “você” berarti kamu, dan dalam obrolan “a gente” berarti kita: a gente se fala amanhã (kita ngobrol besok).",
    },
  },
  {
    key: "en-articles",
    target: "en",
    title: { pt: "A, an e the", en: "A, an and the", id: "A, an, dan the" },
    body: {
      pt: "“A” e “an” são um/uma (an antes de som de vogal: an apple). “The” é o/a/os/as e não muda.",
      en: "Use “a” or “an” for one of something (an before a vowel sound: an apple) and “the” for something specific.",
      id: "“A” dan “an” berarti sebuah (an sebelum bunyi vokal: an apple). “The” untuk sesuatu yang sudah jelas, mirip “itu” atau “-nya”.",
    },
  },
  {
    key: "en-do-questions",
    target: "en",
    title: { pt: "Perguntas com do e does", en: "Questions with do and does", id: "Pertanyaan dengan do dan does" },
    body: {
      pt: "Pra perguntar, coloca-se do (ou does com he/she) no começo: Do you like coffee? Does she work today?",
      en: "Questions start with do, or does with he/she/it: Do you like coffee? Does she work today?",
      id: "Pertanyaan diawali do, atau does untuk he/she/it: Do you like coffee? (Kamu suka kopi?)",
    },
  },
  {
    key: "en-third-person",
    target: "en",
    title: { pt: "O -s do he e she", en: "The -s for he and she", id: "Akhiran -s untuk he dan she" },
    body: {
      pt: "No presente, só ele/ela ganha -s: I work, you work, she works.",
      en: "In the present tense, only he/she/it gets an -s: I work, you work, she works.",
      id: "Dalam present tense, hanya he/she/it yang mendapat -s: I work, she works.",
    },
  },
  {
    key: "en-adjective-before",
    target: "en",
    title: { pt: "A descrição vem antes", en: "Adjectives come first", id: "Kata sifat di depan" },
    body: {
      pt: "Ao contrário do português: a red shirt (uma camisa vermelha), a big house (uma casa grande).",
      en: "Adjectives go before the noun: a red shirt, a big house.",
      id: "Kebalikan dari bahasa Indonesia: a red shirt (baju merah), a big house (rumah besar).",
    },
  },
]

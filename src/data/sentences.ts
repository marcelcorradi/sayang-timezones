import type { Lang } from "./types"
import type { Topic } from "./vocab"

/**
 * Frases para o exercício de montar (tocar as palavras na ordem certa).
 * Cada frase entra nas lições da unidade `topic`. Mantenha frases curtas (até ~7 palavras):
 * as peças são as palavras da frase no idioma que está sendo aprendido.
 */
export interface Sentence {
  key: string
  topic: Topic
  text: Record<Lang, string>
}

const s = (key: string, topic: Topic, pt: string, en: string, id: string): Sentence => ({
  key: `s:${key}`,
  topic,
  text: { pt, en, id },
})

export const SENTENCES: Sentence[] = [
  s("good-morning-love", "greetings", "Bom dia, meu amor", "Good morning, my love", "Selamat pagi, sayangku"),
  s("thanks-help", "greetings", "Obrigado pela ajuda", "Thanks for the help", "Terima kasih atas bantuannya"),
  s("my-name", "basics", "Meu nome é Marcel", "My name is Marcel", "Nama saya Marcel"),
  s("my-friend", "basics", "Ela é minha amiga", "She is my friend", "Dia teman saya"),
  s("two-coffees", "numbers", "Eu quero dois cafés", "I want two coffees", "Saya mau dua kopi"),
  s("three-days", "numbers", "Faltam três dias", "Three days to go", "Tinggal tiga hari lagi"),
  s("red-shirt", "colors", "Eu gosto da camisa vermelha", "I like the red shirt", "Saya suka baju merah itu"),
  s("blue-sky", "colors", "O céu está azul", "The sky is blue", "Langitnya biru"),
  s("mother-lives", "family", "Minha mãe mora em Itaúna", "My mother lives in Itaúna", "Ibu saya tinggal di Itaúna"),
  s("younger-sister", "family", "Eu tenho uma irmã mais nova", "I have a younger sister", "Saya punya adik perempuan"),
  s("hungry", "food", "Eu estou com fome", "I am hungry", "Saya lapar"),
  s("tasty-food", "food", "Essa comida está muito gostosa", "This food is very tasty", "Makanan ini enak sekali"),
  s("going-to-sleep", "time", "Eu vou dormir agora", "I am going to sleep now", "Aku mau tidur sekarang"),
  s("see-you-tomorrow", "time", "Até amanhã", "See you tomorrow", "Sampai besok"),
  s("today-friday", "days", "Hoje é sexta-feira", "Today is Friday", "Hari ini hari Jumat"),
  s("sunday-rest", "days", "No domingo eu descanso", "On Sunday I rest", "Hari Minggu aku istirahat"),
  s("go-beach", "verbs", "Eu quero ir à praia", "I want to go to the beach", "Aku mau pergi ke pantai"),
  s("learning-language", "verbs", "Eu estou aprendendo uma língua nova", "I am learning a new language", "Aku sedang belajar bahasa baru"),
  s("big-house", "adjectives", "A casa é muito grande", "The house is very big", "Rumahnya besar sekali"),
  s("this-is-easy", "adjectives", "Isso é fácil", "This is easy", "Ini mudah"),
  s("very-happy", "feelings", "Hoje eu estou muito feliz", "Today I am very happy", "Hari ini aku senang sekali"),
  s("dont-be-sad", "feelings", "Não fique triste", "Don't be sad", "Jangan sedih"),
  s("where-are-you", "questions", "Onde você está?", "Where are you?", "Kamu di mana?"),
  s("wake-up-time", "questions", "Que horas você acorda?", "What time do you wake up?", "Kamu bangun jam berapa?"),
  s("raining-here", "weather", "Está chovendo aqui", "It is raining here", "Di sini lagi hujan"),
  s("very-hot", "weather", "Hoje está muito quente", "Today it is very hot", "Hari ini panas sekali"),
  s("where-phone", "home", "Onde está meu celular?", "Where is my phone?", "Ponsel saya di mana?"),
  s("in-my-room", "home", "Eu estou no meu quarto", "I am in my room", "Aku ada di kamarku"),
  s("headache", "body", "Estou com dor de cabeça", "I have a headache", "Kepala saya sakit"),
  s("beautiful-eyes", "body", "Seus olhos são lindos", "Your eyes are beautiful", "Matamu indah"),
  s("where-airport", "places", "Onde fica o aeroporto?", "Where is the airport?", "Bandaranya di mana?"),
  s("turn-left", "places", "Vire à esquerda", "Turn left", "Belok kiri"),
  s("how-much-this", "shopping", "Quanto custa isso?", "How much is this?", "Ini berapa?"),
  s("too-expensive", "shopping", "Isso é muito caro", "This is very expensive", "Ini mahal sekali"),
  s("very-busy", "work", "Hoje estou muito ocupado", "Today I am very busy", "Hari ini aku sibuk sekali"),
  s("work-office", "work", "Eu trabalho num escritório", "I work in an office", "Saya bekerja di kantor"),
  s("want-see-you", "love", "Eu quero te ver logo", "I want to see you soon", "Aku mau cepat ketemu kamu"),
  s("love-you-much", "love", "Eu te amo muito", "I love you so much", "Aku sayang kamu banget"),
  s("call-tonight", "phrases", "Eu te ligo à noite", "I will call you tonight", "Nanti malam aku telepon kamu"),
  s("no-worries", "phrases", "Não se preocupe", "Don't worry", "Jangan khawatir"),
]

/** As peças de uma frase: as palavras, sem a pontuação. */
export const tokensOf = (text: string) =>
  text
    .replace(/[.,!?¿¡]/g, "")
    .split(/\s+/)
    .filter(Boolean)

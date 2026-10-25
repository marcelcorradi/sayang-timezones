import type { Lang } from "./types"

/**
 * Vocabulário do "Aprender" e da palavra do dia, nos três idiomas.
 * Cada entrada precisa ter `text.pt`, `text.en` e `text.id` (indonésio); `note` é opcional.
 * Para crescer o curso, adicione entradas aqui ou um tema novo em TOPICS.
 */
export type Topic =
  | "greetings"
  | "basics"
  | "numbers"
  | "colors"
  | "family"
  | "food"
  | "time"
  | "days"
  | "verbs"
  | "adjectives"
  | "feelings"
  | "questions"
  | "weather"
  | "home"
  | "body"
  | "places"
  | "shopping"
  | "work"
  | "love"
  | "phrases"

export interface VocabItem {
  key: string
  topic: Topic
  text: Record<Lang, string>
  note?: Record<Lang, string>
}

/** As unidades do curso, na ordem em que aparecem. */
export const TOPICS: { id: Topic; emoji: string; title: Record<Lang, string> }[] = [
  { id: "greetings", emoji: "👋", title: { pt: "Cumprimentos", en: "Greetings", id: "Salam" } },
  { id: "basics", emoji: "🌱", title: { pt: "Primeiras palavras", en: "First words", id: "Kata pertama" } },
  { id: "numbers", emoji: "🔢", title: { pt: "Números", en: "Numbers", id: "Angka" } },
  { id: "colors", emoji: "🎨", title: { pt: "Cores", en: "Colors", id: "Warna" } },
  { id: "family", emoji: "👨‍👩‍👧", title: { pt: "Família", en: "Family", id: "Keluarga" } },
  { id: "food", emoji: "🍚", title: { pt: "Comida", en: "Food", id: "Makanan" } },
  { id: "time", emoji: "⏰", title: { pt: "Tempo e rotina", en: "Time and routine", id: "Waktu dan rutinitas" } },
  { id: "days", emoji: "📅", title: { pt: "Dias e meses", en: "Days and months", id: "Hari dan bulan" } },
  { id: "verbs", emoji: "🏃", title: { pt: "Verbos do dia a dia", en: "Everyday verbs", id: "Kata kerja sehari-hari" } },
  { id: "adjectives", emoji: "📏", title: { pt: "Como as coisas são", en: "Describing things", id: "Kata sifat" } },
  { id: "feelings", emoji: "🌦️", title: { pt: "Sentimentos", en: "Feelings", id: "Perasaan" } },
  { id: "questions", emoji: "❓", title: { pt: "Perguntas", en: "Questions", id: "Pertanyaan" } },
  { id: "weather", emoji: "☀️", title: { pt: "Clima", en: "Weather", id: "Cuaca" } },
  { id: "home", emoji: "🏠", title: { pt: "Casa e objetos", en: "Home and things", id: "Rumah dan barang" } },
  { id: "body", emoji: "🖐️", title: { pt: "Corpo", en: "Body", id: "Tubuh" } },
  { id: "places", emoji: "✈️", title: { pt: "Lugares e viagem", en: "Places and travel", id: "Tempat dan perjalanan" } },
  { id: "shopping", emoji: "🛍️", title: { pt: "Compras", en: "Shopping", id: "Belanja" } },
  { id: "work", emoji: "💼", title: { pt: "Trabalho e estudo", en: "Work and study", id: "Kerja dan belajar" } },
  { id: "love", emoji: "💗", title: { pt: "Carinho", en: "Affection", id: "Kasih sayang" } },
  { id: "phrases", emoji: "💬", title: { pt: "Frases do dia a dia", en: "Everyday phrases", id: "Kalimat sehari-hari" } },
]

const v = (key: string, topic: Topic, pt: string, en: string, id: string, note?: Record<Lang, string>): VocabItem => ({
  key,
  topic,
  text: { pt, en, id },
  note,
})

export const VOCAB: VocabItem[] = [
  v("hi", "greetings", "oi", "hi", "hai"),
  v("good-morning", "greetings", "bom dia", "good morning", "selamat pagi"),
  v("good-afternoon", "greetings", "boa tarde", "good afternoon", "selamat siang", {
    pt: "Em indonésio, “siang” vai até umas 15h. No fim da tarde se diz “selamat sore”.",
    en: "In Indonesian, “siang” lasts until about 3pm. Late afternoon is “selamat sore”.",
    id: "Di Portugis, “boa tarde” dipakai dari siang sampai sore.",
  }),
  v("good-evening", "greetings", "boa noite", "good evening", "selamat malam"),
  v("sleep-well", "greetings", "durma bem", "sleep well", "selamat tidur"),
  v("how-are-you", "greetings", "tudo bem?", "how are you?", "apa kabar?"),
  v("im-fine", "greetings", "estou bem", "I'm fine", "aku baik-baik saja"),
  v("thank-you", "greetings", "obrigado, obrigada", "thank you", "terima kasih", {
    pt: "Em português, homem diz “obrigado” e mulher diz “obrigada”.",
    en: "In Portuguese, men say “obrigado” and women say “obrigada”.",
    id: "Di Portugis, laki-laki bilang “obrigado”, perempuan bilang “obrigada”.",
  }),
  v("welcome-reply", "greetings", "de nada", "you're welcome", "sama-sama"),
  v("see-you", "greetings", "até logo", "see you", "sampai jumpa"),
  v("sorry", "greetings", "desculpa", "sorry", "maaf"),
  v("please", "greetings", "por favor", "please", "tolong", {
    pt: "“Tolong” é pra pedir algo. Pra oferecer (“fique à vontade”), se diz “silakan”.",
    en: "“Tolong” is for asking. When offering (“go ahead”), say “silakan”.",
    id: "Di Portugis, “por favor” dipakai untuk minta tolong maupun mempersilakan.",
  }),
  v("welcome", "greetings", "bem-vindo, bem-vinda", "welcome", "selamat datang"),

  v("yes", "basics", "sim", "yes", "ya"),
  v("no", "basics", "não", "no", "tidak", {
    pt: "No dia a dia, quase todo mundo fala “nggak”.",
    en: "In everyday speech, most people say “nggak”.",
    id: "Di Portugis, “não” dipakai di semua situasi.",
  }),
  v("i", "basics", "eu", "I", "aku"),
  v("you", "basics", "você", "you", "kamu"),
  v("we", "basics", "nós", "we", "kita"),
  v("this", "basics", "isso", "this", "ini"),
  v("that", "basics", "aquilo", "that", "itu"),
  v("water", "basics", "água", "water", "air"),
  v("house", "basics", "casa", "house", "rumah"),
  v("friend", "basics", "amigo, amiga", "friend", "teman"),
  v("family", "basics", "família", "family", "keluarga"),
  v("name", "basics", "nome", "name", "nama"),

  v("darling", "love", "querido, querida", "darling", "sayang"),
  v("love", "love", "amor", "love", "cinta"),
  v("i-love-you", "love", "eu te amo", "I love you", "aku cinta kamu"),
  v("i-miss-you", "love", "estou com saudade de você", "I miss you", "aku kangen kamu"),
  v("longing", "love", "saudade", "longing", "rindu"),
  v("beautiful", "love", "linda", "beautiful", "cantik"),
  v("handsome", "love", "bonito", "handsome", "ganteng"),
  v("hug", "love", "abraço", "hug", "peluk"),
  v("kiss", "love", "beijo", "kiss", "cium"),
  v("partner", "love", "namorado, namorada", "boyfriend, girlfriend", "pacar"),
  v("soulmate", "love", "alma gêmea", "soulmate", "belahan jiwa"),
  v("heart", "love", "coração", "heart", "hati", {
    pt: "“Hati” é o coração dos sentimentos. O órgão se chama “jantung”.",
    en: "“Hati” is the heart of feelings. The organ is “jantung”.",
    id: "Di Portugis, “coração” dipakai untuk perasaan dan juga organ jantung.",
  }),
  v("together", "love", "juntos", "together", "bersama"),
  v("forever", "love", "para sempre", "forever", "selamanya"),

  v("happy", "feelings", "feliz", "happy", "senang"),
  v("sad", "feelings", "triste", "sad", "sedih"),
  v("tired", "feelings", "cansado, cansada", "tired", "capek"),
  v("hungry", "feelings", "com fome", "hungry", "lapar"),
  v("sleepy", "feelings", "com sono", "sleepy", "ngantuk"),
  v("bored", "feelings", "entediado, entediada", "bored", "bosan"),
  v("angry", "feelings", "bravo, brava", "angry", "marah"),
  v("scared", "feelings", "com medo", "scared", "takut"),
  v("excited", "feelings", "animado, animada", "excited", "bersemangat"),
  v("calm", "feelings", "calmo, calma", "calm", "tenang"),
  v("jealous", "feelings", "com ciúmes", "jealous", "cemburu"),
  v("sick", "feelings", "doente", "sick", "sakit"),

  v("today", "time", "hoje", "today", "hari ini"),
  v("tomorrow", "time", "amanhã", "tomorrow", "besok"),
  v("yesterday", "time", "ontem", "yesterday", "kemarin"),
  v("now", "time", "agora", "now", "sekarang"),
  v("later", "time", "mais tarde", "later", "nanti"),
  v("morning", "time", "manhã", "morning", "pagi"),
  v("night", "time", "noite", "night", "malam"),
  v("to-sleep", "time", "dormir", "to sleep", "tidur"),
  v("to-wake-up", "time", "acordar", "to wake up", "bangun"),
  v("to-work", "time", "trabalhar", "to work", "bekerja"),
  v("hour", "time", "hora", "hour", "jam"),
  v("day", "time", "dia", "day", "hari"),
  v("week", "time", "semana", "week", "minggu", {
    pt: "“Minggu” também quer dizer domingo.",
    en: "“Minggu” also means Sunday.",
    id: "Di Portugis, minggu adalah “semana” dan hari Minggu adalah “domingo”.",
  }),
  v("weekend", "time", "fim de semana", "weekend", "akhir pekan"),

  v("to-eat", "food", "comer", "to eat", "makan"),
  v("to-drink", "food", "beber", "to drink", "minum"),
  v("rice", "food", "arroz", "rice", "nasi", {
    pt: "“Nasi” é o arroz já cozido. O grão cru se chama “beras”.",
    en: "“Nasi” is cooked rice. Uncooked rice is “beras”.",
    id: "Di Portugis, nasi dan beras sama-sama disebut “arroz”.",
  }),
  v("chicken", "food", "frango", "chicken", "ayam"),
  v("coffee", "food", "café", "coffee", "kopi"),
  v("delicious", "food", "gostoso", "delicious", "enak"),
  v("spicy", "food", "apimentado", "spicy", "pedas"),
  v("sweet", "food", "doce", "sweet", "manis"),
  v("breakfast", "food", "café da manhã", "breakfast", "sarapan"),
  v("lunch", "food", "almoço", "lunch", "makan siang"),
  v("dinner", "food", "jantar", "dinner", "makan malam"),
  v("fried-rice", "food", "arroz frito", "fried rice", "nasi goreng"),
  v("cheese-bread", "food", "pão de queijo", "cheese bread", "roti keju", {
    pt: "O pão de queijo é de Minas Gerais, a terra do Marcel.",
    en: "Pão de queijo comes from Minas Gerais, where Marcel lives.",
    id: "Pão de queijo berasal dari Minas Gerais, tempat Marcel tinggal.",
  }),

  v("what", "questions", "o quê?", "what?", "apa?"),
  v("who", "questions", "quem?", "who?", "siapa?"),
  v("where", "questions", "onde?", "where?", "di mana?"),
  v("when", "questions", "quando?", "when?", "kapan?"),
  v("why", "questions", "por quê?", "why?", "kenapa?"),
  v("how", "questions", "como?", "how?", "bagaimana?"),
  v("how-much", "questions", "quanto custa?", "how much is it?", "berapa harganya?"),
  v("what-time", "questions", "que horas são?", "what time is it?", "jam berapa sekarang?"),
  v("what-doing", "questions", "o que você está fazendo?", "what are you doing?", "kamu lagi apa?"),
  v("have-you-eaten", "questions", "você já comeu?", "have you eaten?", "sudah makan?", {
    pt: "Na Indonésia é um jeito carinhoso de perguntar se a pessoa está bem.",
    en: "In Indonesia it's a caring way to ask if someone is okay.",
    id: "Di Brasil orang lebih sering tanya “tudo bem?”.",
  }),
  v("are-you-free", "questions", "você está livre?", "are you free?", "kamu lagi senggang?"),
  v("can-i-call", "questions", "posso te ligar?", "can I call you?", "boleh aku telepon kamu?"),

  v("at-work", "phrases", "estou no trabalho", "I'm at work", "aku lagi kerja"),
  v("call-later", "phrases", "te ligo mais tarde", "I'll call you later", "nanti aku telepon ya"),
  v("take-care", "phrases", "se cuida", "take care", "hati-hati ya"),
  v("sweet-dreams", "phrases", "bons sonhos", "sweet dreams", "mimpi indah"),
  v("you-got-this", "phrases", "você consegue!", "you've got this!", "semangat!"),
  v("proud", "phrases", "tenho orgulho de você", "I'm proud of you", "aku bangga sama kamu"),
  v("thinking-of-you", "phrases", "estou pensando em você", "I'm thinking of you", "aku lagi mikirin kamu"),
  v("cant-wait", "phrases", "não vejo a hora de te ver", "I can't wait to see you", "aku nggak sabar ketemu kamu"),
  v("forgive-me", "phrases", "me desculpa", "I'm sorry", "maafin aku"),
  v("no-problem", "phrases", "sem problema", "no problem", "nggak apa-apa"),
  v("dont-understand", "phrases", "não entendi", "I don't understand", "aku nggak ngerti"),
  v("say-again", "phrases", "pode repetir?", "can you say that again?", "bisa diulang?"),
  v("dont-worry", "phrases", "não se preocupa", "don't worry", "jangan khawatir"),
  v("wait-a-moment", "phrases", "espera um pouco", "wait a moment", "tunggu sebentar"),

  v("zero", "numbers", "zero", "zero", "nol"),
  v("one", "numbers", "um", "one", "satu"),
  v("two", "numbers", "dois", "two", "dua"),
  v("three", "numbers", "três", "three", "tiga"),
  v("four", "numbers", "quatro", "four", "empat"),
  v("five", "numbers", "cinco", "five", "lima"),
  v("six", "numbers", "seis", "six", "enam"),
  v("seven", "numbers", "sete", "seven", "tujuh"),
  v("eight", "numbers", "oito", "eight", "delapan"),
  v("nine", "numbers", "nove", "nine", "sembilan"),
  v("ten", "numbers", "dez", "ten", "sepuluh"),
  v("eleven", "numbers", "onze", "eleven", "sebelas", {
    pt: "De 11 a 19 se usa “belas”: 12 = dua belas, 15 = lima belas.",
    en: "From 11 to 19 Indonesian uses “belas”: 12 = dua belas, 15 = lima belas.",
    id: "Di Portugis, 11 sampai 15 punya nama sendiri: onze, doze, treze, catorze, quinze.",
  }),
  v("twenty", "numbers", "vinte", "twenty", "dua puluh", {
    pt: "As dezenas são número + “puluh”: 20 = dua puluh, 30 = tiga puluh.",
    en: "Tens are number + “puluh”: 20 = dua puluh, 30 = tiga puluh.",
    id: "Di Portugis, puluhan punya nama sendiri: vinte (20), trinta (30), quarenta (40).",
  }),
  v("hundred", "numbers", "cem", "one hundred", "seratus"),
  v("thousand", "numbers", "mil", "one thousand", "seribu"),

  v("red", "colors", "vermelho", "red", "merah"),
  v("blue", "colors", "azul", "blue", "biru"),
  v("green", "colors", "verde", "green", "hijau"),
  v("yellow", "colors", "amarelo", "yellow", "kuning"),
  v("black", "colors", "preto", "black", "hitam"),
  v("white", "colors", "branco", "white", "putih"),
  v("pink", "colors", "rosa", "pink", "merah muda"),
  v("purple", "colors", "roxo", "purple", "ungu"),
  v("orange", "colors", "laranja", "orange", "oranye"),
  v("brown", "colors", "marrom", "brown", "cokelat"),
  v("gray", "colors", "cinza", "gray", "abu-abu"),

  v("mother", "family", "mãe", "mother", "ibu"),
  v("father", "family", "pai", "father", "ayah"),
  v("older-sibling", "family", "irmão ou irmã mais velha", "older brother or sister", "kakak", {
    pt: "Em indonésio, irmão é por idade, não por gênero: “kakak” é o mais velho, “adik” o mais novo.",
    en: "Indonesian names siblings by age, not gender: “kakak” is older, “adik” is younger.",
    id: "Di Portugis, saudara dibedakan menurut jenis kelamin: irmão (laki-laki), irmã (perempuan).",
  }),
  v("younger-sibling", "family", "irmão ou irmã mais nova", "younger brother or sister", "adik"),
  v("child", "family", "filho, filha", "child", "anak"),
  v("grandmother", "family", "avó", "grandmother", "nenek"),
  v("grandfather", "family", "avô", "grandfather", "kakek"),
  v("husband", "family", "marido", "husband", "suami"),
  v("wife", "family", "esposa", "wife", "istri"),
  v("parents", "family", "pais", "parents", "orang tua"),
  v("cousin", "family", "primo, prima", "cousin", "sepupu"),
  v("uncle", "family", "tio", "uncle", "paman"),
  v("aunt", "family", "tia", "aunt", "bibi"),

  v("monday", "days", "segunda-feira", "Monday", "Senin"),
  v("tuesday", "days", "terça-feira", "Tuesday", "Selasa"),
  v("wednesday", "days", "quarta-feira", "Wednesday", "Rabu"),
  v("thursday", "days", "quinta-feira", "Thursday", "Kamis"),
  v("friday", "days", "sexta-feira", "Friday", "Jumat"),
  v("saturday", "days", "sábado", "Saturday", "Sabtu"),
  v("sunday", "days", "domingo", "Sunday", "Minggu"),
  v("month", "days", "mês", "month", "bulan", {
    pt: "“Bulan” também quer dizer lua.",
    en: "“Bulan” also means moon.",
    id: "Di Portugis, bulan (waktu) adalah “mês” dan bulan di langit adalah “lua”.",
  }),
  v("year", "days", "ano", "year", "tahun"),
  v("january", "days", "janeiro", "January", "Januari"),
  v("december", "days", "dezembro", "December", "Desember"),

  v("to-go", "verbs", "ir", "to go", "pergi"),
  v("to-come", "verbs", "vir", "to come", "datang"),
  v("to-see", "verbs", "ver", "to see", "melihat"),
  v("to-want", "verbs", "querer", "to want", "mau"),
  v("to-have", "verbs", "ter", "to have", "punya"),
  v("to-know", "verbs", "saber", "to know", "tahu"),
  v("to-like", "verbs", "gostar", "to like", "suka"),
  v("to-speak", "verbs", "falar", "to speak", "berbicara", {
    pt: "No dia a dia se fala “ngomong”.",
    en: "In casual speech people say “ngomong”.",
    id: "Di Portugis, “falar” dipakai di semua situasi.",
  }),
  v("to-read", "verbs", "ler", "to read", "membaca"),
  v("to-write", "verbs", "escrever", "to write", "menulis"),
  v("to-give", "verbs", "dar", "to give", "memberi"),
  v("to-wait", "verbs", "esperar", "to wait", "menunggu"),
  v("to-help", "verbs", "ajudar", "to help", "membantu"),
  v("to-study", "verbs", "estudar", "to study", "belajar"),
  v("to-play", "verbs", "jogar, brincar", "to play", "bermain"),
  v("to-cook", "verbs", "cozinhar", "to cook", "memasak"),
  v("to-walk", "verbs", "andar", "to walk", "berjalan"),
  v("to-understand", "verbs", "entender", "to understand", "mengerti"),

  v("big", "adjectives", "grande", "big", "besar"),
  v("small", "adjectives", "pequeno", "small", "kecil"),
  v("new", "adjectives", "novo", "new", "baru"),
  v("old-thing", "adjectives", "velho (coisa)", "old (thing)", "lama", {
    pt: "Pra pessoas idosas se diz “tua”.",
    en: "For elderly people, say “tua”.",
    id: "Di Portugis, “velho” dipakai untuk barang maupun orang.",
  }),
  v("good", "adjectives", "bom", "good", "bagus"),
  v("bad", "adjectives", "ruim", "bad", "jelek"),
  v("fast", "adjectives", "rápido", "fast", "cepat"),
  v("slow", "adjectives", "devagar", "slow", "lambat"),
  v("easy", "adjectives", "fácil", "easy", "mudah"),
  v("difficult", "adjectives", "difícil", "difficult", "sulit"),
  v("many", "adjectives", "muitos", "many", "banyak"),
  v("few", "adjectives", "poucos", "few", "sedikit"),
  v("long", "adjectives", "comprido", "long", "panjang"),
  v("short", "adjectives", "curto", "short", "pendek"),
  v("tall", "adjectives", "alto", "tall", "tinggi"),
  v("clean", "adjectives", "limpo", "clean", "bersih"),
  v("dirty", "adjectives", "sujo", "dirty", "kotor"),

  v("weather", "weather", "clima", "weather", "cuaca"),
  v("hot", "weather", "quente", "hot", "panas"),
  v("cold", "weather", "frio", "cold", "dingin"),
  v("rain", "weather", "chuva", "rain", "hujan"),
  v("sun", "weather", "sol", "sun", "matahari"),
  v("wind", "weather", "vento", "wind", "angin"),
  v("cloudy", "weather", "nublado", "cloudy", "berawan"),
  v("storm", "weather", "tempestade", "storm", "badai"),

  v("phone", "home", "celular", "phone", "ponsel", {
    pt: "No dia a dia todo mundo fala “HP” (lê-se “ha-pe”).",
    en: "In everyday speech everyone says “HP” (said “ha-pay”).",
    id: "Di Brasil, HP disebut “celular”.",
  }),
  v("door", "home", "porta", "door", "pintu"),
  v("window", "home", "janela", "window", "jendela"),
  v("bed", "home", "cama", "bed", "tempat tidur"),
  v("table", "home", "mesa", "table", "meja"),
  v("chair", "home", "cadeira", "chair", "kursi"),
  v("car", "home", "carro", "car", "mobil"),
  v("motorbike", "home", "moto", "motorbike", "motor"),
  v("book", "home", "livro", "book", "buku"),
  v("key", "home", "chave", "key", "kunci"),
  v("room", "home", "quarto", "bedroom", "kamar"),
  v("kitchen", "home", "cozinha", "kitchen", "dapur"),
  v("clothes", "home", "roupa", "clothes", "baju"),

  v("head", "body", "cabeça", "head", "kepala"),
  v("eye", "body", "olho", "eye", "mata"),
  v("hand", "body", "mão", "hand", "tangan"),
  v("foot", "body", "pé", "foot", "kaki", {
    pt: "“Kaki” serve pra pé e pra perna.",
    en: "“Kaki” means both foot and leg.",
    id: "Di Portugis, telapak kaki adalah “pé” dan tungkai adalah “perna”.",
  }),
  v("mouth", "body", "boca", "mouth", "mulut"),
  v("hair", "body", "cabelo", "hair", "rambut"),
  v("nose", "body", "nariz", "nose", "hidung"),
  v("ear", "body", "orelha", "ear", "telinga"),
  v("face", "body", "rosto", "face", "wajah"),

  v("airport", "places", "aeroporto", "airport", "bandara"),
  v("hotel", "places", "hotel", "hotel", "hotel"),
  v("beach", "places", "praia", "beach", "pantai"),
  v("city", "places", "cidade", "city", "kota"),
  v("street", "places", "rua", "street", "jalan"),
  v("left", "places", "esquerda", "left", "kiri"),
  v("right", "places", "direita", "right", "kanan"),
  v("straight", "places", "em frente", "straight ahead", "lurus"),
  v("ticket", "places", "passagem", "ticket", "tiket"),
  v("passport", "places", "passaporte", "passport", "paspor"),
  v("near", "places", "perto", "near", "dekat"),
  v("far", "places", "longe", "far", "jauh"),
  v("plane", "places", "avião", "plane", "pesawat"),
  v("country", "places", "país", "country", "negara"),

  v("to-buy", "shopping", "comprar", "to buy", "membeli"),
  v("money", "shopping", "dinheiro", "money", "uang"),
  v("price", "shopping", "preço", "price", "harga"),
  v("expensive", "shopping", "caro", "expensive", "mahal"),
  v("cheap", "shopping", "barato", "cheap", "murah"),
  v("market", "shopping", "feira", "market", "pasar"),
  v("store", "shopping", "loja", "store", "toko"),
  v("discount", "shopping", "desconto", "discount", "diskon"),
  v("to-pay", "shopping", "pagar", "to pay", "membayar"),

  v("job", "work", "trabalho", "job", "pekerjaan"),
  v("office", "work", "escritório", "office", "kantor"),
  v("school", "work", "escola", "school", "sekolah"),
  v("teacher", "work", "professor, professora", "teacher", "guru"),
  v("student", "work", "estudante", "student", "pelajar"),
  v("boss", "work", "chefe", "boss", "bos"),
  v("meeting", "work", "reunião", "meeting", "rapat"),
  v("busy", "work", "ocupado, ocupada", "busy", "sibuk"),
  v("holiday", "work", "feriado", "holiday", "hari libur"),
  v("salary", "work", "salário", "salary", "gaji"),
  v("to-finish", "work", "terminar", "to finish", "selesai"),
]

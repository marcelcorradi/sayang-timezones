import type { Lang } from "./types"
import type { Topic } from "./vocab"

/**
 * Explicação que abre cada unidade, antes das palavras e das perguntas.
 * UNIT_INTROS[unidade][idioma que está aprendendo][idioma de quem lê].
 * Só existem as combinações possíveis (ninguém aprende o próprio idioma); `en` serve de reserva.
 */
type Intro = Partial<Record<Lang, Partial<Record<Lang, string>>>>

export const UNIT_INTROS: Record<Topic, Intro> = {
  greetings: {
    id: {
      pt: "Em indonésio, o cumprimento muda com a hora do dia: selamat pagi (manhã), selamat siang (até umas 15h), selamat sore (fim de tarde) e selamat malam (noite). “Selamat” sozinho quer dizer algo como “que seja bom”.",
      en: "Indonesian greetings change with the time of day: selamat pagi (morning), selamat siang (until about 3pm), selamat sore (late afternoon) and selamat malam (evening). “Selamat” on its own means something like “may it be good”.",
    },
    pt: {
      id: "Salam dalam bahasa Portugis mengikuti waktu: bom dia (pagi), boa tarde (siang sampai sore), boa noite (malam). Di Brasil orang juga sering bilang “oi” dan “tudo bem?” untuk menyapa.",
      en: "Portuguese greetings follow the time of day: bom dia (morning), boa tarde (afternoon), boa noite (evening and night). In Brazil people also just say “oi” and “tudo bem?”.",
    },
    en: {
      pt: "Em inglês os cumprimentos são simples: hi e hello servem a qualquer hora. Good morning, good afternoon e good evening são mais formais; good night é só pra se despedir antes de dormir.",
      id: "Salam dalam bahasa Inggris sederhana: hi dan hello bisa dipakai kapan saja. Good morning, good afternoon, dan good evening lebih formal; good night hanya dipakai saat berpisah sebelum tidur.",
    },
  },
  basics: {
    id: {
      pt: "O indonésio usa o alfabeto latino e se lê quase como se escreve. Não tem artigo (o, a, um) nem gênero: “teman” serve pra amigo e amiga. Pra eu e você, no dia a dia se usa “aku” e “kamu”; “saya” é o “eu” mais educado.",
      en: "Indonesian uses the Latin alphabet and is read almost as it's written. There are no articles (a, the) and no grammatical gender: “teman” is any friend. For I and you, casual speech uses “aku” and “kamu”; “saya” is the polite “I”.",
    },
    pt: {
      id: "Dalam bahasa Portugis setiap kata benda punya jenis: maskulin (o amigo) atau feminin (a amiga). Kata sandang “o/a” mirip “-nya” atau “itu”, dan “um/uma” berarti “sebuah” atau “seorang”.",
      en: "Every Portuguese noun is masculine (o amigo) or feminine (a amiga). “O/a” mean “the” and “um/uma” mean “a/an”, matching the noun's gender.",
    },
    en: {
      pt: "O inglês não tem gênero: friend serve pra amigo e amiga, e os adjetivos nunca mudam. “You” vale pra você e pra vocês.",
      id: "Bahasa Inggris tidak punya jenis kata, mirip bahasa Indonesia: friend bisa laki-laki atau perempuan. “You” bisa berarti kamu atau kalian.",
    },
  },
  numbers: {
    id: {
      pt: "Os números são muito regulares. Aprenda de 1 a 10 e o resto se monta: de 11 a 19 se usa “belas” (dua belas = 12), as dezenas levam “puluh” (tiga puluh = 30), as centenas “ratus” e os milhares “ribu”. O “se-” quer dizer um: seratus (100), seribu (1000).",
      en: "Numbers are very regular. Learn 1 to 10 and build the rest: 11 to 19 take “belas” (dua belas = 12), tens take “puluh” (tiga puluh = 30), hundreds “ratus” and thousands “ribu”. “Se-” means one: seratus (100), seribu (1000).",
    },
    pt: {
      id: "Angka 1 dan 2 berubah sesuai jenis kata: um/uma (satu), dois/duas (dua): dois cafés, duas casas. Angka 11 sampai 15 punya nama sendiri (onze, doze, treze, catorze, quinze), lalu 16 = dezesseis.",
      en: "One and two change with gender: um/uma, dois/duas: dois cafés, duas casas. Eleven to fifteen have their own names (onze, doze, treze, catorze, quinze), then 16 is dezesseis.",
    },
    en: {
      pt: "De 13 a 19 os números terminam em -teen (thirteen, fifteen) e as dezenas em -ty (twenty, thirty). Cuidado pra não confundir fifteen (15) e fifty (50) na pronúncia.",
      id: "Angka 13 sampai 19 berakhiran -teen (thirteen, fifteen), dan puluhan berakhiran -ty (twenty, thirty). Hati-hati membedakan fifteen (15) dan fifty (50) saat mengucapkan.",
    },
  },
  colors: {
    id: {
      pt: "A cor vem depois da coisa, como em português: baju merah (roupa vermelha), mobil putih (carro branco). Pra cores claras e escuras se usa “muda” e “tua”: biru muda (azul-claro), biru tua (azul-escuro).",
      en: "The color comes after the thing: baju merah (red clothes), mobil putih (white car). For light and dark shades add “muda” and “tua”: biru muda (light blue), biru tua (dark blue).",
    },
    pt: {
      id: "Warna diletakkan setelah benda, seperti bahasa Indonesia, tapi ikut jenis katanya: camisa vermelha (baju merah), carro vermelho (mobil merah). Beberapa warna tidak berubah, seperti azul dan verde.",
      en: "Colors go after the noun and agree in gender: camisa vermelha (red shirt), carro vermelho (red car). Some don't change, like azul and verde.",
    },
    en: {
      pt: "Ao contrário do português, a cor vem antes da coisa e não muda: a red shirt, two red shirts. Claro e escuro: light blue, dark blue.",
      id: "Kebalikan dari bahasa Indonesia, warna diletakkan di depan benda: a red shirt (baju merah). Muda dan tua: light blue, dark blue.",
    },
  },
  family: {
    id: {
      pt: "A família em indonésio separa por idade, não por gênero: kakak é o irmão ou irmã mais velha, adik o mais novo. Pra especificar, junte laki-laki (homem) ou perempuan (mulher): adik perempuan = irmã mais nova. Kakak e adik também viram apelidos carinhosos.",
      en: "Indonesian family words go by age, not gender: kakak is an older sibling, adik a younger one. To be specific, add laki-laki (male) or perempuan (female): adik perempuan = younger sister. Kakak and adik are also used as affectionate nicknames.",
    },
    pt: {
      id: "Dalam bahasa Portugis saudara dibedakan menurut jenis kelamin: irmão (saudara laki-laki), irmã (saudara perempuan), filho (anak laki-laki), filha (anak perempuan). Orang tua disebut “pais”.",
      en: "Portuguese family words mark gender: irmão (brother), irmã (sister), filho (son), filha (daughter). Parents are “pais”, the same word as fathers.",
    },
    en: {
      pt: "Brother e sister são irmão e irmã; pra mais velho e mais novo: older brother, younger sister. Parents são os pais (pai e mãe juntos).",
      id: "Brother dan sister dibedakan menurut jenis kelamin; untuk kakak dan adik: older brother, younger sister. Parents berarti orang tua.",
    },
  },
  food: {
    id: {
      pt: "Comida é assunto sério na Indonésia: “sudah makan?” (já comeu?) é um jeito carinhoso de perguntar se a pessoa está bem. Arroz está em quase toda refeição; “nasi” é o arroz cozido. Pra dizer que está gostoso, use “enak”; muito gostoso, “enak sekali” ou “enak banget”.",
      en: "Food matters a lot in Indonesia: “sudah makan?” (have you eaten?) is a caring way to ask if someone is okay. Rice is in almost every meal; “nasi” is cooked rice. To say something tastes good, use “enak”; very good, “enak sekali” or “enak banget”.",
    },
    pt: {
      id: "Di Brasil makan siang (almoço) adalah makanan utama, biasanya nasi dan kacang (arroz e feijão). Untuk bilang enak: “está gostoso” atau “que delícia!”. Dari Minas Gerais, tempat Marcel, datang pão de queijo.",
      en: "In Brazil lunch (almoço) is the main meal, usually rice and beans (arroz e feijão). To say something tastes good: “está gostoso” or “que delícia!”.",
    },
    en: {
      pt: "Breakfast, lunch e dinner são as três refeições. Pra pedir com educação: “I'd like a coffee, please” (eu queria um café, por favor).",
      id: "Breakfast, lunch, dan dinner adalah tiga waktu makan. Untuk memesan dengan sopan: “I'd like a coffee, please” (saya mau kopi, ya).",
    },
  },
  time: {
    id: {
      pt: "O verbo não muda com o tempo; quem diz quando é são palavras como sudah (já), sedang ou lagi (agora, “-ndo”), akan ou mau (vai) e belum (ainda não). “Aku lagi makan” = estou comendo; “aku sudah makan” = já comi.",
      en: "Verbs don't change for tense; small words do the job: sudah (already), sedang or lagi (right now, “-ing”), akan or mau (will) and belum (not yet). “Aku lagi makan” = I'm eating; “aku sudah makan” = I already ate.",
    },
    pt: {
      id: "Kata kerja Portugis berubah sesuai waktu: eu como (aku makan), eu comi (aku sudah makan), eu vou comer (aku akan makan). Untuk yang sedang terjadi, pakai “estou” + akhiran -ndo: estou comendo (aku lagi makan).",
      en: "Portuguese verbs change with time: eu como (I eat), eu comi (I ate), eu vou comer (I'm going to eat). For right now use “estou” + -ndo: estou comendo (I'm eating).",
    },
    en: {
      pt: "O inglês marca o tempo no verbo, mas de um jeito simples: I work (eu trabalho), I worked (trabalhei), I will work (vou trabalhar). Pra agora: I am working (estou trabalhando).",
      id: "Bahasa Inggris menandai waktu di kata kerja: I work (aku bekerja), I worked (aku sudah bekerja), I will work (aku akan bekerja). Untuk sekarang: I am working (aku lagi kerja).",
    },
  },
  days: {
    id: {
      pt: "Os dias da semana vêm depois de “hari” (dia): hari Senin (segunda), hari Jumat (sexta). Atenção: “Minggu” é domingo e também semana, e “bulan” é mês e também lua. Os meses parecem com o português: Januari, Februari, Maret…",
      en: "Days of the week come after “hari” (day): hari Senin (Monday), hari Jumat (Friday). Watch out: “Minggu” means Sunday and also week, and “bulan” means month and also moon. Months look familiar: Januari, Februari, Maret…",
    },
    pt: {
      id: "Nama hari kerja di Brasil memakai angka: segunda-feira (Senin, “hari kedua”), terça-feira (Selasa), sampai sexta-feira (Jumat). Sábado dan domingo tidak. Nama bulan mirip bahasa Indonesia: janeiro, fevereiro, março…",
      en: "Brazilian weekdays are numbered: segunda-feira (Monday, “second day”), terça-feira (Tuesday) through sexta-feira (Friday). Saturday and Sunday are sábado and domingo.",
    },
    en: {
      pt: "Dias e meses sempre começam com letra maiúscula: Monday, Friday, January. Usa-se “on” com dias (on Monday) e “in” com meses (in December).",
      id: "Nama hari dan bulan selalu diawali huruf besar: Monday, January. Pakai “on” untuk hari (on Monday) dan “in” untuk bulan (in December).",
    },
  },
  verbs: {
    id: {
      pt: "Os verbos não conjugam: aku makan, kamu makan, mereka makan. Muitos têm prefixos (me-, ber-) no jeito formal e perdem o prefixo na fala: membeli vira beli, berbicara vira ngomong. Pra negar, use “tidak” ou, falando, “nggak”.",
      en: "Verbs don't conjugate: aku makan, kamu makan, mereka makan. Many carry prefixes (me-, ber-) in formal language and drop them in speech: membeli becomes beli, berbicara becomes ngomong. To negate, use “tidak”, or “nggak” when speaking.",
    },
    pt: {
      id: "Kata kerja Portugis berubah sesuai pelaku: eu falo, você fala, nós falamos, eles falam. Bentuk dasarnya berakhiran -ar, -er, atau -ir: falar, comer, partir. Untuk menyangkal, taruh “não” di depan: eu não sei (aku nggak tahu).",
      en: "Portuguese verbs change with the subject: eu falo, você fala, nós falamos, eles falam. Infinitives end in -ar, -er or -ir. For negatives, put “não” before the verb: eu não sei.",
    },
    en: {
      pt: "Os verbos quase não mudam: I play, you play, we play. Só com he, she e it ganham -s: she plays. Pra negar, use don't ou doesn't: I don't know, she doesn't know.",
      id: "Kata kerja hampir tidak berubah: I play, you play, we play. Hanya he, she, dan it mendapat -s: she plays. Untuk menyangkal: I don't know, she doesn't know.",
    },
  },
  adjectives: {
    id: {
      pt: "O adjetivo vem depois e não muda: rumah besar (casa grande), rumah-rumah besar (casas grandes). Pra intensificar: sangat besar ou besar sekali (muito grande); falando, besar banget. Pra comparar: lebih besar (maior), paling besar (o maior).",
      en: "Adjectives come after the noun and never change: rumah besar (big house). To intensify: sangat besar or besar sekali (very big); casually, besar banget. To compare: lebih besar (bigger), paling besar (biggest).",
    },
    pt: {
      id: "Kata sifat biasanya di belakang benda dan ikut jenis serta jumlahnya: casa bonita, casas bonitas, carro bonito. Untuk “sangat”, pakai “muito”: muito grande. “Lebih besar” adalah “maior”.",
      en: "Adjectives usually follow the noun and agree in gender and number: casa bonita, casas bonitas, carro bonito. For “very” use “muito”: muito grande. Bigger is “maior”.",
    },
    en: {
      pt: "O adjetivo vem antes e nunca muda: a big house, big houses. Pra comparar: bigger (maior), the biggest (o maior); com palavras longas: more difficult, the most difficult.",
      id: "Kata sifat di depan benda dan tidak berubah: a big house. Untuk membandingkan: bigger (lebih besar), the biggest (paling besar); untuk kata panjang: more difficult, the most difficult.",
    },
  },
  feelings: {
    id: {
      pt: "Pra dizer como você está, não precisa do verbo “estar”: aku capek (estou cansado), aku senang (estou feliz). Pra perguntar o que houve: “kamu kenapa?”.",
      en: "To say how you feel you don't need a verb “to be”: aku capek (I'm tired), aku senang (I'm happy). To ask what's wrong: “kamu kenapa?”.",
    },
    pt: {
      id: "Untuk perasaan pakai “estar” (keadaan sekarang): estou feliz (aku senang), estou cansada (aku capek). Banyak kata sifat berakhiran -o untuk laki-laki dan -a untuk perempuan: cansado, cansada.",
      en: "Feelings use “estar” (the temporary “to be”): estou feliz (I'm happy), estou cansada (I'm tired). Many adjectives end in -o for men and -a for women: cansado, cansada.",
    },
    en: {
      pt: "Sentimentos usam o verbo to be: I am happy, she is tired, we are excited. Na conversa se encurta: I'm, she's, we're.",
      id: "Perasaan memakai to be: I am happy, she is tired. Dalam percakapan sering disingkat: I'm, she's, we're.",
    },
  },
  questions: {
    id: {
      pt: "A ordem da frase não muda na pergunta, e muitas vezes a palavra de pergunta vai no fim: kamu di mana? (você está onde?), kamu bangun jam berapa? (você acorda que horas?). Pra sim ou não, basta a entonação ou “apakah” no começo.",
      en: "Word order doesn't change in questions, and the question word often goes at the end: kamu di mana? (where are you?), kamu bangun jam berapa? (what time do you wake up?). For yes/no questions, rising intonation is enough, or start with “apakah”.",
    },
    pt: {
      id: "Pertanyaan bisa dibuat hanya dengan nada naik: você está bem? (kamu baik-baik saja?). Kata tanya biasanya di depan: onde você está? (kamu di mana?), que horas são? (jam berapa sekarang?).",
      en: "A question can be just a rising tone: você está bem? Question words usually go first: onde você está?, que horas são?.",
    },
    en: {
      pt: "Perguntas com to be invertem a ordem: you are vira are you?. Com os outros verbos se usa do ou does: Do you like coffee? Where do you live?",
      id: "Pertanyaan dengan to be membalik urutan: you are menjadi are you?. Dengan kata kerja lain, pakai do atau does: Do you like coffee? Where do you live?",
    },
  },
  weather: {
    id: {
      pt: "A Indonésia tem basicamente duas estações: musim hujan (chuvas) e musim kemarau (seca). Jacarta é quente o ano todo. Pra falar do clima não precisa de verbo: hari ini panas (hoje está quente), lagi hujan (está chovendo).",
      en: "Indonesia basically has two seasons: musim hujan (rainy) and musim kemarau (dry). Jakarta is hot all year. Talking about the weather needs no verb: hari ini panas (it's hot today), lagi hujan (it's raining).",
    },
    pt: {
      id: "Untuk cuaca orang Brasil pakai “está” atau “faz”: está chovendo (lagi hujan), está quente (panas), faz frio (dingin). Di Itaúna musim dingin (Juni sampai Agustus) bisa cukup dingin di pagi hari.",
      en: "For weather Brazilians use “está” or “faz”: está chovendo (it's raining), está quente (it's hot), faz frio (it's cold).",
    },
    en: {
      pt: "Pra falar do clima se usa “it”: it's hot (está quente), it's raining (está chovendo), it's cold (está frio).",
      id: "Untuk cuaca pakai “it”: it's hot (panas), it's raining (lagi hujan), it's cold (dingin).",
    },
  },
  home: {
    id: {
      pt: "Pra dizer que algo é seu, junte -ku (meu) ou -mu (seu) no fim: kamarku (meu quarto), HP-mu (seu celular). Pra dizer onde algo está, use “di”: di kamar (no quarto), di dapur (na cozinha).",
      en: "To say something is yours, add -ku (my) or -mu (your): kamarku (my room), HP-mu (your phone). For location use “di”: di kamar (in the room), di dapur (in the kitchen).",
    },
    pt: {
      id: "Untuk kepemilikan, “meu/minha” (punyaku) dan “seu/sua” (punyamu) ikut jenis bendanya: meu quarto (kamarku), minha casa (rumahku).",
      en: "Possessives agree with the thing owned: meu quarto (my room), minha casa (my house), seu celular (your phone).",
    },
    en: {
      pt: "My, your, his e her não mudam com a coisa: my room, my house, your phone.",
      id: "Kata kepemilikan diletakkan di depan benda: my room (kamarku), your phone (HP-mu).",
    },
  },
  body: {
    id: {
      pt: "Pra dizer que algo dói, use a parte do corpo + sakit: kepala saya sakit (minha cabeça dói), sakit perut (dor de barriga). “Sakit” sozinho também quer dizer doente.",
      en: "To say something hurts, use the body part + sakit: kepala saya sakit (my head hurts), sakit perut (stomachache). “Sakit” alone also means sick.",
    },
    pt: {
      id: "Untuk bilang sakit: “estou com dor de cabeça” (aku sakit kepala) atau “meu pé dói” (kakiku sakit).",
      en: "To say something hurts: “estou com dor de cabeça” (I have a headache) or “meu pé dói” (my foot hurts).",
    },
    en: {
      pt: "Pra dor se usa “hurt” ou “-ache”: my head hurts, I have a headache, a stomachache (dor de barriga).",
      id: "Untuk sakit pakai “hurt” atau “-ache”: my head hurts, I have a headache (aku sakit kepala).",
    },
  },
  places: {
    id: {
      pt: "Três palavrinhas resolvem quase tudo: di (em, onde está), ke (pra onde vai) e dari (de onde vem): aku di Jakarta, aku pergi ke pantai, aku dari Brasil. Pra direção: belok kiri (vire à esquerda), lurus (em frente).",
      en: "Three small words cover most places: di (at/in), ke (to) and dari (from): aku di Jakarta, aku pergi ke pantai, aku dari Brasil. For directions: belok kiri (turn left), lurus (straight ahead).",
    },
    pt: {
      id: "Kata depan bergabung dengan kata sandang: em + o = no, em + a = na (di), a + a = à (ke): estou no hotel (aku di hotel), vou à praia (aku pergi ke pantai). Untuk arah: à esquerda (ke kiri), à direita (ke kanan), em frente (lurus).",
      en: "Prepositions merge with articles: em + o = no, em + a = na, a + a = à: estou no hotel, vou à praia. Directions: à esquerda (left), à direita (right), em frente (straight).",
    },
    en: {
      pt: "In, at e to: in a city (numa cidade), at the airport (no aeroporto), go to the beach (ir à praia). Direções: turn left, turn right, go straight.",
      id: "In, at, dan to: in a city (di kota), at the airport (di bandara), go to the beach (pergi ke pantai). Arah: turn left, turn right, go straight.",
    },
  },
  shopping: {
    id: {
      pt: "A moeda é a rupia (Rp), com valores grandes: Rp 50.000 é comum. Em feira dá pra pechinchar: “boleh kurang?” (pode fazer mais barato?). Pra perguntar o preço: “berapa?” ou “berapa harganya?”.",
      en: "The currency is the rupiah (Rp), with big numbers: Rp 50,000 is common. At markets you can bargain: “boleh kurang?” (can you lower it?). To ask the price: “berapa?” or “berapa harganya?”.",
    },
    pt: {
      id: "Mata uang Brasil adalah real (R$). Untuk tanya harga: “quanto custa?” (berapa harganya?). “Caro” berarti mahal dan “barato” murah.",
      en: "Brazil's currency is the real (R$). To ask the price: “quanto custa?”. Caro means expensive and barato cheap.",
    },
    en: {
      pt: "Pra perguntar o preço: “How much is this?”. Expensive é caro e cheap é barato; “Can I pay by card?” pergunta se aceita cartão.",
      id: "Untuk tanya harga: “How much is this?”. Expensive berarti mahal dan cheap murah; “Can I pay by card?” untuk tanya bisa bayar pakai kartu.",
    },
  },
  work: {
    id: {
      pt: "“Kerja” é trabalhar e também o trabalho; “pekerjaan” é o emprego. Pra perguntar onde alguém trabalha: “kerja di mana?”. E mais: “sibuk” é ocupado, e “libur” é folga ou feriado.",
      en: "“Kerja” means to work and also work; “pekerjaan” is a job. To ask where someone works: “kerja di mana?”. Also: “sibuk” is busy and “libur” is a day off or holiday.",
    },
    pt: {
      id: "Untuk tanya pekerjaan: “você trabalha com o quê?” (kamu kerja apa?). Hari libur disebut “feriado”, dan akhir pekan “fim de semana”.",
      en: "To ask what someone does: “você trabalha com o quê?”. A public holiday is “feriado” and the weekend “fim de semana”.",
    },
    en: {
      pt: "Pra perguntar a profissão: “What do you do?”. Busy é ocupado, day off é folga e holiday é feriado ou férias.",
      id: "Untuk tanya pekerjaan: “What do you do?”. Busy berarti sibuk, day off berarti libur, dan holiday bisa hari libur atau liburan.",
    },
  },
  love: {
    id: {
      pt: "“Sayang” é o apelido carinhoso mais comum (querido, amor) e também quer dizer gostar muito: aku sayang kamu. “Cinta” é um amor mais intenso, e “kangen” é a saudade do dia a dia.",
      en: "“Sayang” is the most common term of endearment (darling) and also means to care deeply: aku sayang kamu. “Cinta” is stronger love, and “kangen” is everyday missing someone.",
    },
    pt: {
      id: "Orang Brasil sangat ekspresif: “amor”, “meu bem”, dan “querida” dipakai untuk pasangan. “Eu te amo” berarti aku cinta kamu, dan “saudade” adalah rasa rindu yang terkenal tidak punya terjemahan pas.",
      en: "Brazilians are very expressive: “amor”, “meu bem” and “querida” are common pet names. “Eu te amo” is I love you, and “saudade” is the famous longing with no exact translation.",
    },
    en: {
      pt: "Apelidos comuns em inglês: babe, honey, sweetheart. “I miss you” é estou com saudade, e “I love you so much” é eu te amo muito.",
      id: "Panggilan sayang dalam bahasa Inggris: babe, honey, sweetheart. “I miss you” berarti aku kangen kamu.",
    },
  },
  phrases: {
    id: {
      pt: "No indonésio falado, palavrinhas no fim mudam o tom: “ya” deixa o pedido mais gentil (tunggu ya = espera, tá?), “dong” dá ênfase e “kok” mostra surpresa. Com a Gabriela, use “ya” à vontade.",
      en: "In spoken Indonesian, little words at the end change the tone: “ya” softens a request (tunggu ya = wait, okay?), “dong” adds emphasis and “kok” shows surprise.",
    },
    pt: {
      id: "Dalam obrolan santai di Brasil orang sering memakai “a gente” untuk kita, dan kata “né?” di akhir kalimat seperti “kan?” atau “ya?”: está calor, né? (panas ya?).",
      en: "Casual Brazilian Portuguese uses “a gente” for we and adds “né?” at the end like “right?”: está calor, né?.",
    },
    en: {
      pt: "Expressões que salvam: “No worries” (sem problema), “Take care” (se cuida), “See you soon” (até logo). E pra pedir que repitam: “Sorry, can you say that again?”.",
      id: "Ungkapan berguna: “No worries” (nggak apa-apa), “Take care” (hati-hati), “See you soon” (sampai jumpa). Untuk minta diulang: “Sorry, can you say that again?”.",
    },
  },
}

export function introFor(topic: Topic, target: Lang, base: Lang) {
  const byBase = UNIT_INTROS[topic][target]
  return byBase?.[base] ?? byBase?.en ?? null
}

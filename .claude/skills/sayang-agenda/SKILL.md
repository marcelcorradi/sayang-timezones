---
name: sayang-agenda
description: Edita a agenda do casal no app Sayang (Marcel em Itaúna/MG, Brasil e Gabriela Sitorus em Jakarta, Indonésia, 10h de diferença), adicionando rotinas, folgas, feriados, férias, viagens, compromissos, chamadas marcadas, aniversários, data de início do namoro e próximo reencontro em src/data/couple.ts, valida com `npm run check` e publica. Use SEMPRE que o usuário falar de horário, rotina, agenda, trabalho, almoço, sono, academia, aula, folga, feriado, viagem, encontro, aniversário ou "que horas vai ser pra ela/pra ele", mesmo que não cite o app ou o arquivo, e também com pedidos em inglês ou indonésio (jadwal, libur, kerja, ketemu).
---

# Agenda do Sayang

O app mostra, lado a lado, o que Marcel e Gabriela estão fazendo e quando os dois estão livres para conversar. Tudo vem de **um arquivo**: `src/data/couple.ts`. Quem pede mudanças é quase sempre o Marcel, em português e de forma bem informal. Seu trabalho é transformar o pedido na entrada certa nesse arquivo, conferir o resultado e publicar.

## Quem é quem

| Pedido diz | `who` |
| --- | --- |
| "eu", "meu", "minha", "Marcel" | `"marcel"` |
| "ela", "Gabi", "Gabriela", "minha namorada", "sayang" | `"gabriela"` |
| "a gente", "nós", "os dois", "nossa chamada" | `"both"` |

Se quem está pedindo se identificar como Gabriela, inverta "eu" e "ela/ele".

## Fuso: a regra mais importante

Cada horário fica no **relógio de quem faz a atividade**: Marcel em `America/Sao_Paulo` (UTC−3, sem horário de verão) e Gabriela em `Asia/Jakarta` (WIB, UTC+7). Jakarta está **10h à frente**.

- "Ela entra no trabalho às 8h" significa 08:00 em Jakarta. Grave `"08:00"` na regra dela, sem converter.
- "Ela tem aula às 20h **do meu horário**" significa que você converte: 20:00 no Brasil = 06:00 do **dia seguinte** em Jakarta.
- Compromisso dos dois (`who: "both"`) exige `clockOf`, que diz de qual relógio são a data e o horário. "Chamada sábado 21h" dita pelo Marcel vira `clockOf: "marcel"`. Sem `clockOf`, cada pessoa leria o horário no próprio fuso e seriam dois momentos diferentes. O `npm run check` recusa esse caso.

Se não der para saber de qual relógio é o horário, assuma o de quem faz a atividade e diga isso na resposta, com a conversão ("08:00 em Jakarta = 22:00 do dia anterior pra você"). Só pergunte quando o erro mudaria muito a agenda.

## Qual tipo de entrada usar

| O pedido | Vai em | Exemplo de frase |
| --- | --- | --- |
| Se repete toda semana | `rules` | "academia seg/qua/sex 19h–20h" |
| Acontece uma vez, com horário | `events` | "dentista dia 3 às 15h", "chamada sábado 21h" |
| Dia inteiro sem trabalho | `daysOff` | "feriado dia 15/11", "férias de 20/12 a 5/1" |
| Data que se comemora | `importantDates` | "aniversário dela 3 de novembro" |
| Começo do namoro | `together` | "começamos a namorar 14/02/2025" |
| Próximo encontro (contagem regressiva) | `nextVisit` | "vou pra Jakarta dia 20/12" |

### Formatos

```ts
// Rotina. days: 0 = domingo … 6 = sábado. Use EVERY_DAY e WEEKDAYS quando couber.
{ id: "gabriela-gym", who: "gabriela", activity: "gym", days: [1, 3, 5], start: "19:00", end: "20:00" }

// Se end < start, atravessa a meia-noite (o sono é assim).
{ id: "marcel-sleep", who: "marcel", activity: "sleep", days: EVERY_DAY, start: "23:30", end: "06:30" }

// Rotina temporária (intervalo inclusive).
{ id: "marcel-curso", who: "marcel", activity: "study", days: [2, 4], start: "19:00", end: "21:00",
  from: "2026-11-01", until: "2026-12-15", label: { pt: "Curso de inglês", en: "English class", id: "Kursus bahasa Inggris" } }

// Folga: tira tudo da agenda naquele dia, menos o sono. until é opcional.
{ id: "gabriela-ferias-dez", who: "gabriela", from: "2026-12-22", until: "2027-01-02",
  label: { pt: "Férias", en: "Vacation", id: "Cuti" } }

// Compromisso avulso: sempre vence a rotina.
{ id: "chamada-2026-11-07", who: "both", clockOf: "marcel", date: "2026-11-07", start: "21:00", end: "22:00", activity: "call" }

// Datas especiais: "MM-DD" repete todo ano, "YYYY-MM-DD" é uma vez.
{ id: "aniversario-gabriela", date: "11-03", label: { pt: "Aniversário da Gabriela", en: "Gabriela's birthday", id: "Ulang tahun Gabriela" } }

together: "2025-02-14",
nextVisit: { date: "2026-12-20", label: { pt: "Marcel chega em Jakarta", en: "Marcel lands in Jakarta", id: "Marcel datang ke Jakarta" } },
```

`id` precisa ser único. Use `pessoa-assunto` ou `assunto-data`, em minúsculas e com hífens. Coloque o ano em ids de coisas que se repetem de ano em ano (`marcel-feriado-2026-11-20`).

### Lacunas comuns no pedido

- **Datas relativas** ("sábado que vem", "semana que vem", "a partir de novembro"): conte a partir de hoje no relógio de quem fala. Se ficar ambíguo (ex.: "sábado que vem" dito num sábado), escolha a ocorrência mais próxima no futuro e escreva a data completa na resposta ("sábado, 31/10"), para o erro aparecer na hora.
- **Sem horário de fim**: chamada dura 1h, consulta ou compromisso 1h, aula 1h30. Diga o que assumiu.
- **"Até o fim do ano"**, "durante as férias" etc.: use o intervalo literal (`until: "AAAA-12-31"`) e avise se ele pega um dia que provavelmente não tem a atividade (véspera de Ano Novo, feriado).

## Atividades disponíveis

Estão em `src/data/activities.ts`, cada uma com ícone, rótulo nos três idiomas e disponibilidade para conversar:

`sleep` (dormindo), `work`, `study` (ocupado), `commute` (no trânsito, dá pra mensagem), `gym`, `church` (ocupado), `family`, `errands` (dá pra mensagem), `busy` (ocupado genérico), `lunch`, `dinner` (dá pra mensagem), `travel` (dá pra mensagem), `call` (chamada com você, conta como livre).

Prefira uma atividade existente e use `label` quando o nome não bastar (ex.: `study` com label "Aula de bahasa"). Crie atividade nova só se nenhuma servir. Para criar:
1. Adicione o id em `ActivityId` (`src/data/types.ts`).
2. Adicione a entrada em `ACTIVITIES` com `availability`, `priority` e `label` em pt/en/id. Antes de importar o ícone de `@hugeicons/core-free-icons`, confira que ele existe com grep em `node_modules/@hugeicons/core-free-icons/dist/types/index.d.ts`.

**Disponibilidade** decide as janelas pra conversar: `free` + `free` = "os dois livres" (verde forte); se nenhum dos dois estiver `busy` ou `asleep`, conta como "dá pra trocar mensagem".

Quando a disponibilidade vale só para uma pessoa ou uma regra ("no meu trabalho dá pra responder WhatsApp", "na academia não pego no celular"), não mude a atividade nem `ACTIVITIES`. Coloque `availability` na própria regra: `{ id: "marcel-work", …, availability: "limited" }`. O painel passa a mostrar "pode mandar mensagem" e as janelas se ajustam. Hoje o trabalho do Marcel já está assim.

**Prioridade**, quando duas coisas caem no mesmo horário: compromissos (`events`) vencem a rotina. Entre regras, vence a de maior `priority` (sleep 10 < work 20 < gym 30 < lunch 40). No empate, vence a que aparece **por último** no arquivo. Por isso o almoço "fura" o trabalho sem precisar dividir o expediente em dois.

## Rótulos nos três idiomas

O app tem português, inglês e indonésio. Quando escrever um `label`, preencha `pt`, `en` e `id`. Em indonésio use o tom casual do casal ("kamu", "nggak"). Se não tiver certeza de uma tradução, prefira uma frase simples e correta a uma literal.

## Feriados

Feriados brasileiros nacionais têm data conhecida. Os indonésios mudam todo ano (Idul Fitri, Idul Adha, Imlek, Nyepi, Waisak etc. seguem calendários lunares). **Não invente essas datas**: pesquise a lista oficial do ano (SKB 3 Menteri) antes de cadastrar, e diga de onde tirou.

## Fluxo

1. Leia `src/data/couple.ts` inteiro e entenda o que já existe. Às vezes o pedido muda uma regra existente em vez de criar outra. "Na verdade ela almoça 11h30" pede para editar `gabriela-lunch`.
2. Faça a edição no lugar certo, mantendo o estilo do arquivo: uma regra por linha, agrupadas por pessoa.
3. Rode `npm run check -- <YYYY-MM-DD> <dias>` cobrindo a data afetada (sem argumentos, mostra os próximos 7 dias). Se acusar erro, corrija.
4. Na resposta, mostre o efeito nos dois relógios, usando o que o check imprimiu. Por exemplo: "Academia dela seg/qua/sex 19:00–20:00 em Jakarta = 09:00–10:00 pra você. A janela de vocês na segunda à noite continua 21:00–23:00."
5. Publicar: o deploy no GitHub Pages acontece quando o commit chega na `main`. Faça um commit com mensagem curta em português (ex.: `agenda: academia da Gabriela seg/qua/sex`). Faça o push se o usuário já pediu para publicar ou atualizar o app. Senão, pergunte em uma linha se pode publicar.

## Perguntas sem edição

"Que horas vai ser pra ela quando for 20h aqui?" ou "quando a gente consegue se falar quinta?" não pedem mudança no arquivo. Responda com `npm run check -- <data> 1`, que já imprime as janelas do dia nos dois fusos.

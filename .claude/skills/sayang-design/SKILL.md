---
name: sayang-design
description: Direção visual e regras de construção do app Sayang (React + Vite + shadcn/ui com Base UI + Tailwind v4, hospedado no GitHub Pages), o relógio de casal de Marcel (Itaúna, Brasil) e Gabriela (Jakarta, Indonésia). Use sempre que for criar ou mudar telas, componentes, cores, textos da interface, traduções ou qualquer funcionalidade nova do app, incluindo as ideias do backlog (recadinhos, notificações, status ao vivo, lista de desejos), mesmo que o pedido seja curto como "coloca um botão" ou "muda essa cor". Para mudanças só na agenda (horários, folgas, datas), use a skill sayang-agenda.
---

# Design e construção do Sayang

Esta skill aplica a frontend-design (`.claude/skills/frontend-design`) e a shadcn (`.claude/skills/shadcn`) a este app específico. Leia as duas quando a mudança for grande. Para mudanças pequenas, o que está aqui basta.

## Para quem e para quê

Duas pessoas que namoram a 16 mil km e 10h de distância, olhando o celular rapidinho, muitas vezes logo ao acordar ou antes de dormir. A pergunta que o app responde em um segundo é: **"o que ela/ele está fazendo agora, e quando a gente consegue se falar?"** Toda tela nova precisa ajudar nisso ou no carinho entre os dois. Se não ajuda, não entra.

## A ideia visual

**O céu de cada cidade.** Na tela "Agora", cada pessoa tem um painel cujo fundo é o céu daquela hora local (madrugada, dia, entardecer, noite, em `skyFor()` de `src/lib/look.ts`). Quando é dia em Itaúna, o painel da Gabriela está estrelado. Essa é a ousadia do app: gaste a ousadia ali e mantenha o resto quieto. Não espalhe gradientes nem céus por outras telas.

### Tokens (em `src/index.css`, claro e escuro)

| Token | Uso |
| --- | --- |
| `ipe` / `ipe-ink` | Marcel: ipê-amarelo, a flor do Brasil |
| `orchid` / `orchid-ink` | Gabriela: anggrek bulan (orquídea-lua), a flor nacional da Indonésia |
| `together` / `together-soft` | Os dois livres ao mesmo tempo. É a cor da "ponte" e só aparece para isso |
| `night` | Sono, nas linhas do tempo |
| `background`, `card`, `muted`, `primary` … | Base índigo-noite do shadcn, já ajustada |

Cores por pessoa vêm de `PERSON_LOOK` (`src/lib/look.ts`). Nunca monte classes dinâmicas como `` `bg-${cor}` ``, porque o Tailwind não as enxerga.

### Tipografia

- **Bricolage Grotesque** (`font-heading`): relógios, números grandes, nomes, títulos. Relógios sempre com `tabular-nums`.
- **Figtree** (`font-sans`): todo o resto.
- Sem rótulos em CAIXA ALTA, sem eyebrow acima de cada título, sem textos juntados com " · ".

### Layout

- Mobile primeiro: 390px de largura, coluna única, `max-w-md` centralizado, `px-4`.
- Respeite as áreas seguras do iPhone: `env(safe-area-inset-*)` no header, na barra inferior e nas sheets.
- Navegação: quatro abas na barra inferior (Agora, Dia, Nós, Aprender), com ícone em cima e texto embaixo. Não crie uma quinta: encaixe a função numa das quatro. Ajustes ficam na sheet da engrenagem.
- Movimento: só em resposta a toque, ou para o ponto pulsante de "bom momento pra ligar" (com `motion-safe:`). Nada de fade-in em cada card.

## Regras do shadcn neste projeto

O projeto usa o estilo `base-maia` com **Base UI** (não Radix). Por isso:
- Gatilhos customizados usam `render={<Button … />}` em vez de `asChild`.
- `ToggleGroup` trabalha com array: `value={[x]}` e `onValueChange={(v) => v[0] && set(v[0])}`.
- Ícones vêm de `@hugeicons/react` + `@hugeicons/core-free-icons` (`<HugeiconsIcon icon={X} strokeWidth={2} />`). Confira se o nome existe antes de usar: `grep -c "\bNomeIcon\b" node_modules/@hugeicons/core-free-icons/dist/types/index.d.ts`.
- `cn` vem do pacote `cn` e funciona como tailwind-merge.
- Antes de escrever markup próprio, use os componentes: `Card` completo (Header/Title/Description/Content), `Badge`, `Empty` para estados vazios, `Separator`, `Sheet` para painéis. Para adicionar um componente: `npx shadcn@latest add <nome>`.
- Use `gap-*` em vez de `space-*` e `size-*` quando largura = altura.
- Cores fora dos tokens só valem sobre o céu, onde os tokens não se aplicam.

## Textos e idiomas

Toda frase visível existe em **português, inglês e indonésio**, em `src/lib/i18n.ts`. O tipo `Dict` obriga as três línguas a terem as mesmas chaves, e o `tsc` acusa se faltar uma. Use `t("chave", { vars })` vindo de `usePrefs()`.

- Português de conversa entre namorados ("pra", "a gente").
- Indonésio casual de casal: "kamu", "nggak", "bareng", "santai". Evite o formal ("Anda").
- Diga o que acontece, sem vender: "Copiar link pra Gabriela", e não "Compartilhe agora!".
- Estados vazios sugerem o próximo passo. Aqui o próximo passo costuma ser "Peça pro Claude: …", porque a agenda é editada pelo Claude.
- Datas e dias da semana usam `Intl` com o locale do idioma (`formatDate`, `formatDateKey` em `src/lib/time.ts`). Horas são sempre 24h.

## Horário e fuso no código

- Nunca use `new Date().getHours()` nem `toLocaleTimeString` sem `timeZone`. O celular pode estar em qualquer fuso. Use `localParts(t, timeZone)`, `formatClock`, `zonedToInstant` e `dayBounds`.
- Quem está olhando é `me`, de `usePrefs()`. Mostre primeiro no fuso de `me` e, ao lado, a conversão para o outro ("09:00 pra Gabriela").
- O instante atual vem de `useNow()`, que atualiza a cada minuto. Não crie outros timers por segundo.

## Dados

- Agenda, pessoas e datas: `src/data/couple.ts` (ver skill sayang-agenda).
- Atividades: `src/data/activities.ts`.
- Curso de idiomas (aba Aprender):
  - `src/data/vocab.ts`: unidades em `TOPICS` e palavras em `VOCAB`, sempre com pt/en/id;
  - `src/data/sentences.ts`: frases para montar, curtas e ligadas a uma unidade;
  - `src/data/tips.ts`: dicas de gramática por idioma aprendido;
  - `src/data/units.ts`: a explicação que abre cada unidade, por idioma aprendido e escrita no idioma de quem lê (uma lição de unidade é: explicação, palavras novas uma por vez, perguntas);
  - `src/lib/learn.ts`: repetição espaçada, XP e sequência, por pessoa, salvos no localStorage do aparelho;
  - `src/lib/learn-sync.ts`: com o cofre conectado, junta o progresso do aparelho com `doc.learn` (vale a resposta mais recente de cada palavra) e envia ao sair de uma lição. É daí que vem a linha "Gabriela já aprendeu…". Fica fora do `learn.ts` pra o `check:lessons` rodar sem o cofre;
  - `src/lib/speech.ts`: pronúncia pela voz do celular.
  Ao acrescentar conteúdo, confira as traduções com cuidado. O indonésio do casal é o falado (nggak, lagi, kangen), mas o vocabulário-base usa a forma padrão, com o jeito falado nas notas.
- O site é estático (GitHub Pages), mas tem três formas de guardar ou enviar coisas entre os dois sem servidor próprio.

### Cofre (`src/lib/vault/`): o que um escreve e o outro lê

Motivos do pote, cartas "abra quando…", recados de quando acordar, os medos com a conversa de cada um (`fears.tsx`) e o progresso do Aprender ficam em `vault.json`, no branch `vault` deste repositório. O arquivo é criptografado com AES-GCM, usando uma chave derivada da senha do casal (PBKDF2, 310 mil iterações). O app lê e grava pela API do GitHub com uma chave pessoal (fine-grained token, Contents de leitura e escrita só neste repositório). O branch separado faz com que salvar não republique o site.

- Em componentes, use `useVault()`: `doc` (o conteúdo aberto ou `null`), `update(d => { … })` (relê, aplica, criptografa e salva, e tenta de novo se os dois salvarem juntos) e `saving`.
- Para guardar um tipo novo de coisa, adicione o campo em `VaultDoc` (`src/lib/vault/types.ts`) e trate a ausência dele em cofres antigos (`doc.novo ?? []`).
- Sem cofre conectado, mostre `<VaultCta />` no lugar da função.
- Para desenvolver sem GitHub, rode `VITE_VAULT_LOCAL=1 npx vite`: o cofre vai para o localStorage.
- Nunca grave nada sem criptografar, nem coloque o token ou a senha em código ou em log.
- Aviso no ntfy sobre algo do cofre nunca leva o texto: o ntfy.sh recebe a mensagem sem criptografia. Diga só que chegou algo ("Gabriela te respondeu em Nossos medos").

### Toques (`src/lib/ntfy.ts`): notificação no celular

"Pensando em você", "Me liga?" etc. são enviados para o ntfy.sh, no tópico `${doc.ntfyTopic}-${pessoa}`. O nome do tópico é segredo e fica dentro do cofre. A mensagem vai **no idioma de quem recebe**. Cada pessoa assina o próprio tópico no app ntfy (instruções em Ajustes).

### Céu e lua (`src/lib/moon.ts`)

`suncalc` (v2, ESM, ângulos em graus) calcula a altura do sol, que define o céu dos painéis em `skyFor()`, além da fase e da posição da lua. Os dois moram no hemisfério sul, por isso o desenho da lua é espelhado.

### Instalação (`src/lib/install.ts`)

O botão "Instalar" usa o `beforeinstallprompt` quando o navegador oferece. No iPhone, em navegadores de dentro de outros apps e no computador, mostra o passo a passo.

## Verificação antes de entregar

1. `npm run build && npm run lint && npm run check`.
2. Abra no tamanho de celular e confira as duas perspectivas e os dois temas: `?me=marcel` e `?me=gabriela&lang=id`, claro e escuro. Sem navegador integrado, use `npx vite preview` e um script com `puppeteer-core` apontando para o Chrome instalado, em viewport 390×844. Olhe as imagens: estouro horizontal, texto cortado, contraste no céu claro e no céu noturno.
3. Antes de terminar, aplique o conselho da frontend-design: tire um acessório. Se algo só enfeita, remova.

## Ideias e backlog

`references/ideas.md` tem as funcionalidades pesquisadas, separadas entre as que cabem num site estático e as que precisam de backend. Leia quando o usuário pedir "mais funcionalidades" ou algo da lista.

---
name: sayang
description: Porta de entrada para qualquer pedido sobre o app Sayang, o relógio de casal do Marcel (Itaúna, Brasil) e da Gabriela (Jakarta, Indonésia). Decide qual skill do projeto usar (sayang-agenda para horários e datas, sayang-design para telas, textos, curso do Aprender, cofre e toques), divide pedidos que misturam áreas, e fecha todo trabalho do mesmo jeito: checagens, docs e backlog atualizados, commit no padrão do repositório e deploy. Use SEMPRE que o pedido envolver este repositório, inclusive bug ("a aba Dia tá errada"), dúvida ("dá pra fazer X?"), pedido de ideias ("o que mais dá pra colocar?"), conteúdo do curso, publicar/atualizar o site, ou pedidos vagos como "melhora o app", mesmo em inglês ou indonésio.
---

# Sayang: por onde começar

O Sayang é um site estático (Cloudflare Pages, com login do Cloudflare Access) que mostra o que Marcel e Gabriela estão fazendo agora, quando os dois podem se falar e quanto falta pro reencontro, em pt, en e id. Quem pede é quase sempre o Marcel, em português informal e às vezes com uma frase só. O trabalho desta skill é pegar esse pedido, mandar pra skill certa, e garantir que o resultado chegue no ar sem quebrar nada.

As skills especializadas já sabem fazer o trabalho de cada área. Esta não repete o que elas dizem: ela escolhe, ordena e fecha.

## 1. Classifique o pedido

| O pedido fala de | Skill | Arquivos principais |
| --- | --- | --- |
| Rotina, horário, folga, feriado, viagem, compromisso, aniversário, reencontro | `sayang-agenda` | `src/data/couple.ts` |
| "Que horas vai ser pra ela?", "quando a gente consegue se falar quinta?" | `sayang-agenda` (seção "Perguntas sem edição") | nenhum, só `npm run check` |
| Tela, componente, cor, botão, texto da interface, tradução, funcionalidade nova | `sayang-design` | `src/components/`, `src/lib/i18n.ts` |
| Curso do Aprender: palavras, frases, unidades, dicas, regras da lição | `sayang-design` (seção "Dados") | `src/data/vocab.ts`, `sentences.ts`, `units.ts`, `tips.ts`, `src/lib/learn.ts` |
| Recados, cartas, pote, progresso guardado, toques, notificação | `sayang-design` (seções "Cofre" e "Toques") | `src/lib/vault/`, `src/lib/ntfy.ts` |
| "O que mais dá pra fazer?", "tive uma ideia" | `sayang-design` + `references/ideas.md` dela | só leitura, até ele escolher |
| Algo quebrado | Veja "Bugs" abaixo | depende |

Carregue a skill escolhida com a ferramenta Skill e siga o fluxo dela. Para uma mudança grande de interface, a `sayang-design` manda ler também `frontend-design` e `shadcn`. Mudança pequena não precisa.

Se o pedido couber em uma linha da tabela, vá direto. Se não couber em nenhuma, leia o código antes de perguntar: quase sempre a resposta está em `src/`.

## 2. Pedidos que misturam áreas

Muitos pedidos parecem de uma área e tocam outra. "Ela começou a trabalhar de noite e quero que o painel mostre 'livre até 15:00' quando ela avisar" é agenda (nova rotina) e funcionalidade (status ao vivo, que está no backlog). Separe as partes, diga em uma ou duas linhas como vai dividir e faça na ordem em que uma depende da outra:

1. **Tipos e dados**: `src/data/types.ts`, `VaultDoc` em `src/lib/vault/types.ts`, entradas em `couple.ts` ou no curso.
2. **Lógica**: `src/lib/` (agenda em `schedule.ts`, tempo em `time.ts`, curso em `learn.ts`).
3. **Interface**: componentes em `src/components/`.
4. **Textos**: chaves novas em `src/lib/i18n.ts`, nos três idiomas.

Essa ordem existe porque o `tsc` reclama de baixo pra cima: com os tipos prontos, cada passo seguinte já compila contra algo real.

Parte que exige servidor ou algo rodando com o app fechado (avisos automáticos, fotos) não cabe num site estático. Faça o que dá, diga o que ficou de fora e por quê, e aponte a saída que está em `ideas.md` (GitHub Actions agendado no ntfy, Firebase/Supabase). Não monte backend sem o Marcel decidir.

## 3. Bugs

1. Reproduza antes de mexer: `npm run check -- <data> <dias>` mostra a agenda calculada nos dois fusos; `npm run check:lessons` gera 600 lições e acusa pergunta sem cartão; `VITE_VAULT_LOCAL=1 npx vite` abre o app com cofre local.
2. Suspeite primeiro de fuso. A maioria dos erros de horário vem de `new Date().getHours()`, `toLocaleTimeString` sem `timeZone` ou de um compromisso `both` sem `clockOf`. As regras estão na `sayang-design` ("Horário e fuso no código") e na `sayang-agenda` ("Fuso").
3. Quando o bug for de uma área com skill, carregue a skill antes de corrigir, porque ela tem as convenções que a correção precisa seguir.
4. Se o check não pegou o bug e dá pra ensinar ele a pegar, acrescente a verificação em `scripts/check-schedule.ts` ou `scripts/check-lessons.ts`. Foi assim que o `check:lessons` passou a cobrir revisão e ordens alternativas.

## 4. O que nunca fazer

- **Repositório `sayang-cofre`**: tem os recados, cartas e motivos do casal, criptografados. Não leia, não decifre, não altere, nem para depurar, a menos que o Marcel peça com essas palavras. Para testar o cofre, use `VITE_VAULT_LOCAL=1`.
- Token do GitHub, senha do casal ou tópico do ntfy em código, log, commit ou resposta.
- Propor de novo o que o Marcel já descartou ou pausou. A lista está em `ideas.md` ("Pausado" e "Descartadas"). O Cinema está pausado e, se voltar, precisa funcionar com o Kodi.

## 5. Fechamento (todo pedido que mexe em arquivo)

### Checagens

```bash
npm run build && npm run lint && npm run check && npm run check:lessons
```

Rode as quatro, mesmo numa mudança só de agenda: são rápidas, e o deploy roda `check`, `check:lessons` e `build`, mas **não** roda o lint. Erro que passar daqui ou derruba o deploy ou vai pro ar sem ninguém ver.

Se mudou algo visível, faça também a conferência no tamanho de celular descrita na `sayang-design` (as duas perspectivas, os dois temas).

### Docs que precisam acompanhar o código

As skills e o README são o que a próxima sessão vai ler. Se ficarem pra trás, a próxima mudança é feita em cima de uma descrição errada. Antes do commit, confira:

| Se você… | Atualize |
| --- | --- |
| Entregou algo que estava em "Ainda não feitas" | Mova a linha para "Já no app" em `.claude/skills/sayang-design/references/ideas.md` |
| Criou um arquivo em `src/lib/` ou `src/data/`, ou mudou como um deles funciona | A seção "Dados" da `sayang-design` |
| Criou uma atividade nova | A lista "Atividades disponíveis" da `sayang-agenda` |
| Criou um script no `package.json` ou mudou um passo de configuração | `README.md` (e `CLAUDE.md` se for checagem de entrega) |
| O Marcel descartou ou pausou uma ideia | `ideas.md`, com o motivo se ele disse |

Não mexa em `.claude/skills/frontend-design` nem em `.claude/skills/shadcn`: vêm de fora (`skills-lock.json`) e seriam sobrescritas.

### Commit

Uma mensagem por mudança coerente, em português, no padrão do histórico:

```
<área>: <o que mudou, do ponto de vista de quem usa>

- detalhe, quando houver mais de uma coisa
- outro detalhe
```

Áreas já usadas: `agenda`, `aprender`, `toques`, `cofre`. Crie outra curta e em minúsculas se nenhuma servir (`agora`, `dia`, `nós`, `ajustes`, `pwa`). Pedido misturado vira um commit por área quando as partes fazem sentido sozinhas; se uma não funciona sem a outra, um commit só, com a área principal.

### Publicar

Cada push na `main` publica o site. Faça o push se o Marcel já pediu pra publicar ou atualizar o app. Senão, pergunte em uma linha ("Posso publicar?"). O Cloudflare faz o build sozinho e marca o commit no GitHub. Depois do push, confira com `gh api repos/marcelcorradi/sayang-timezones/commits/main/check-runs --jq '.check_runs[] | {name, status, conclusion}'` e avise se falhou.

### Resposta

Curta e no idioma do pedido. Diga o que mudou do jeito que o casal vai ver, não do jeito que o código ficou: nos dois relógios quando for horário ("19:00 em Jakarta = 09:00 pra você"), nas duas perspectivas quando for tela. Diga também o que você assumiu e o que ficou de fora.

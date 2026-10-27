# Sayang

App de horários do casal Marcel Corradi (Itaúna/MG, `America/Sao_Paulo`) e Gabriela Sitorus (Jakarta, `Asia/Jakarta`), 10h de diferença. Site estático no Cloudflare Pages, atrás do login do Cloudflare Access (só os dois e-mails): cada push na `main` faz o deploy. O repositório é privado.

- Qualquer pedido sobre o app: comece pela skill `sayang`. Ela escolhe entre as skills abaixo, divide pedidos que misturam áreas e fecha o trabalho (checagens, docs, commit, deploy).
- Mudanças na agenda (rotinas, folgas, compromissos, datas): use a skill `sayang-agenda`. O único arquivo envolvido é `src/data/couple.ts`.
- Telas, componentes, textos ou funcionalidades novas: use a skill `sayang-design`.
- Toda frase da interface existe em pt, en e id (`src/lib/i18n.ts`).
- Recados, cartas e motivos ficam criptografados no repositório privado `marcelcorradi/sayang-cofre` (`src/lib/vault/`). Nunca leia, decifre ou altere esse repositório sem o Marcel pedir.
- Antes de entregar: `npm run build && npm run lint && npm run check && npm run check:lessons`.

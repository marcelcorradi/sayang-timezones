# Sayang

App de horários do casal Marcel Corradi (Itaúna/MG, `America/Sao_Paulo`) e Gabriela Sitorus (Jakarta, `Asia/Jakarta`), 10h de diferença. Site estático no GitHub Pages: cada push na `main` faz o deploy.

- Mudanças na agenda (rotinas, folgas, compromissos, datas): use a skill `sayang-agenda`. O único arquivo envolvido é `src/data/couple.ts`.
- Telas, componentes, textos ou funcionalidades novas: use a skill `sayang-design`.
- Toda frase da interface existe em pt, en e id (`src/lib/i18n.ts`).
- Recados, cartas e motivos ficam criptografados no branch `vault` (`src/lib/vault/`). Nunca leia, decifre ou altere esse branch sem o Marcel pedir.
- Antes de entregar: `npm run build && npm run lint && npm run check`.

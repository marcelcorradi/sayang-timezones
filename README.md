# Sayang

O relógio do Marcel (Itaúna, Brasil) e da Gabriela (Jakarta, Indonésia): o que cada um está fazendo agora, quando os dois estão livres para conversar e quantos dias faltam para o próximo encontro. Em português, inglês e indonésio.

## No celular

Abra o link do GitHub Pages e use "Adicionar à tela inicial" (Safari no iPhone, Chrome no Android). O app abre como aplicativo e funciona sem internet. Na engrenagem, "Copiar link pra Gabriela" gera um link que já abre configurado para ela, em indonésio.

## Recados, cartas, pote e toques

Essas funções guardam o que vocês escrevem num **cofre criptografado**, dentro deste repositório (branch `vault`). Só quem sabe a senha do casal consegue ler. Pra ativar, uma vez só:

1. Crie uma chave no GitHub em [Settings → Personal access tokens → Fine-grained](https://github.com/settings/personal-access-tokens/new):
   - em *Repository access*, escolha **Only select repositories** → `sayang-timezones`;
   - em *Permissions → Contents*, escolha **Read and write**;
   - escolha a validade mais longa possível.
2. No app, toque em **Ativar recados e cartas**, cole a chave, escolha uma senha do casal e toque em **Criar cofre**.
3. Em **Ajustes**, toque em **Copiar link de configuração pra Gabriela** e mande só pra ela. O link já leva a chave e a senha.
4. Pra receber os toques como notificação: instale o app **ntfy** ([Android](https://play.google.com/store/apps/details?id=io.heckel.ntfy) / [iPhone](https://apps.apple.com/app/ntfy/id1625396347)), toque em **+** e assine o tópico que aparece em Ajustes.

## Mudar a agenda

Tudo fica em [`src/data/couple.ts`](src/data/couple.ts). O jeito fácil é pedir pro Claude Code neste repositório, por exemplo "ela tem academia seg/qua/sex às 19h" ou "feriado aqui dia 20/11". A skill `sayang-agenda` sabe onde e como mexer, confere o resultado e publica.

```bash
npm run check                  # valida o arquivo e mostra os próximos 7 dias nos dois fusos
npm run check -- 2026-12-24 1  # um dia específico
```

## Desenvolvimento

```bash
npm install
npm run dev
npm run build && npm run lint
VITE_VAULT_LOCAL=1 npm run dev   # cofre no navegador, sem GitHub
npm run icons                    # regenera os ícones a partir de public/icon.svg
```

Cada push na `main` publica o site pelo GitHub Actions ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)).

Stack: React, Vite, Tailwind v4, shadcn/ui (Base UI) e vite-plugin-pwa. O clima vem da [Open-Meteo](https://open-meteo.com/).

## Skills do Claude neste repositório

| Skill | Para quê |
| --- | --- |
| `sayang` | Porta de entrada: escolhe a skill certa, divide pedidos mistos e fecha com checagens, docs, commit e deploy |
| `sayang-agenda` | Adicionar e editar rotinas, folgas, compromissos e datas |
| `sayang-design` | Direção visual, regras de UI e idiomas para novas telas e funcionalidades |
| `frontend-design` | Skill oficial da Anthropic (`anthropics/skills`) |
| `shadcn` | Skill oficial do shadcn/ui (`shadcn-ui/ui`) |

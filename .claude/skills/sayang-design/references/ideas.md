# Ideias para o Sayang

Vieram de uma pesquisa sobre apps para casais a distância (Cupla, Without, Locket, Rabbit e listas de "best LDR apps") e foram filtradas para o caso do Marcel e da Gabriela: 10h de diferença, dois idiomas e tudo pelo celular.

## Já no app

- Dois relógios com o céu de cada cidade e o status atual ("Trabalhando até 18:00").
- Veredito "dá pra ligar agora?" e a próxima janela em que os dois estão livres, nos dois fusos.
- Linha do tempo do dia lado a lado, com a faixa verde das janelas e o marcador de onde o dia do outro vira.
- Contagem regressiva para o reencontro e "juntos há N dias".
- Clima agora nas duas cidades (Open-Meteo, sem chave).
- Palavra do dia: quem é do Brasil aprende indonésio, e vice-versa.
- Datas especiais (aniversários etc.).
- PWA: instala na tela inicial e funciona offline.
- Português, inglês e indonésio, e um link que abre já configurado para a outra pessoa.
- Site privado: Cloudflare Pages + Cloudflare Access (código no e-mail, só os dois), sessão de 1 mês e aviso pra entrar de novo quando ela vence.
- Cofre criptografado num repositório privado só dele (`sayang-cofre`) com:
  - pote de motivos (um pote para cada; o sorteio tira só os não lidos, e os lidos ficam numa lista pra reler);
  - cartas "abra quando…" (por sentimento ou por data);
  - recado que aparece quando o outro acordar;
  - nossos medos, numa aba por pessoa: cada um compartilha um medo, os dois conversam embaixo, quem escreveu pode marcar "tá mais leve" ou apagar, e o outro recebe um aviso no ntfy sem o conteúdo;
  - aniversário que cada um coloca no app e que aparece nas datas especiais.
- O que o outro escreveu (motivos, cartas, recados, medos) já aparece traduzido pro idioma de quem lê, com o original a um toque.
- Toques pelo ntfy ("Pensando em você", "Me liga?", "Tô livre", bom dia e boa noite), com notificação de verdade no celular.
- A mesma lua: fase de hoje e quando ela está no céu das duas cidades ao mesmo tempo.
- Céu dos painéis com o nascer e o pôr do sol reais.
- Botão "Mandar bom dia no WhatsApp" quando o outro acabou de acordar.
- Botão "Instalar" e ícone "dois céus" (sol e lua).
- Aba Aprender: curso de indonésio, português e inglês com 20 unidades, 4 tipos de pergunta (o que significa, como se diz, o que ouviu, montar frase), repetição espaçada, sequência de dias, XP, dicas de gramática, palavra do dia com "outra palavra" e "Contar pro outro" pelo ntfy.

## Pausado

- **Cinema** (assistir juntos com chamada de voz): transmitir a tela do PC (Stremio e **Kodi**, que o Marcel usa muito) com WebRTC. Telefones só assistem. Kodi exige capturar a tela inteira com o som do sistema, e aí a voz do outro pode ecoar.

## Descartadas pelo Marcel

Distância entre vocês, pergunta do dia, lista do que fazer quando se encontrarem e exportar para o calendário.

## Ainda não feitas

| Ideia | Como fazer |
| --- | --- |
| Feriados dos dois países | Feriados brasileiros fixos e a lista oficial indonésia do ano (SKB 3 Menteri) como `daysOff`, pela skill sayang-agenda. |
| Status ao vivo que muda o painel | Hoje o "Tô livre" só manda um toque. Dá pra gravar um status temporário no cofre ("livre até 15:00") e o painel usar ele no lugar da rotina. |
| Avisos automáticos ("ela acordou", "a janela começa em 15 min") | Precisa de algo rodando sem o app aberto: GitHub Actions agendado publicando no ntfy, ou um backend. |
| Progresso do Aprender compartilhado | Hoje fica só no aparelho. Dá pra guardar no cofre e mostrar "Gabriela está há 5 dias seguidos" pro outro. |
| Foto do dia | Precisa de armazenamento de arquivos (Firebase Storage, Supabase Storage). Fotos no repositório pesariam e ficariam visíveis se ele for público. |

# Animoras Deck Lab

Guia de deck para o card game **Animoras**, montado a partir das regras e do balanço publicados em [animoras.com/wiki](https://animoras.com/wiki).

O deck principal é a **Revoada Celeste**: aggro aéreo de 40 cartas que junta aves com Voo e Ímpeto, uma cadeia de três slots de Céu aberto (o Ecossistema dobra o bônus para +4 de dano) e o combo de família Revoada, que dá Voo às aves terrestres. A página também traz o deck alternativo **Abismo** (Águas profundas + Mar aberto).

Conteúdo da página:

- as regras da wiki que o deck explora;
- a lista completa, com o texto oficial de cada habilidade num tooltip;
- a curva de mana;
- um simulador de dano com 5 slots, terrenos, Ecossistema, Revoada, Frenesi e Fúria Selvagem;
- plano de jogo, mulligan, ameaças e respostas;
- substitutos para quem não tem as cartas lendárias ou épicas.

## Rodar localmente

Requer Node 20 ou superior.

```bash
npm install
npm run dev
```

Abra http://localhost:4317.

## Atualizar os dados da wiki

`data/wiki.json` é uma cópia dos dados do jogo (espécies com os valores de carta exatos, habilidades, terrenos e magias). Para atualizar depois de um patch de balanço:

```bash
npm run fetch:wiki            # regrava data/wiki.json e mostra o ranking por custo
node scripts/fetch-wiki.mjs --top 15
```

O script baixa o bundle JavaScript da wiki, executa-o sob jsdom e usa as próprias funções do jogo para calcular custo, dano, vida e habilidades de cada espécie. Se um nome de carta usado em `lib/deck.ts` sumir da wiki, a página mostra um erro indicando qual.

## Estrutura

- `app/page.tsx`: o guia.
- `lib/deck.ts`: as listas dos decks, os substitutos e os cálculos de curva.
- `components/deck/`: carta, curva de mana, tooltip de habilidade e simulador de dano.
- `scripts/fetch-wiki.mjs`: extração dos dados da wiki.

Projeto de fã, sem relação oficial com Animoras.

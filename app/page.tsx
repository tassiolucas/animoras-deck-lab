import { DamageSimulator, type SimAnimal } from "@/components/deck/damage-simulator";
import { DeckCard } from "@/components/deck/deck-card";
import { ManaCurve } from "@/components/deck/mana-curve";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  abismo,
  abismoEntries,
  ability,
  averageCost,
  countCards,
  rarityColor,
  revoada,
  revoadaEntries,
  substitutes,
  wikiMeta,
  type DeckEntry,
} from "@/lib/deck";

const nav = [
  ["porque", "Por que funciona"],
  ["lista", "Lista"],
  ["curva", "Curva"],
  ["simulador", "Simulador"],
  ["plano", "Plano de jogo"],
  ["ameacas", "Ameaças"],
  ["substitutos", "Substitutos"],
  ["abismo", "Deck alternativo"],
] as const;

const levers = [
  {
    icon: "🪶",
    title: "Voo é quase intocável",
    rule: "“Só pode ser atacado por quem voa.”",
    body: "O oponente só responde com os próprios voadores, Ecolocalização (rara nos custos baixos) ou magias. Atacantes terrestres simplesmente não alcançam suas aves.",
  },
  {
    icon: "☁️",
    title: "Ecossistema multiplica o Céu aberto",
    rule: "“3 slots seus seguidos com o mesmo terreno dobram o efeito dele; 5 seguidos triplicam.”",
    body: "Céu aberto dá +2 de dano aos voadores. Em cadeia de 3 slots vira +4; em cadeia de 5, +6. Uma Águia-real 4/3 passa a bater 8.",
  },
  {
    icon: "🔥",
    title: "Céu aberto não queima",
    rule: "“Queimada: um slot de campo, copa, tronco ou savana vira cinzas.”",
    body: "A principal forma de destruir terrenos não atinge o céu. Sua cadeia só cai para a Era do gelo, que é épica.",
  },
  {
    icon: "🐦",
    title: "Revoada dá Voo a qualquer ave",
    rule: "“3 aves formam a Revoada e ganham Voo.”",
    body: "Com 3 aves no tabuleiro, Casuar, Avestruz e Pássaro-elefante também voam e passam a receber o bônus do Céu aberto.",
  },
  {
    icon: "⚖️",
    title: "Habilidades saem baratas",
    rule: "Custo na wiki: (dano + vida) ÷ 2,4 + 0,5 por habilidade.",
    body: "Ímpeto, Voo e Frenesi custam meio ponto de mana cada. As aves de rapina carregam três habilidades por 4 de mana.",
  },
];

const turnPlan = [
  { turns: "Turnos 1–3", title: "Pressão imediata", body: "Coruja-das-torres, Tucano-toco, Atobá e Fragata entram com Ímpeto e atacam o guardião no mesmo turno. Montanha nas pontas dá +1 a cada ave." },
  { turns: "Turnos 4–6", title: "Montar a cadeia", body: "Coloque Céu aberto nos slots 2, 3 e 4. Com a cadeia de 3, cada voador ali ganha +4. Águias de 4 de mana entram com Ímpeto direto no céu." },
  { turns: "Turnos 6–8", title: "Revoada e Frenesi", body: "Com 3 aves no tabuleiro, as aves terrestres voam. Águias feridas ganham +2 pelo Frenesi. Pinguim-imperador e Pássaro-elefante seguram o chão." },
  { turns: "Fechamento", title: "Fúria ou Raio", body: "Fúria Selvagem dá +3 a todos os animais: com 4 voadores, são 12 de dano extra num turno. Raio fecha os últimos 3 pontos de vida do guardião." },
];

const mulligan = {
  keep: ["Aves de custo 2 e 3 com Ímpeto", "Um Céu aberto", "Seiva junto de uma águia", "Montanha (é grátis e já dá +1)"],
  toss: ["Avestruz e Pássaro-elefante (custo 6)", "Fúria Selvagem", "Instinto", "Mão sem nenhuma ave de custo 2 ou 3"],
};

const threats = [
  { threat: "Tempestade ou Terremoto", why: "2 de dano em todos: mata as aves de 1 e 2 de vida.", answer: "Segure Coruja e Tucano depois de ver a magia; use Casca Protetora na águia principal. Tuiuiú e as aves de 3 de vida sobrevivem." },
  { threat: "Era do gelo", why: "Congela um slot por 2 turnos e quebra a cadeia de Céu aberto.", answer: "Mantenha um Céu aberto na mão para refazer a cadeia ao lado; o efeito acaba em 2 turnos." },
  { threat: "Voadores inimigos", why: "São os únicos animais que bloqueiam suas aves.", answer: "Raio, Marca do Caçador ou Silêncio (tira o Voo). Águias de Frenesi vencem a troca quando feridas." },
  { threat: "Ecolocalização", why: "Ataca camuflados e voadores.", answer: "Silêncio remove a habilidade; Raio mata os morcegos e o Kiwi, que têm pouca vida." },
  { threat: "Agressão terrestre", why: "Atacantes no chão vão direto no seu guardião.", answer: "Pinguim-imperador e Pássaro-elefante têm Guardião. Na corrida, seu dano por turno costuma ser maior." },
  { threat: "Guardiões voadores", why: "Obrigam seus ataques a irem neles primeiro.", answer: "Guardião funciona uma vez: um ataque de ave pequena gasta a habilidade, e as águias passam livres." },
];

function Section({ id, eyebrow, title, children, lead }: { id: string; eyebrow: string; title: string; lead?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold tracking-widest text-sky-300 uppercase">{eyebrow}</p>
        <h2 className="text-2xl font-bold text-white sm:text-3xl">{title}</h2>
        {lead && <p className="max-w-3xl text-slate-300">{lead}</p>}
      </div>
      {children}
    </section>
  );
}

function CardGrid({ entries }: { entries: DeckEntry[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map((e) => (
        <DeckCard key={`${e.kind}-${e.card.id}`} entry={e} />
      ))}
    </div>
  );
}

export default function Home() {
  const total = countCards(revoadaEntries);
  const animalCount = countCards(revoada.animals);
  const nativeFlyers = revoada.animals.filter((a) => a.card.abilities.includes("flying")).reduce((t, a) => t + a.count, 0);
  const chargeCount = revoada.animals.filter((a) => a.card.abilities.includes("charge")).reduce((t, a) => t + a.count, 0);

  const simAnimals: SimAnimal[] = revoada.animals.map(({ card }) => ({
    id: card.id,
    name: card.name,
    family: card.family,
    atk: card.atk,
    abilities: card.abilities,
  }));

  return (
    <TooltipProvider>
      <div className="relative min-h-screen overflow-x-hidden bg-[#070b18] text-slate-200">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.25),transparent_60%),radial-gradient(ellipse_at_80%_20%,rgba(167,139,250,0.18),transparent_50%)]"
        />

        <nav className="sticky top-0 z-40 border-b border-white/5 bg-[#070b18]/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center gap-4 overflow-x-auto px-4 py-3 text-sm whitespace-nowrap sm:px-6">
            <span className="font-semibold text-white">☁️ Animoras Deck Lab</span>
            {nav.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="text-slate-400 transition-colors hover:text-white">
                {label}
              </a>
            ))}
          </div>
        </nav>

        <main className="relative mx-auto max-w-6xl space-y-20 px-4 pt-14 pb-24 sm:px-6">
          <header className="space-y-8">
            <div className="space-y-4">
              <p className="text-sm text-sky-300">Deck para Animoras · baseado nas regras e no balanço da wiki</p>
              <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl">{revoada.name}</h1>
              <p className="max-w-2xl text-lg text-slate-300">{revoada.tagline}</p>
            </div>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["Cartas", `${total} / 40`],
                ["Custo médio", averageCost(revoadaEntries).toFixed(1).replace(".", ",")],
                ["Voadores nativos", `${nativeFlyers} de ${animalCount} animais`],
                ["Com Ímpeto", `${chargeCount} animais`],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
                  <dt className="text-xs text-slate-400">{k}</dt>
                  <dd className="mt-1 text-xl font-bold text-white">{v}</dd>
                </div>
              ))}
            </dl>
          </header>

          <Section
            id="porque"
            eyebrow="Análise das regras"
            title="As cinco alavancas que o deck explora"
            lead="Cada escolha vem de uma regra da aba Regras e balanço ou do texto de uma habilidade ou terreno na wiki."
          >
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {levers.map((l) => (
                <article key={l.title} className="space-y-2 rounded-xl border border-white/10 bg-slate-950/40 p-5">
                  <h3 className="font-semibold text-white">
                    <span className="mr-2">{l.icon}</span>
                    {l.title}
                  </h3>
                  <p className="text-sm text-sky-200/80 italic">{l.rule}</p>
                  <p className="text-sm text-slate-300">{l.body}</p>
                </article>
              ))}
            </div>
          </Section>

          <Section id="lista" eyebrow="40 cartas" title="A lista completa" lead="Passe o mouse (ou toque) numa habilidade para ver o texto oficial dela.">
            <div className="space-y-10">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Animais · {countCards(revoada.animals)}</h3>
                <CardGrid entries={revoada.animals} />
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Terrenos · {countCards(revoada.scenarios)}</h3>
                <CardGrid entries={revoada.scenarios} />
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Magias · {countCards(revoada.spells)}</h3>
                <CardGrid entries={revoada.spells} />
              </div>
            </div>
          </Section>

          <Section id="curva" eyebrow="Mana" title="Curva de mana" lead="A mana cresce 1 por turno até 10. O deck concentra quase tudo entre 2 e 4 para usar toda a mana desde cedo.">
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-6">
              <ManaCurve entries={revoadaEntries} />
            </div>
          </Section>

          <Section
            id="simulador"
            eyebrow="Interativo"
            title="Simulador de dano"
            lead="Monte um tabuleiro de 5 slots e veja quanto dano a Revoada causa por turno com os bônus de terreno, Ecossistema, Frenesi e Fúria Selvagem."
          >
            <DamageSimulator
              animals={simAnimals}
              defaults={["blue_footed_booby", "eagle", "peregrine_falcon", "bald_eagle", "owl"]}
            />
          </Section>

          <Section id="plano" eyebrow="Como jogar" title="Plano de jogo">
            <ol className="grid gap-3 md:grid-cols-4">
              {turnPlan.map((t, i) => (
                <li key={t.turns} className="relative space-y-2 rounded-xl border border-white/10 bg-slate-950/40 p-5">
                  <span className="text-xs font-semibold text-sky-300">
                    {i + 1}. {t.turns}
                  </span>
                  <h3 className="font-semibold text-white">{t.title}</h3>
                  <p className="text-sm text-slate-300">{t.body}</p>
                </li>
              ))}
            </ol>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-5">
                <h3 className="mb-3 font-semibold text-emerald-200">Mulligan: manter</h3>
                <ul className="space-y-1.5 text-sm text-slate-300">
                  {mulligan.keep.map((k) => (
                    <li key={k}>✓ {k}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-rose-400/20 bg-rose-400/5 p-5">
                <h3 className="mb-3 font-semibold text-rose-200">Mulligan: devolver</h3>
                <ul className="space-y-1.5 text-sm text-slate-300">
                  {mulligan.toss.map((k) => (
                    <li key={k}>✕ {k}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>

          <Section id="ameacas" eyebrow="Contra-jogo" title="Ameaças e respostas">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-slate-300">Ameaça</TableHead>
                    <TableHead className="text-slate-300">Por que incomoda</TableHead>
                    <TableHead className="text-slate-300">Resposta</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {threats.map((t) => (
                    <TableRow key={t.threat} className="border-white/5 hover:bg-white/5">
                      <TableCell className="align-top font-medium whitespace-normal text-white">{t.threat}</TableCell>
                      <TableCell className="min-w-48 align-top whitespace-normal text-slate-400">{t.why}</TableCell>
                      <TableCell className="min-w-64 align-top whitespace-normal text-slate-300">{t.answer}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Section>

          <Section
            id="substitutos"
            eyebrow="Coleção"
            title="Substitutos"
            lead="Os animais vêm da sua coleção. Se faltar alguma lendária ou épica, estas trocas mantêm o plano aéreo."
          >
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-slate-300">Sai</TableHead>
                    <TableHead className="text-slate-300">Entra</TableHead>
                    <TableHead className="text-slate-300">Observação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {substitutes.map((s) => (
                    <TableRow key={s.out.id + s.in[0].id} className="border-white/5 hover:bg-white/5">
                      <TableCell className="align-top whitespace-normal">
                        <SpeciesLabel name={s.out.name} rarity={s.out.rarity} stats={`${s.out.cost} · ${s.out.atk}/${s.out.hp}`} />
                      </TableCell>
                      <TableCell className="space-y-1 align-top whitespace-normal">
                        {s.in.map((x) => (
                          <SpeciesLabel
                            key={x.id}
                            name={x.name}
                            rarity={x.rarity}
                            stats={`${x.cost} · ${x.atk}/${x.hp} · ${x.abilities.map((a) => ability(a).name).join(", ")}`}
                          />
                        ))}
                      </TableCell>
                      <TableCell className="min-w-56 align-top whitespace-normal text-slate-400">{s.note}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Section>

          <Section id="abismo" eyebrow="Alternativa" title={`Deck alternativo: ${abismo.name}`} lead={abismo.tagline}>
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              <CardGrid entries={abismoEntries} />
              <aside className="h-fit space-y-4 rounded-2xl border border-white/10 bg-slate-950/40 p-5 lg:sticky lg:top-20">
                <h3 className="font-semibold text-white">
                  {countCards(abismoEntries)} cartas · custo médio {averageCost(abismoEntries).toFixed(1).replace(".", ",")}
                </h3>
                <ManaCurve entries={abismoEntries} />
                <p className="text-sm text-slate-400">
                  Mais lento e mais caro que a Revoada, mas resiste melhor a Tempestade e a agressão terrestre. Use se a sua coleção for
                  mais forte em animais marinhos.
                </p>
              </aside>
            </div>
          </Section>

          <section className="space-y-3 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-6 text-sm text-slate-300">
            <h2 className="font-semibold text-amber-200">Limites desta análise</h2>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>A wiki não lista as classes de deck (vida do guardião entre 26 e 32, poder e afinidade). Escolha uma classe com afinidade Ar, se o jogo oferecer.</li>
              <li>A regra diz que o combo de família vale para 3 animais &ldquo;juntos&rdquo;. Na dúvida, deixe as aves em slots vizinhos.</li>
              <li>Os valores são os da média da espécie. Cada animal da coleção varia ±15%, jovens têm −1/−1 e as habilidades sorteadas podem mudar conforme o indivíduo.</li>
              <li>
                Dados extraídos da wiki em {new Date(wikiMeta.fetchedAt).toLocaleDateString("pt-BR")}: {wikiMeta.speciesCount} espécies,{" "}
                {wikiMeta.abilityCount} habilidades, {wikiMeta.scenarioCount} terrenos e {wikiMeta.spellCount} magias. Para atualizar, rode{" "}
                <code className="rounded bg-white/10 px-1">npm run fetch:wiki</code>.
              </li>
            </ul>
          </section>
        </main>

        <footer className="border-t border-white/5 py-8 text-center text-xs text-slate-500">
          Guia de fã baseado em{" "}
          <a href="https://animoras.com/wiki" className="underline hover:text-slate-300" target="_blank" rel="noreferrer">
            animoras.com/wiki
          </a>
          . Animoras é dos seus criadores.
        </footer>
      </div>
    </TooltipProvider>
  );
}

function SpeciesLabel({ name, rarity, stats }: { name: string; rarity: keyof typeof rarityColor; stats: string }) {
  return (
    <div>
      <span className="font-medium text-white">{name}</span> <span className="text-xs" style={{ color: rarityColor[rarity] }}>{rarity}</span>
      <p className="text-xs text-slate-500">{stats}</p>
    </div>
  );
}

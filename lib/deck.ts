import wiki from "@/data/wiki.json";

export type Rarity = "comum" | "incomum" | "raro" | "épico" | "lendário";

export type Ability = { id: string; name: string; icon: string; text: string };
export type Scenario = { id: string; name: string; icon: string; rarity: Rarity; cost: number; text: string; color: string };
export type Spell = { id: string; name: string; icon: string; cost: number; rarity: Rarity; text: string; target: string };
export type Species = {
  id: string;
  name: string;
  scientific: string | null;
  family: string;
  rarity: Rarity;
  extinct: boolean;
  habitats: string[];
  regions: string[];
  cost: number;
  atk: number;
  hp: number;
  abilities: string[];
};

const abilities = wiki.abilities as Record<string, Ability>;
const scenarios = wiki.scenarios as Record<string, Scenario>;
const spells = wiki.spells as Record<string, Spell>;
const species = new Map((wiki.species as Species[]).map((s) => [s.id, s]));

export const wikiMeta = {
  fetchedAt: wiki.fetchedAt,
  speciesCount: species.size,
  abilityCount: Object.keys(abilities).length,
  scenarioCount: Object.keys(scenarios).length,
  spellCount: Object.keys(spells).length,
};

function must<T>(value: T | undefined, label: string): T {
  if (value === undefined) throw new Error(`"${label}" não existe em data/wiki.json. Rode node scripts/fetch-wiki.mjs.`);
  return value;
}

export const ability = (id: string) => abilities[id] ?? { id, name: id, icon: "•", text: "" };
export const getSpecies = (id: string) => must(species.get(id), id);
export const getScenario = (id: string) => must(scenarios[id], id);
export const getSpell = (id: string) => must(spells[id], id);

export type AnimalEntry = { kind: "animal"; card: Species; count: number; role: string };
export type ScenarioEntry = { kind: "scenario"; card: Scenario; count: number; role: string };
export type SpellEntry = { kind: "spell"; card: Spell; count: number; role: string };
export type DeckEntry = AnimalEntry | ScenarioEntry | SpellEntry;

const animal = (id: string, count: number, role: string): AnimalEntry => ({ kind: "animal", card: getSpecies(id), count, role });
const scenario = (id: string, count: number, role: string): ScenarioEntry => ({ kind: "scenario", card: getScenario(id), count, role });
const spell = (id: string, count: number, role: string): SpellEntry => ({ kind: "spell", card: getSpell(id), count, role });

export const revoada = {
  name: "Revoada Celeste",
  tagline: "Aggro aéreo: voadores que o oponente não consegue bloquear, multiplicados pelo Ecossistema de Céu aberto.",
  animals: [
    animal("owl", 2, "Abre o jogo no turno 2 e já ataca."),
    animal("toucan", 2, "Mesma função da coruja: pressão imediata."),
    animal("nicobar_pigeon", 1, "Esquiva: 30% de chance de ignorar Raio e ataques."),
    animal("passenger_pigeon", 1, "Enxame deixa um 1/1 extra: fecha a Revoada mais cedo."),
    animal("blue_footed_booby", 2, "3 de dano com Ímpeto: o melhor custo 3 do deck."),
    animal("magnificent_frigatebird", 2, "Cópia do atobá para consistência."),
    animal("osprey", 1, "Ímpeto + Voo extra na curva."),
    animal("king_vulture", 1, "Carniceiro: cresce a cada troca de animais."),
    animal("jabiru", 1, "3 de vida: sobrevive a Raio e Tempestade."),
    animal("eagle", 2, "Núcleo: 4/3 Ímpeto, Voo e Frenesi."),
    animal("bald_eagle", 2, "Segunda dupla de águias do núcleo."),
    animal("haasts_eagle", 1, "Terceira águia de Frenesi."),
    animal("peregrine_falcon", 1, "Ataque duplo + Atropelar: dobra o bônus do Céu aberto."),
    animal("harpy_eagle", 1, "Frenesi + Ímpeto para fechar a curva de 4."),
    animal("southern_cassowary", 1, "Atropelar e Couro grosso; voa pela Revoada."),
    animal("emperor_penguin", 1, "Guardião terrestre que segura o contra-ataque."),
    animal("common_ostrich", 1, "Sentinela revela camuflados; Ímpeto + Atropelar."),
    animal("elephant_bird", 1, "4/7 Guardião: a parede do deck."),
  ],
  scenarios: [
    scenario("ceu", 4, "Três slots seguidos dobram o bônus: voadores +4 de dano."),
    scenario("montanha", 2, "Grátis. Aves +1 de dano nas pontas, fora da cadeia."),
  ],
  spells: [
    spell("furia", 2, "Finalizador: com 4 voadores, +12 de dano no guardião."),
    spell("raio", 2, "Remove voadores inimigos ou dá os últimos 3 de dano."),
    spell("inervar", 1, "Mana extra: Céu aberto e uma águia no mesmo turno."),
    spell("esteroide", 1, "Use no Falcão-peregrino: +3 de dano em 4 ataques."),
    spell("protecao", 1, "Protege uma águia de Raio ou Tempestade."),
    spell("silencio", 1, "Tira Voo, Ecolocalização ou Guardião do bloqueador."),
    spell("emboscada", 1, "Deixa um bloqueador grande com 1 de vida."),
    spell("instinto", 1, "Recarga de mão no meio do jogo."),
  ],
} satisfies { name: string; tagline: string; animals: AnimalEntry[]; scenarios: ScenarioEntry[]; spells: SpellEntry[] };

export const revoadaEntries: DeckEntry[] = [...revoada.animals, ...revoada.scenarios, ...revoada.spells];

export const substitutes = [
  { out: "eagle", in: ["andean_condor", "cinereous_vulture"], note: "Perde o Ímpeto, mas mantém Voo e o corpo 4/3 ou 3/3." },
  { out: "haasts_eagle", in: ["wandering_albatross"], note: "Albatroz 4/3 Voo, épico, bem mais fácil de achar." },
  { out: "peregrine_falcon", in: ["pteranodon", "andean_condor"], note: "Pteranodonte 4/4 Voo + Ímpeto não conta para a Revoada (é réptil)." },
  { out: "harpy_eagle", in: ["cinereous_vulture"], note: "Abutre-preto 3/3 Voo, Frenesi e Carniceiro." },
  { out: "king_vulture", in: ["harris_hawk", "bar_headed_goose"], note: "Aves raras de custo 3 com Voo." },
  { out: "passenger_pigeon", in: ["toucan"], note: "Terceira cópia do tucano." },
  { out: "elephant_bird", in: ["greater_rhea"], note: "Ema 3/4 Ímpeto, incomum: voa pela Revoada." },
  { out: "southern_cassowary", in: ["greater_rhea"], note: "Mantém a contagem de aves para a Revoada." },
].map((s) => ({ out: getSpecies(s.out), in: s.in.map(getSpecies), note: s.note }));

export const abismo = {
  name: "Abismo",
  tagline: "Midrange de águas profundas: só quem também tem Águas profundas pode atacar, e Mar aberto em cadeia dá +4/+2.",
  animals: [
    animal("sloane_viperfish", 2, "Hemorragia barata para o começo."),
    animal("anglerfish", 2, "Choque ao entrar limpa fichas 1/1."),
    animal("chambered_nautilus", 2, "Carapaça + Couro grosso: segura o começo."),
    animal("frilled_shark", 2, "5/5 Frenesi intocável por 5 de mana."),
    animal("goblin_shark", 2, "Bote: o primeiro ataque causa +2."),
    animal("oarfish", 2, "Atordoar trava o melhor atacante inimigo."),
    animal("giant_pacific_octopus", 2, "Tinta + Camuflagem: não morre de primeira."),
    animal("humboldt_squid", 2, "5/5 Frenesi; sem Águas profundas, entra para proteger os outros."),
    animal("coelacanth", 2, "Regeneração + Couro grosso: difícil de matar com magia."),
    animal("giant_squid", 1, "Tinta + Atordoar."),
    animal("colossal_squid", 1, "Tinta + Frenesi + Couro grosso."),
    animal("greenland_shark", 1, "Carniceiro que regenera."),
    animal("sperm_whale", 2, "9/10 Atropelar: o finalizador."),
  ],
  scenarios: [scenario("oceano", 4, "Aquáticos +2 de dano e +1 de vida; dobra em cadeia de 3."), scenario("agua", 2, "Grátis. Aquáticos +1/+1 nas pontas.")],
  spells: [
    spell("raio", 2, "Remoção e alcance."),
    spell("tempestade", 2, "Limpa enxames e voadores pequenos."),
    spell("inervar", 1, "Acelera o Cachalote."),
    spell("chuva", 2, "Desfaz Queimada e cura seus aquáticos."),
    spell("instinto", 2, "Compra para chegar às peças grandes."),
    spell("furia", 1, "Fecha a partida."),
    spell("protecao", 1, "Guarda o Cachalote de uma remoção."),
  ],
};

export const abismoEntries: DeckEntry[] = [...abismo.animals, ...abismo.scenarios, ...abismo.spells];

export const countCards = (entries: DeckEntry[]) => entries.reduce((t, e) => t + e.count, 0);

export function manaCurve(entries: DeckEntry[]) {
  const buckets = Array.from({ length: 9 }, (_, i) => ({ cost: i, animal: 0, scenario: 0, spell: 0 }));
  for (const e of entries) {
    const b = buckets[Math.min(8, e.card.cost)];
    b[e.kind] += e.count;
  }
  return buckets;
}

export function averageCost(entries: DeckEntry[]) {
  return entries.reduce((t, e) => t + e.card.cost * e.count, 0) / countCards(entries);
}

export const rarityColor: Record<Rarity, string> = {
  comum: "#b4b4b4",
  incomum: "#7ed957",
  raro: "#5fb4ff",
  épico: "#c57bff",
  lendário: "#ffb84d",
};

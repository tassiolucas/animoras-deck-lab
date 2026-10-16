import { AbilityChip } from "@/components/deck/ability-chip";
import { ability, rarityColor, type DeckEntry } from "@/lib/deck";

const familyIcon: Record<string, string> = {
  Ave: "🪶",
  Mamífero: "🐾",
  Peixe: "🐟",
  Molusco: "🐙",
  Réptil: "🦎",
};

export function DeckCard({ entry }: { entry: DeckEntry }) {
  const { card, count, role } = entry;
  const color = rarityColor[card.rarity];

  return (
    <article
      className="group relative flex h-full flex-col gap-3 overflow-hidden rounded-xl border border-white/10 bg-slate-950/50 p-4 backdrop-blur transition-colors hover:border-white/25"
      style={{ boxShadow: `inset 3px 0 0 ${color}` }}
    >
      <header className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-sky-400/15 text-base font-bold text-sky-200 ring-1 ring-sky-300/40">
          {card.cost}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-white">
            {entry.kind !== "animal" && <span className="mr-1">{entry.card.icon}</span>}
            {card.name}
          </h3>
          <p className="text-xs text-slate-400">
            <span style={{ color }}>{card.rarity}</span>
            {entry.kind === "animal" && (
              <>
                {" · "}
                {familyIcon[entry.card.family] ?? "•"} {entry.card.family}
                {entry.card.extinct && " · extinto"}
              </>
            )}
            {entry.kind === "spell" && ` · alvo: ${targetLabel[entry.card.target] ?? entry.card.target}`}
            {entry.kind === "scenario" && " · terreno"}
          </p>
        </div>
        <span className="rounded-md bg-white/10 px-2 py-0.5 text-sm font-semibold text-white tabular-nums">×{count}</span>
      </header>

      {entry.kind === "animal" ? (
        <>
          <div className="flex items-center gap-4 text-sm tabular-nums">
            <span className="text-rose-300">⚔ {entry.card.atk}</span>
            <span className="text-emerald-300">♥ {entry.card.hp}</span>
          </div>
          {entry.card.abilities.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {entry.card.abilities.map((id) => (
                <AbilityChip key={id} ability={ability(id)} />
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-slate-300">{entry.card.text}</p>
      )}

      <p className="mt-auto border-t border-white/5 pt-3 text-xs leading-relaxed text-slate-400">{role}</p>
    </article>
  );
}

const targetLabel: Record<string, string> = {
  ally: "um aliado",
  enemy: "um inimigo",
  slot: "um slot",
  none: "sem alvo",
};

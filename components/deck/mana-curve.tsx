import { manaCurve, type DeckEntry } from "@/lib/deck";

const segments = [
  { key: "animal", label: "Animais", className: "bg-sky-400" },
  { key: "scenario", label: "Terrenos", className: "bg-emerald-400" },
  { key: "spell", label: "Magias", className: "bg-violet-400" },
] as const;

export function ManaCurve({ entries }: { entries: DeckEntry[] }) {
  const curve = manaCurve(entries).filter((b, i) => i <= 6 || b.animal + b.scenario + b.spell > 0);
  const max = Math.max(...curve.map((b) => b.animal + b.scenario + b.spell), 1);

  return (
    <figure className="space-y-4">
      <div className="flex h-48 items-end gap-2 sm:gap-3" role="img" aria-label="Curva de mana do deck">
        {curve.map((b) => {
          const total = b.animal + b.scenario + b.spell;
          return (
            <div key={b.cost} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
              <span className="text-xs font-semibold text-white tabular-nums">{total || ""}</span>
              <div
                className="flex w-full max-w-12 flex-col-reverse overflow-hidden rounded-md bg-white/5"
                style={{ height: `${(total / max) * 100}%`, minHeight: total ? 6 : 2 }}
              >
                {segments.map((s) =>
                  b[s.key] ? (
                    <div key={s.key} className={s.className} style={{ flex: b[s.key] }} title={`${s.label}: ${b[s.key]}`} />
                  ) : null,
                )}
              </div>
              <span className="text-xs text-slate-400 tabular-nums">{b.cost}</span>
            </div>
          );
        })}
      </div>
      <figcaption className="flex flex-wrap gap-4 text-xs text-slate-400">
        {segments.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5">
            <i className={`size-2.5 rounded-sm ${s.className}`} /> {s.label}
          </span>
        ))}
        <span>Eixo: custo de mana</span>
      </figcaption>
    </figure>
  );
}

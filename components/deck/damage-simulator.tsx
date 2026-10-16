"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export type SimAnimal = { id: string; name: string; family: string; atk: number; abilities: string[] };
type Terrain = "ceu" | "montanha" | "nenhum";

const terrainInfo: Record<Terrain, { label: string; icon: string }> = {
  ceu: { label: "Céu aberto", icon: "☁️" },
  montanha: { label: "Montanha", icon: "🏔️" },
  nenhum: { label: "Sem terreno", icon: "·" },
};

const EMPTY = "vazio";
const GUARDIAN_HP = [26, 32];

function ecosystemMultiplier(terrains: Terrain[], i: number) {
  const t = terrains[i];
  if (t === "nenhum") return 1;
  let start = i;
  let end = i;
  while (start > 0 && terrains[start - 1] === t) start--;
  while (end < terrains.length - 1 && terrains[end + 1] === t) end++;
  const run = end - start + 1;
  return run >= 5 ? 3 : run >= 3 ? 2 : 1;
}

export function DamageSimulator({ animals, defaults }: { animals: SimAnimal[]; defaults: string[] }) {
  const byId = useMemo(() => new Map(animals.map((a) => [a.id, a])), [animals]);
  const [slots, setSlots] = useState<string[]>(defaults);
  const [terrains, setTerrains] = useState<Terrain[]>(["montanha", "ceu", "ceu", "ceu", "montanha"]);
  const [fury, setFury] = useState(false);
  const [wounded, setWounded] = useState(false);

  const birds = slots.filter((id) => byId.get(id)?.family === "Ave").length;
  const flock = birds >= 3;

  const rows = slots.map((id, i) => {
    const a = byId.get(id);
    if (!a) return null;
    const mult = ecosystemMultiplier(terrains, i);
    const flies = a.abilities.includes("flying") || (flock && a.family === "Ave");
    let atk = a.atk;
    const parts: string[] = [`${a.atk} base`];
    if (terrains[i] === "ceu" && flies) {
      atk += 2 * mult;
      parts.push(`+${2 * mult} Céu aberto${mult > 1 ? ` (×${mult})` : ""}`);
    }
    if (terrains[i] === "montanha" && a.family === "Ave") {
      atk += mult;
      parts.push(`+${mult} Montanha`);
    }
    if (wounded && a.abilities.includes("frenzy")) {
      atk += 2;
      parts.push("+2 Frenesi");
    }
    if (fury) {
      atk += 3;
      parts.push("+3 Fúria");
    }
    const hits = a.abilities.includes("multiattack") ? 2 : 1;
    return { a, atk, hits, total: atk * hits, flies, parts, charge: a.abilities.includes("charge") };
  });

  const total = rows.reduce((t, r) => t + (r?.total ?? 0), 0);
  const flyingTotal = rows.reduce((t, r) => t + (r?.flies ? r.total : 0), 0);

  const cycleTerrain = (i: number) =>
    setTerrains((ts) => ts.map((t, j) => (j === i ? (t === "ceu" ? "montanha" : t === "montanha" ? "nenhum" : "ceu") : t)));

  const options = [{ value: EMPTY, label: "Slot vazio" }, ...animals.map((a) => ({ value: a.id, label: `${a.name} (${a.atk})` }))];

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-5">
        {slots.map((id, i) => {
          const r = rows[i];
          const mult = ecosystemMultiplier(terrains, i);
          return (
            <div key={i} className="flex flex-col gap-2 rounded-xl border border-white/10 bg-slate-950/50 p-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Slot {i + 1}</span>
                {mult > 1 && <span className="rounded bg-emerald-400/15 px-1.5 text-emerald-300">ecossistema ×{mult}</span>}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="justify-start border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                onClick={() => cycleTerrain(i)}
                aria-label={`Trocar terreno do slot ${i + 1}: ${terrainInfo[terrains[i]].label}`}
              >
                <span aria-hidden>{terrainInfo[terrains[i]].icon}</span> {terrainInfo[terrains[i]].label}
              </Button>
              <Select
                items={options}
                value={id}
                onValueChange={(v) => setSlots((s) => s.map((x, j) => (j === i ? String(v ?? EMPTY) : x)))}
              >
                <SelectTrigger className="w-full border-white/10 bg-white/5 text-slate-100" aria-label={`Animal do slot ${i + 1}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {r ? (
                <div className="mt-1 space-y-1">
                  <p className="text-2xl font-bold text-white tabular-nums">
                    {r.total}
                    <span className="ml-1 text-xs font-normal text-slate-400">
                      {r.hits > 1 ? `(${r.atk} × 2 ataques)` : "de dano"}
                    </span>
                  </p>
                  <p className="text-[11px] leading-snug text-slate-400">{r.parts.join(" · ")}</p>
                  <p className={cn("text-[11px]", r.flies ? "text-sky-300" : "text-amber-300")}>
                    {r.flies ? "Voa: só voadores o atacam" : "No chão: pode ser bloqueado"}
                    {r.charge && " · Ímpeto"}
                  </p>
                </div>
              ) : (
                <p className="mt-1 text-xs text-slate-500">Escolha um animal para este slot.</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <Switch id="fury" checked={fury} onCheckedChange={setFury} />
          <Label htmlFor="fury" className="text-slate-200">Fúria Selvagem (+3 em todos)</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="wounded" checked={wounded} onCheckedChange={setWounded} />
          <Label htmlFor="wounded" className="text-slate-200">Animais feridos (ativa Frenesi)</Label>
        </div>
        <p className={cn("text-sm", flock ? "text-sky-300" : "text-slate-400")}>
          {flock ? `Revoada ativa: ${birds} aves, todas ganham Voo` : `Revoada inativa: ${birds}/3 aves no tabuleiro`}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Dano por turno" value={total} accent />
        <Stat label="Dano que só voadores bloqueiam" value={flyingTotal} />
        {GUARDIAN_HP.map((hp) => (
          <Stat key={hp} label={`Guardião de ${hp} de vida cai em`} value={total ? `${Math.ceil(hp / total)} turno${Math.ceil(hp / total) > 1 ? "s" : ""}` : "—"} />
        ))}
      </div>
      <p className="text-xs text-slate-500">
        Clique no terreno de um slot para alternar entre Céu aberto, Montanha e nenhum. 3 slots seguidos com o mesmo terreno dobram o
        efeito; 5 triplicam. O cálculo supõe que nada bloqueia os voadores e ignora Guardiões inimigos voadores.
      </p>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className={cn("rounded-xl border p-4", accent ? "border-sky-300/40 bg-sky-400/10" : "border-white/10 bg-slate-950/50")}>
      <p className="text-xs text-slate-400">{label}</p>
      <p className={cn("mt-1 text-2xl font-bold tabular-nums", accent ? "text-sky-200" : "text-white")}>{value}</p>
    </div>
  );
}

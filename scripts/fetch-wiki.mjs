#!/usr/bin/env node
// Downloads the Animoras wiki bundle, runs it under jsdom and dumps the game data
// (species with the exact card stats the wiki shows, abilities, scenarios, spells)
// to data/wiki.json, then prints an efficiency ranking per mana cost.
//
// Usage: node scripts/fetch-wiki.mjs [--top N]

import { mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const BASE = "https://animoras.com";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const topN = Number(process.argv[process.argv.indexOf("--top") + 1]) || 8;

async function get(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.text();
}

// The bundle is minified, so its top-level names change between releases.
// Each export is located by a shape that is stable in the source.
function findName(src, label, patterns) {
  for (const re of patterns) {
    const m = src.match(re);
    if (m) return m[1];
  }
  throw new Error(`Could not locate "${label}" in the wiki bundle; the site was probably updated.`);
}

const html = await get(`${BASE}/wiki`);
const bundlePath = html.match(/src="(\/assets\/wiki-[^"]+\.js)"/)?.[1];
if (!bundlePath) throw new Error("Wiki bundle not found in /wiki HTML.");
let src = await get(BASE + bundlePath);

const cardRe = /[,;\s](\w+)=e=>\{let a=\w+\.get\(e\);return a\|\|\(a=\w+\(\w+\((\w+)\(e\)\)\)/;
const names = {
  card: findName(src, "card stats", [cardRe]),
  species: src.match(cardRe)[2],
  abilities: findName(src, "abilities", [/[,;\s](\w+)=\{venom:\{id:"venom"/]),
  scenarios: findName(src, "scenarios", [/const (\w+)=\{campo:\{id:"campo"/]),
  spells: findName(src, "spells", [/[,;\s](\w+)=\{antidoto:\{id:"antidoto"/]),
  list: findName(src, "species list", [/[,;\s]\w+=e=>\{const a=(\w+)\.find\(r=>r\.id===e\)/]),
};

src += `\nglobalThis.__animoras={card:${names.card},species:${names.species},abilities:${names.abilities},scenarios:${names.scenarios},spells:${names.spells},list:${names.list}};`;

const dom = new JSDOM(html.replace(/<script[^>]*><\/script>/g, ""), { url: `${BASE}/wiki`, pretendToBeVisual: true });
const w = dom.window;
for (const key of ["window", "document", "navigator", "localStorage", "location", "HTMLElement", "Element", "Node", "MutationObserver", "getComputedStyle", "requestAnimationFrame", "addEventListener", "scrollTo", "matchMedia", "Image", "HTMLCanvasElement", "CustomEvent", "Event"]) {
  if (w[key] !== undefined) {
    try {
      globalThis[key] = typeof w[key] === "function" && !/^[A-Z]/.test(key) ? w[key].bind(w) : w[key];
    } catch {
      Object.defineProperty(globalThis, key, { value: w[key], configurable: true });
    }
  }
}
globalThis.matchMedia ??= () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
globalThis.scrollTo ??= () => {};
w.HTMLCanvasElement.prototype.getContext = () => null;
process.on("unhandledRejection", () => {});

const tmp = path.join(tmpdir(), `animoras-wiki-${Date.now()}.mjs`);
await writeFile(tmp, src);
try {
  await import(pathToFileURL(tmp).href);
} finally {
  await rm(tmp, { force: true });
}

const A = globalThis.__animoras;
const species = A.list.map((s) => {
  const c = A.card(s.id);
  return {
    id: s.id,
    name: s.name,
    scientific: s.scientific ?? s.sci ?? null,
    family: s.family,
    rarity: s.rarity,
    extinct: !!c.extinct,
    habitats: s.habitats ?? [],
    regions: s.regions ?? [],
    diet: s.diet ?? null,
    cost: c.cost,
    atk: c.atk,
    hp: c.hp,
    abilities: c.abilities,
  };
});

const out = {
  source: `${BASE}/wiki`,
  bundle: bundlePath,
  fetchedAt: new Date().toISOString(),
  abilities: A.abilities,
  scenarios: A.scenarios,
  spells: A.spells,
  species,
};
await mkdir(path.join(root, "data"), { recursive: true });
await writeFile(path.join(root, "data", "wiki.json"), JSON.stringify(out, null, 1));
console.log(`data/wiki.json: ${species.length} species, ${Object.keys(A.abilities).length} abilities, ${Object.keys(A.scenarios).length} scenarios, ${Object.keys(A.spells).length} spells\n`);

// Abilities are worth more than raw stats: evasion and tempo decide races.
const weight = { flying: 2, deepwater: 2, charge: 1.5, stealth: 1.2, colossus: 1.5, frenzy: 1, multiattack: 2, trample: 1, lifesteal: 1, taunt: 0.8, thick: 0.8, shell: 0.8, venom: 0.8, leap: 1, sessile: -3 };
const score = (s) => s.atk + s.hp + s.abilities.reduce((t, a) => t + (weight[a] ?? 0.6), 0);
for (let cost = 1; cost <= 10; cost++) {
  const pool = species.filter((s) => s.cost === cost).sort((a, b) => score(b) - score(a));
  if (!pool.length) continue;
  console.log(`== custo ${cost} (${pool.length} espécies)`);
  for (const s of pool.slice(0, topN)) {
    const ab = s.abilities.map((a) => A.abilities[a]?.name ?? a).join(", ");
    console.log(`  ${score(s).toFixed(1).padStart(5)}  ${s.name.padEnd(28)} ${s.atk}/${s.hp}  ${s.family.padEnd(10)} ${s.rarity.padEnd(9)} ${ab}`);
  }
}

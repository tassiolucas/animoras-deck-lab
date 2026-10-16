"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Ability } from "@/lib/deck";

export function AbilityChip({ ability }: { ability: Ability }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={<button type="button" />}
        className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-sky-50/90 transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-sky-300"
      >
        <span aria-hidden>{ability.icon}</span>
        {ability.name}
      </TooltipTrigger>
      <TooltipContent>{ability.text}</TooltipContent>
    </Tooltip>
  );
}

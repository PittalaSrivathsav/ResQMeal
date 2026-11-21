import { Info } from "lucide-react";

export function Disclaimer() {
  return (
    <p className="flex items-start gap-2 rounded-xl bg-amber-50/60 px-3 py-2 text-xs text-slate-600 ring-1 ring-amber-100">
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden="true" />
      <span>
        ResQMeal does not certify that food is safe. Always check allergens, storage and handling instructions.
      </span>
    </p>
  );
}

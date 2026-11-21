import { Leaf } from "lucide-react";

type LogoProps = {
  className?: string;
};

export function Logo({ className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-700 text-white shadow-sm">
        <Leaf className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="text-xl font-extrabold tracking-tight text-slate-900">ResQMeal</span>
    </div>
  );
}

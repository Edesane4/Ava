import { cn } from "@/lib/utils";

/** A chunky, friendly paw print. Pure SVG — scales crisply, no asset needed. */
export function PawIcon({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="currentColor"
      className={cn("h-6 w-6", className)}
      aria-hidden="true"
      {...props}
    >
      <ellipse cx="20" cy="20" rx="7" ry="9" transform="rotate(-18 20 20)" />
      <ellipse cx="32" cy="15" rx="7" ry="9.5" />
      <ellipse cx="44" cy="20" rx="7" ry="9" transform="rotate(18 44 20)" />
      <ellipse cx="52" cy="33" rx="6" ry="8" transform="rotate(35 52 33)" />
      <path d="M32 30c-9 0-16 6.5-16 14 0 6 4.5 9 10 9 3.2 0 4.6-1.4 6-1.4s2.8 1.4 6 1.4c5.5 0 10-3 10-9 0-7.5-7-14-16-14z" />
    </svg>
  );
}

/** Decorative floating paws for empty backgrounds. */
export function PawConfettiBg({ className }: { className?: string }) {
  const paws = [
    { top: "8%", left: "12%", size: "h-8 w-8", delay: "0s", color: "text-sunny-dark/30" },
    { top: "22%", left: "82%", size: "h-10 w-10", delay: "0.6s", color: "text-teal/30" },
    { top: "60%", left: "6%", size: "h-12 w-12", delay: "1.1s", color: "text-coral/30" },
    { top: "75%", left: "78%", size: "h-9 w-9", delay: "0.3s", color: "text-grass/30" },
    { top: "40%", left: "45%", size: "h-7 w-7", delay: "1.4s", color: "text-sunny-dark/20" },
  ];
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden="true"
    >
      {paws.map((p, i) => (
        <PawIcon
          key={i}
          className={cn("absolute animate-float", p.size, p.color)}
          style={{ top: p.top, left: p.left, animationDelay: p.delay }}
        />
      ))}
    </div>
  );
}

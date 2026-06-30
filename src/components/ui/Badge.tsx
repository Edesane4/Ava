import { cn } from "@/lib/utils";

/** Little rounded status pill. */
export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold",
        className,
      )}
    >
      {children}
    </span>
  );
}

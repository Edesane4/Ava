import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const baseField =
  "w-full rounded-3xl border-2 border-ink/10 bg-white/80 px-5 py-3.5 text-base text-ink placeholder:text-ink/40 outline-none transition focus:border-teal focus:ring-4 focus:ring-teal/20";

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(baseField, className)} {...props} />
));
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(baseField, "min-h-[96px] resize-y", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export function Label({
  children,
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "mb-1.5 block font-display text-sm font-bold text-ink/80",
        className,
      )}
      {...props}
    >
      {children}
    </label>
  );
}

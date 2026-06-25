import type { CSSProperties, ReactNode } from "react";

import { Button } from "@codeaudit/ui/components/button";
import { cn } from "@codeaudit/ui/lib/utils";

export type FamilyStyle = CSSProperties & { [key: `--family-${string}`]: string };

export const familyTheme: FamilyStyle = {
  "--family-canvas": "#fbfaf7",
  "--family-surface": "#ffffff",
  "--family-soft": "#f5f4f0",
  "--family-ink": "#161616",
  "--family-muted": "#6f746f",
  "--family-line": "#ebe8df",
  "--family-blue": "#48baff",
  "--family-blue-deep": "#178fe7",
  "--family-green": "#18c875",
  "--family-orange": "#ff9f1a",
  "--family-red": "#ff553b",
  "--family-yellow": "#ffd66e",
  "--family-purple": "#8f6cff",
};

export function FamilyButton({
  children,
  variant = "primary",
  className,
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "success" | "danger";
  className?: string;
}) {
  return (
    <Button
      className={cn(
        "h-11 gap-2 rounded-full px-5 text-sm font-bold",
        variant === "primary" && "bg-[var(--family-ink)] text-white hover:bg-black",
        variant === "secondary" &&
          "border border-[var(--family-line)] bg-white text-[var(--family-ink)] hover:bg-[var(--family-soft)]",
        variant === "success" && "bg-[var(--family-green)] text-white hover:bg-[var(--family-green)]/90",
        variant === "danger" && "bg-[var(--family-red)] text-white hover:bg-[var(--family-red)]/90",
        className,
      )}
    >
      {children}
    </Button>
  );
}

export function StatusPill({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "blue" | "green" | "orange" | "red";
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-full px-3 py-1 text-xs font-bold",
        tone === "blue" && "bg-[var(--family-blue)]/12 text-[var(--family-blue-deep)]",
        tone === "green" && "bg-[var(--family-green)]/12 text-[var(--family-green)]",
        tone === "orange" && "bg-[var(--family-orange)]/15 text-[var(--family-orange)]",
        tone === "red" && "bg-[var(--family-red)]/12 text-[var(--family-red)]",
      )}
    >
      {children}
    </span>
  );
}

export function FilterChip({
  active = false,
  children,
  icon,
}: {
  active?: boolean;
  children: ReactNode;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-bold",
        active
          ? "border-[var(--family-ink)] bg-[var(--family-ink)] text-white"
          : "border-[var(--family-line)] bg-white text-[var(--family-ink)] hover:bg-[var(--family-soft)]",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

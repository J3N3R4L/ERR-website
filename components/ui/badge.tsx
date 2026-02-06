import type { ReactNode } from "react";
import clsx from "clsx";

type BadgeVariant = "draft" | "published" | "urgent" | "info";

const badgeClasses: Record<BadgeVariant, string> = {
  draft: "bg-slate-100 text-slate-700",
  published: "bg-emerald-100 text-emerald-700",
  urgent: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700"
};

export default function Badge({
  children,
  variant = "info",
  className
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        badgeClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

import type { ReactNode } from "react";
import clsx from "clsx";

type AlertVariant = "success" | "error" | "warning" | "info";

const alertClasses: Record<AlertVariant, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  error: "border-red-200 bg-red-50 text-red-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  info: "border-blue-200 bg-blue-50 text-blue-700"
};

export default function Alert({
  children,
  variant = "info",
  className
}: {
  children: ReactNode;
  variant?: AlertVariant;
  className?: string;
}) {
  return (
    <div className={clsx("rounded-2xl border px-4 py-3 text-sm", alertClasses[variant], className)}>
      {children}
    </div>
  );
}

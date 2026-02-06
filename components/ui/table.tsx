import type { ReactNode } from "react";
import clsx from "clsx";

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return <table className={clsx("w-full text-sm", className)}>{children}</table>;
}

export function TableHead({ children }: { children: ReactNode }) {
  return <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">{children}</thead>;
}

export function TableRow({ children, className }: { children: ReactNode; className?: string }) {
  return <tr className={clsx("border-b border-slate-100", className)}>{children}</tr>;
}

export function TableCell({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={clsx("p-3", className)}>{children}</td>;
}

export function TableHeaderCell({ children, className }: { children: ReactNode; className?: string }) {
  return <th className={clsx("p-3 font-semibold", className)}>{children}</th>;
}

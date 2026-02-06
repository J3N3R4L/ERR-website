import Link from "next/link";
import clsx from "clsx";

export default function NavLink({
  href,
  label,
  active
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "rounded-full px-3 py-2 text-sm font-medium transition",
        active
          ? "bg-slate-900 text-white"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      )}
    >
      {label}
    </Link>
  );
}

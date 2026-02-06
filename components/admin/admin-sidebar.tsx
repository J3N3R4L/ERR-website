"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

type AdminNavItem = {
  label: string;
  href: string;
};

const navItems: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin" },
  { label: "Localities", href: "/admin/localities" },
  { label: "News", href: "/admin/news" },
  { label: "Field Updates", href: "/admin/field" },
  { label: "Media", href: "/admin/photos" },
  { label: "Downloads", href: "/admin/documents" },
  { label: "Donation Methods", href: "/admin/donations" },
  { label: "Users", href: "/admin/users" },
  { label: "Settings", href: "/admin/settings" }
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1 text-sm">
      {navItems.map((item: AdminNavItem) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex items-center justify-between rounded-xl px-3 py-2 transition",
              active
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

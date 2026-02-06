import type { ReactNode } from "react";
import Link from "next/link";
import clsx from "clsx";
import Container from "@/components/ui/container";
import NavLink from "@/components/ui/nav-link";
import { dirForLang, isSupportedLang } from "@/lib/i18n";

type NavItem = {
  label: string;
  href: string;
};

export default function LangLayout({
  children,
  params
}: {
  children: ReactNode;
  params: { lang: string };
}) {
  if (!isSupportedLang(params.lang)) {
    return <>{children}</>;
  }

  const direction = dirForLang(params.lang);
  const isArabic = params.lang === "ar";
  const otherLang = isArabic ? "en" : "ar";

  const navItems: NavItem[] = [
    { label: isArabic ? "الرئيسية" : "Home", href: `/${params.lang}/` },
    { label: isArabic ? "المحليات" : "Localities", href: `/${params.lang}/localities` },
    { label: isArabic ? "الأخبار" : "News", href: `/${params.lang}/news` },
    { label: isArabic ? "تحديثات الميدان" : "Updates", href: `/${params.lang}/updates` },
    { label: isArabic ? "المعرض" : "Media", href: `/${params.lang}/gallery` },
    { label: isArabic ? "المستندات" : "Downloads", href: `/${params.lang}/documents` },
    { label: isArabic ? "تبرع" : "Donate", href: `/${params.lang}/donate` },
    { label: isArabic ? "تواصل" : "Contact", href: `/${params.lang}/contact` }
  ];

  return (
    <div dir={direction} lang={params.lang} className={clsx("min-h-screen", isArabic && "font-arabic")}>
      <header className="border-b border-slate-200 bg-white">
        <Container className="flex flex-wrap items-center justify-between gap-4 py-4">
          <Link href={`/${params.lang}/`} className="text-lg font-semibold text-slate-900">
            ERR South Darfur
          </Link>
          <nav className="hidden flex-wrap items-center gap-1 md:flex">
            {navItems.map((item: NavItem) => (
              <NavLink key={item.href} href={item.href} label={item.label} />
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600"
              href={`/${otherLang}`}
            >
              {otherLang.toUpperCase()}
            </Link>
            <details className="md:hidden">
              <summary className="cursor-pointer rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                {isArabic ? "القائمة" : "Menu"}
              </summary>
              <div className="mt-2 grid gap-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
                {navItems.map((item: NavItem) => (
                  <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2 text-sm text-slate-700">
                    {item.label}
                  </Link>
                ))}
              </div>
            </details>
          </div>
        </Container>
      </header>

      <main>{children}</main>

      <footer className="mt-16 border-t border-slate-200 bg-white">
        <Container className="grid gap-6 py-10 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-semibold">ERR South Darfur</h3>
            <p className="mt-2 text-sm text-slate-600">
              {isArabic
                ? "استجابة مجتمعية سريعة وموثوقة لدعم المتأثرين في جنوب دارفور."
                : "A community-led rapid response network supporting people across South Darfur."}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">{isArabic ? "التواصل" : "Contact"}</h4>
            <p className="mt-2 text-sm text-slate-600">info@err-sd.org</p>
            <p className="text-sm text-slate-600">+249 000 000 000</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">{isArabic ? "تابعنا" : "Follow"}</h4>
            <div className="mt-2 flex gap-3 text-sm text-slate-600">
              <span>Facebook</span>
              <span>Twitter</span>
              <span>Telegram</span>
            </div>
          </div>
        </Container>
        <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} ERR South Darfur
        </div>
      </footer>
    </div>
  );
}

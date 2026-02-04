import Link from "next/link";
import { isSupportedLang, t, type Lang } from "@/lib/i18n";

export default function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  if (!isSupportedLang(params.lang)) return children;

  const lang = params.lang as Lang;
  const isAr = lang === "ar";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="container flex items-center justify-between py-4">
          <Link href={`/${lang}`} className="font-semibold">
            {isAr ? "غرف الطوارئ" : "ERR"}
          </Link>

          <nav className="flex items-center gap-4 text-sm">
            <Link className="hover:underline" href={`/${lang}/about`}>
              {t(lang, "About", "من نحن")}
            </Link>
            <Link className="hover:underline" href={`/${lang}/localities`}>
              {t(lang, "Localities", "المحليات")}
            </Link>
            <Link className="hover:underline" href={`/${lang}/news`}>
              {t(lang, "News", "الأخبار")}
            </Link>
          </nav>
        </div>
      </header>

      <main className="container py-10">{children}</main>

      <footer className="border-t bg-white">
        <div className="container py-6 text-sm text-slate-600">
          {t(lang, "© ERR South Darfur", "© غرف الطوارئ جنوب دارفور")}
        </div>
      </footer>
    </div>
  );
}

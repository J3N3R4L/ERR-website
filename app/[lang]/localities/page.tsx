import { prisma } from "@/lib/db";
import { isSupportedLang, t, type Lang } from "@/lib/i18n";
import Link from "next/link";

type LocalityListItem = {
  id: string;
  name_ar: string;
  name_en: string;
  slug: string;
  description_ar: string | null;
  description_en: string | null;
};

export default async function LocalitiesPage({ params }: { params: { lang: string } }) {
  if (!isSupportedLang(params.lang)) {
    return null;
  }

  const lang = params.lang as Lang;
  const localities = await prisma.locality.findMany({
    orderBy: { name_en: "asc" },
    select: {
      id: true,
      name_ar: true,
      name_en: true,
      slug: true,
      description_ar: true,
      description_en: true
    }
  });

  return (
    <main className="container py-12">
      <h1 className="text-3xl font-semibold">
        {t(lang, "Localities", "المحليات")}
      </h1>
      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        {localities.map((locality: LocalityListItem) => (
          <li key={locality.id} className="rounded border border-slate-200 p-4">
            <Link href={`/${lang}/localities/${locality.slug}`}>
              <h2 className="text-xl font-semibold">
                {lang === "ar" ? locality.name_ar : locality.name_en}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                {lang === "ar" ? locality.description_ar : locality.description_en}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

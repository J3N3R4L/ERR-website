import { prisma } from "@/lib/db";
import { isSupportedLang, t, type Lang } from "@/lib/i18n";
import Link from "next/link";
import Container from "@/components/ui/container";
import { Card, CardContent } from "@/components/ui/card";
import EmptyState from "@/components/ui/empty-state";

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
    <main className="py-12">
      <Container className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">{t(lang, "Localities", "المحليات")}</h1>
          <p className="mt-2 text-sm text-slate-600">
            {t(lang, "Explore the localities covered by ERR operations.", "استكشف المحليات التي تغطيها غرف الطوارئ.")}
          </p>
        </div>
        {localities.length === 0 ? (
          <EmptyState
            title={t(lang, "No localities yet", "لا توجد محليات بعد")}
            description={t(lang, "Locality details will appear here once added.", "ستظهر تفاصيل المحليات هنا عند إضافتها.")}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {localities.map((locality: LocalityListItem) => (
              <Card key={locality.id}>
                <CardContent>
                  <Link href={`/${lang}/localities/${locality.slug}`}>
                    <h2 className="text-xl font-semibold">
                      {lang === "ar" ? locality.name_ar : locality.name_en}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                      {lang === "ar" ? locality.description_ar : locality.description_en}
                    </p>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </main>
  );
}

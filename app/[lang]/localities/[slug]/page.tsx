import { prisma } from "@/lib/db";
import { isSupportedLang, t, type Lang } from "@/lib/i18n";
import { notFound } from "next/navigation";

type LocalityDetail = {
  name_ar: string;
  name_en: string;
  description_ar: string | null;
  description_en: string | null;
};

export default async function LocalityDetailPage({
  params
}: {
  params: { lang: string; slug: string };
}) {
  if (!isSupportedLang(params.lang)) {
    return null;
  }

  const locality = await prisma.locality.findUnique({
    where: { slug: params.slug },
    select: {
      name_ar: true,
      name_en: true,
      description_ar: true,
      description_en: true
    }
  });

  if (!locality) {
    notFound();
  }

  const lang = params.lang as Lang;
  const typedLocality = locality as LocalityDetail;

  return (
    <main className="container py-12 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">
          {lang === "ar" ? typedLocality.name_ar : typedLocality.name_en}
        </h1>
        <p className="mt-3 text-slate-700">
          {lang === "ar" ? typedLocality.description_ar : typedLocality.description_en}
        </p>
      </div>
      <div className="rounded border border-dashed border-slate-300 p-6 text-sm text-slate-500">
        {t(
          lang,
          "Locality hub sections (news, updates, documents, gallery) will appear here.",
          "ستظهر هنا أقسام الأخبار والتحديثات والمستندات والمعرض الخاصة بالمحلية." 
        )}
      </div>
    </main>
  );
}

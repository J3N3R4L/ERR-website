import { isSupportedLang, t, type Lang } from "@/lib/i18n";

export default function HomePage({ params }: { params: { lang: string } }) {
  if (!isSupportedLang(params.lang)) {
    return null;
  }

  const lang = params.lang as Lang;

  return (
    <main className="container py-12">
      <h1 className="text-3xl font-semibold">
        {t(lang, "South Darfur Emergency Response Rooms", "غرف طوارئ جنوب دارفور")}
      </h1>
      <p className="mt-4 text-lg text-slate-600">
        {t(
          lang,
          "Community-led rapid response for people in need.",
          "استجابة مجتمعية سريعة تقودها المجتمعات المحلية للمتأثرين." 
        )}
      </p>
    </main>
  );
}

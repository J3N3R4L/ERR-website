import Link from "next/link";
import Container from "@/components/ui/container";
import { Card, CardContent } from "@/components/ui/card";
import { buttonClasses } from "@/components/ui/button";
import { isSupportedLang, t, type Lang } from "@/lib/i18n";

type StatItem = {
  labelEn: string;
  labelAr: string;
  value: string;
};

export default function HomePage({ params }: { params: { lang: string } }) {
  if (!isSupportedLang(params.lang)) {
    return null;
  }

  const lang = params.lang as Lang;
  const stats: StatItem[] = [
    { labelEn: "Total Beneficiaries", labelAr: "إجمالي المستفيدين", value: "125k+" },
    { labelEn: "Interventions Delivered", labelAr: "التدخلات المنفذة", value: "320" },
    { labelEn: "Localities Covered", labelAr: "المحليات المغطاة", value: "8" },
    { labelEn: "Active Volunteers", labelAr: "المتطوعون النشطون", value: "540" }
  ];

  return (
    <main>
      <section className="bg-white">
        <Container className="grid items-center gap-10 py-16 md:grid-cols-2">
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
              {t(lang, "South Darfur Emergency Response Rooms", "غرف طوارئ جنوب دارفور")}
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
              {t(
                lang,
                "Community-led rapid response for people in need.",
                "استجابة مجتمعية سريعة لحماية الكرامة ودعم المجتمعات المحلية."
              )}
            </h1>
            <p className="text-base text-slate-600">
              {t(
                lang,
                "We work alongside communities across South Darfur to deliver life-saving support in emergencies.",
                "نعمل جنباً إلى جنب مع المجتمعات في جنوب دارفور لتقديم دعم منقذ للحياة في أوقات الطوارئ."
              )}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href={`/${lang}/donate`} className={buttonClasses({ variant: "primary" })}>
                {t(lang, "Donate", "تبرع")}
              </Link>
              <Link href={`/${lang}/contact`} className={buttonClasses({ variant: "secondary" })}>
                {t(lang, "Contact", "تواصل")}
              </Link>
            </div>
          </div>
          <Card className="overflow-hidden">
            <CardContent className="space-y-4">
              <p className="text-sm font-semibold text-slate-500">
                {t(lang, "Our focus areas", "مجالات العمل")}
              </p>
              <ul className="space-y-3 text-sm text-slate-700">
                <li>{t(lang, "WASH and health support", "المياه والصحة والإصحاح")}</li>
                <li>{t(lang, "Emergency relief and protection", "الدعم الإنساني والحماية")}</li>
                <li>{t(lang, "Community-led coordination", "التنسيق المجتمعي")}</li>
              </ul>
            </CardContent>
          </Card>
        </Container>
      </section>

      <section className="bg-slate-50">
        <Container className="grid gap-4 py-12 md:grid-cols-4">
          {stats.map((stat: StatItem) => (
            <Card key={stat.labelEn}>
              <CardContent>
                <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
                <p className="mt-2 text-sm text-slate-600">
                  {lang === "ar" ? stat.labelAr : stat.labelEn}
                </p>
              </CardContent>
            </Card>
          ))}
        </Container>
      </section>
    </main>
  );
}

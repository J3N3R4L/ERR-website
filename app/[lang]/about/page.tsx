import { isSupportedLang, t, type Lang } from "@/lib/i18n";

const aboutAr =
  "نحن غرف الطوارئ بولاية جنوب دارفور؛ شبكة استجابة مجتمعية تطوعية تشكّلت من أبناء وبنات المناطق لمواجهة آثار النزاعات والنزوح والطوارئ الصحية. نعمل وسط المجتمعات، وبالاستناد إلى احتياجاتها الفعلية، لتقديم تدخلات سريعة ومنقذة للحياة في مجالات المياه والإصحاح والنظافة، والدعم الصحي، والحماية، والدعم الإنساني العاجل.\n\nنؤمن أن الاستجابة الأقرب للناس هي الأكثر فاعلية، لذلك نعتمد على لجان الأحياء والقيادات المجتمعية والشباب والنساء في تحديد الأولويات، وتنفيذ التدخلات، ومتابعة الأثر. ونلتزم بالمبادئ الإنسانية: الإنسانية، الحياد، عدم التحيّز، والاستقلالية، مع الحرص على الشفافية والمساءلة أمام المجتمعات التي نخدمها.";

const aboutEn =
  "South Darfur Emergency Response Rooms (ERRs) are a community-led volunteer network formed by local residents to respond to the impacts of conflict, displacement, and public health emergencies. We work alongside communities—guided by their real needs—to deliver rapid, life-saving support across WASH, basic health services, protection, and emergency relief.\n\nWe believe the closest response to people is often the most effective. That’s why we co-design priorities with neighborhood committees, community leaders, youth, and women, and we follow humanitarian principles: humanity, neutrality, impartiality, and independence—supported by transparency and accountability to the communities we serve.";

const missionAr =
  "إنقاذ الأرواح وتخفيف المعاناة عبر استجابة مجتمعية سريعة ومنسّقة، ترتكز على الاحتياجات، وتحمي الكرامة، وتُعزز قدرة المجتمعات على الصمود والتعافي.";
const missionEn =
  "To save lives and reduce suffering through rapid, coordinated, needs-based community response that protects dignity and strengthens resilience and recovery.";

const principlesAr = [
  "الإنسانية أولاً",
  "الحياد وعدم التحيّز",
  "الاستقلالية",
  "المساءلة للمجتمع",
  "عدم الإضرار",
  "قيادة محلية",
  "حماية الفئات الأكثر هشاشة",
  "الشفافية والنزاهة"
];

const principlesEn = [
  "Humanity first",
  "Neutrality & impartiality",
  "Independence",
  "Accountability to communities",
  "Do no harm",
  "Local leadership",
  "Protection focus",
  "Transparency & integrity"
];

export default function AboutPage({ params }: { params: { lang: string } }) {
  if (!isSupportedLang(params.lang)) {
    return null;
  }

  const lang = params.lang as Lang;

  return (
    <main className="container py-12 space-y-10">
      <section>
        <h1 className="text-3xl font-semibold">{t(lang, "About", "من نحن")}</h1>
        <p className="mt-4 whitespace-pre-line text-slate-700">
          {t(lang, aboutEn, aboutAr)}
        </p>
      </section>
      <section>
        <h2 className="text-2xl font-semibold">{t(lang, "Mission", "الرسالة")}</h2>
        <p className="mt-3 text-slate-700">{t(lang, missionEn, missionAr)}</p>
      </section>
      <section>
        <h2 className="text-2xl font-semibold">{t(lang, "Principles", "المبادئ")}</h2>
        <ul className="mt-4 list-disc space-y-2 ps-5 text-slate-700">
          {(lang === "ar" ? principlesAr : principlesEn).map((item: string) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}

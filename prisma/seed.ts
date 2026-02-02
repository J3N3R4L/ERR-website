import { PrismaClient, Role, PostType, PostStatus, DonationMethodType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ---------- 1) Localities ----------
  const localitiesSeed = [
    { name_en: "Nyala North", name_ar: "نيالا شمال" },
    { name_en: "Nyala South", name_ar: "نيالا جنوب" },
    { name_en: "Belail", name_ar: "بليل" },
    { name_en: "Kass", name_ar: "كاس" },
    { name_en: "Tulus", name_ar: "تلس" },
    { name_en: "Ed El Fursan", name_ar: "عد الفرسان" },
    { name_en: "Buram", name_ar: "برام" },
    { name_en: "Kubum", name_ar: "كبم" },
  ];

  const slugify = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const localities = [];
  for (const l of localitiesSeed) {
    const loc = await prisma.locality.upsert({
      where: { slug: slugify(l.name_en) },
      update: {
        name_en: l.name_en,
        name_ar: l.name_ar,
      },
      create: {
        name_en: l.name_en,
        name_ar: l.name_ar,
        slug: slugify(l.name_en),
        description_en: `Community hub page for ${l.name_en}.`,
        description_ar: `صفحة محلية ${l.name_ar} وتحديثاتها من الميدان.`,
      },
    });
    localities.push(loc);
  }

  const kubum = localities.find((x) => x.slug === "kubum");
  if (!kubum) throw new Error("Kubum locality not found after seeding.");

  // ---------- 2) Users ----------
  // Use simple default passwords you can change later
  const superEmail = "superadmin@err.local";
  const localityEmail = "kubumadmin@err.local";
  const defaultPassword = "ChangeMe123!";

  const superHash = await bcrypt.hash(defaultPassword, 10);
  const locHash = await bcrypt.hash(defaultPassword, 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: superEmail },
    update: {
      role: Role.SUPER_ADMIN,
      is_active: true,
      password_hash: superHash,
    },
    create: {
      email: superEmail,
      password_hash: superHash,
      role: Role.SUPER_ADMIN,
      is_active: true,
    },
  });

  const kubumAdmin = await prisma.user.upsert({
    where: { email: localityEmail },
    update: {
      role: Role.LOCALITY_ADMIN,
      is_active: true,
      password_hash: locHash,
    },
    create: {
      email: localityEmail,
      password_hash: locHash,
      role: Role.LOCALITY_ADMIN,
      is_active: true,
    },
  });

  // ---------- 3) Locality access for Kubum admin ----------
  await prisma.userLocalityAccess.upsert({
    where: {
      user_id_locality_id: {
        user_id: kubumAdmin.id,
        locality_id: kubum.id,
      },
    },
    update: {},
    create: {
      user_id: kubumAdmin.id,
      locality_id: kubum.id,
    },
  });

  // ---------- 4) Donation methods ----------
  await prisma.donationMethod.upsert({
    where: { id: "bank-of-khartoum" },
    update: {
      method_type: DonationMethodType.BANK,
      title_en: "Bank of Khartoum",
      title_ar: "بنك الخرطوم",
      details_en: "Account details go here (add from Admin).",
      details_ar: "تفاصيل الحساب تُضاف هنا (عبر لوحة التحكم).",
      is_active: true,
      sort_order: 1,
    },
    create: {
      id: "bank-of-khartoum",
      method_type: DonationMethodType.BANK,
      title_en: "Bank of Khartoum",
      title_ar: "بنك الخرطوم",
      details_en: "Account details go here (add from Admin).",
      details_ar: "تفاصيل الحساب تُضاف هنا (عبر لوحة التحكم).",
      is_active: true,
      sort_order: 1,
    },
  });

  await prisma.donationMethod.upsert({
    where: { id: "mycashi" },
    update: {
      method_type: DonationMethodType.MOBILE_MONEY,
      title_en: "MyCashi",
      title_ar: "ماي كاشي",
      details_en: "Wallet/number details go here (add from Admin).",
      details_ar: "تفاصيل المحفظة/الرقم تُضاف هنا (عبر لوحة التحكم).",
      is_active: true,
      sort_order: 2,
    },
    create: {
      id: "mycashi",
      method_type: DonationMethodType.MOBILE_MONEY,
      title_en: "MyCashi",
      title_ar: "ماي كاشي",
      details_en: "Wallet/number details go here (add from Admin).",
      details_ar: "تفاصيل المحفظة/الرقم تُضاف هنا (عبر لوحة التحكم).",
      is_active: true,
      sort_order: 2,
    },
  });

  // ---------- 5) Site settings ----------
  const stats_json = [
    {
      key: "beneficiaries_total",
      label_ar: "إجمالي المستفيدين",
      label_en: "Total Beneficiaries",
      value: 0,
      suffix_ar: "+",
      suffix_en: "+",
    },
    {
      key: "interventions_total",
      label_ar: "التدخلات المنفذة",
      label_en: "Interventions Delivered",
      value: 0,
      suffix_ar: "",
      suffix_en: "",
    },
    {
      key: "localities_covered",
      label_ar: "المحليات المغطاة",
      label_en: "Localities Covered",
      value: 8,
      suffix_ar: "",
      suffix_en: "",
    },
    {
      key: "active_volunteers",
      label_ar: "المتطوعون/ات النشطون",
      label_en: "Active Volunteers",
      value: 0,
      suffix_ar: "+",
      suffix_en: "+",
    },
  ];

  // if you already have one settings row, just update it
  const existing = await prisma.siteSettings.findFirst();
  if (existing) {
    await prisma.siteSettings.update({
      where: { id: existing.id },
      data: {
        site_name_ar: "غرف الطوارئ - جنوب دارفور",
        site_name_en: "South Darfur Emergency Response Rooms",
        hero_text_ar: "لأن المجتمع هو خط الاستجابة الأول.",
        hero_text_en: "Because the community is the first responder.",
        stats_json,
      },
    });
  } else {
    await prisma.siteSettings.create({
      data: {
        site_name_ar: "غرف الطوارئ - جنوب دارفور",
        site_name_en: "South Darfur Emergency Response Rooms",
        hero_text_ar: "لأن المجتمع هو خط الاستجابة الأول.",
        hero_text_en: "Because the community is the first responder.",
        stats_json,
        socials: {
          facebook: "",
          telegram: "",
          whatsapp: "",
        },
      },
    });
  }

  // ---------- 6) Sample posts ----------
  const mkSlug = (prefix: string) => `${prefix}-${Date.now()}`;

  // 2 NEWS
  await prisma.post.createMany({
    data: [
      {
        type: PostType.NEWS,
        title_ar: "تحديث: تنسيق مجتمعي للاستجابة العاجلة",
        title_en: "Update: Community coordination for urgent response",
        slug: mkSlug("news-1"),
        excerpt_ar: "ملخص قصير للخبر.",
        excerpt_en: "Short news summary.",
        body_ar: "هذا نموذج خبر باللغة العربية يمكن تعديله لاحقاً عبر لوحة التحكم.",
        body_en: "This is a sample English news post editable later in Admin.",
        locality_id: kubum.id, // sample tied to Kubum
        status: PostStatus.PUBLISHED,
        published_at: new Date(),
        created_by: superAdmin.id,
      },
      {
        type: PostType.NEWS,
        title_ar: "إطلاق قسم تحديثات من الميدان",
        title_en: "Launching Field Updates section",
        slug: mkSlug("news-2"),
        excerpt_ar: "نبدأ اليوم نشر تحديثات منظمة من الميدان.",
        excerpt_en: "We are starting structured field updates.",
        body_ar: "هذا نموذج خبر ثاني. سيظهر في قسم الأخبار.",
        body_en: "This is a second sample news post. It appears in News.",
        locality_id: null, // global news allowed
        status: PostStatus.PUBLISHED,
        published_at: new Date(),
        created_by: superAdmin.id,
      },
    ],
    skipDuplicates: true,
  });

  // 2 FIELD UPDATES (structured story)
  await prisma.post.createMany({
    data: [
      {
        type: PostType.FIELD_UPDATE,
        title_ar: "تحديث من الميدان: استعادة إمداد المياه",
        title_en: "Field Update: Restoring water supply",
        slug: mkSlug("update-1"),
        excerpt_ar: "قصة تدخل سريع يقوده المجتمع.",
        excerpt_en: "A community-led rapid response story.",
        context_ar:
          "واجهت الأسر في المنطقة نقصاً حاداً في مياه الشرب بسبب تعطل مصدر الإمداد الرئيسي، مما زاد الأعباء على النساء والأطفال.",
        context_en:
          "Families faced a severe shortage of safe water after the main supply point broke down, increasing the burden on women and children.",
        action_ar:
          "نفذت غرفة الطوارئ بالمحلية تدخلاً عاجلاً شمل صيانة المصدر وتشغيله بالتنسيق مع المجتمع المحلي.",
        action_en:
          "The locality ERR carried out an urgent intervention to repair the system and restore service in coordination with the community.",
        results_ar:
          "استفادت أكثر من 300 أسرة من عودة الإمداد، مع تقليل الاعتماد على مصادر غير آمنة.",
        results_en:
          "Over 300 households regained access to water, reducing reliance on unsafe sources.",
        next_steps_ar:
          "لا تزال هناك حاجة لدعم الصيانة الدورية وتوفير قطع الغيار لضمان الاستدامة.",
        next_steps_en:
          "Additional support is needed for routine maintenance and spare parts to sustain the service.",
        urgent_need: false,
        locality_id: kubum.id,
        status: PostStatus.PUBLISHED,
        published_at: new Date(),
        created_by: superAdmin.id,
      },
      {
        type: PostType.FIELD_UPDATE,
        title_ar: "تحديث من الميدان: تحسين خدمات الإصحاح",
        title_en: "Field Update: Improving sanitation services",
        slug: mkSlug("update-2"),
        excerpt_ar: "تدخل صحي يعزز الكرامة والخصوصية.",
        excerpt_en: "A WASH action that restores dignity and privacy.",
        context_ar:
          "عانت المرافق الصحية من تدهور أثر على الخصوصية والسلامة، خاصة للنساء والفتيات.",
        context_en:
          "Sanitation facilities deteriorated, affecting privacy and safety—especially for women and girls.",
        action_ar:
          "تم تنفيذ أعمال صيانة وتنظيف وتوفير مياه تشغيل بالتنسيق مع لجان المجتمع.",
        action_en:
          "Repair, cleaning, and water provisioning were delivered in coordination with community committees.",
        results_ar:
          "تحسن الاستخدام الآمن للمرافق وانخفضت المخاطر الصحية المرتبطة بالإصحاح.",
        results_en:
          "Safe usage improved and WASH-related health risks decreased.",
        next_steps_ar:
          "نحتاج إلى دعم لاستكمال الشبكات الداخلية والصيانة الوقائية لضمان الاستمرارية.",
        next_steps_en:
          "Support is needed to complete internal connections and preventive maintenance for continuity.",
        urgent_need: true,
        locality_id: kubum.id,
        status: PostStatus.PUBLISHED,
        published_at: new Date(),
        created_by: superAdmin.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seed completed successfully.");
  console.log("SUPER_ADMIN:", superEmail, "password:", defaultPassword);
  console.log("KUBUM LOCALITY_ADMIN:", localityEmail, "password:", defaultPassword);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


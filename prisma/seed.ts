import { PrismaClient, Role, PostStatus, PostType, DonationMethodType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const localities = [
  { name_en: "Nyala North", name_ar: "نيالا شمال", slug: "nyala-north" },
  { name_en: "Nyala South", name_ar: "نيالا جنوب", slug: "nyala-south" },
  { name_en: "Belail", name_ar: "بليل", slug: "belail" },
  { name_en: "Kass", name_ar: "كاس", slug: "kass" },
  { name_en: "Tulus", name_ar: "تلس", slug: "tulus" },
  { name_en: "Ed El Fursan", name_ar: "عد الفرسان", slug: "ed-el-fursan" },
  { name_en: "Buram", name_ar: "برام", slug: "buram" },
  { name_en: "Kubum", name_ar: "كبم", slug: "kubum" }
];

async function main() {
  await prisma.userLocalityAccess.deleteMany();
  await prisma.post.deleteMany();
  await prisma.document.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.donationMethod.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.siteSettings.deleteMany();
  await prisma.contactSubmission.deleteMany();
  await prisma.locality.deleteMany();
  await prisma.user.deleteMany();

  await prisma.locality.createMany({
    data: localities.map((locality) => ({
      ...locality,
      description_en: `Coverage area for ${locality.name_en}.`,
      description_ar: `نطاق التغطية لمحلية ${locality.name_ar}.`
    })),
    skipDuplicates: true
  });

  const superAdminPassword = process.env.SEED_SUPER_ADMIN_PASSWORD || "ChangeMe123!";
  const localityAdminPassword = process.env.SEED_LOCALITY_ADMIN_PASSWORD || "ChangeMe123!";

  const superAdmin = await prisma.user.create({
    data: {
      email: "superadmin@err.local",
      password_hash: await bcrypt.hash(superAdminPassword, 12),
      role: Role.SUPER_ADMIN,
      is_active: true
    }
  });

  const localityAdmin = await prisma.user.create({
    data: {
      email: "kubum.admin@err.local",
      password_hash: await bcrypt.hash(localityAdminPassword, 12),
      role: Role.LOCALITY_ADMIN,
      is_active: true
    }
  });

  const kubum = await prisma.locality.findUnique({ where: { slug: "kubum" } });
  if (kubum) {
    await prisma.userLocalityAccess.create({
      data: {
        user_id: localityAdmin.id,
        locality_id: kubum.id
      }
    });
  }

  await prisma.donationMethod.createMany({
    data: [
      {
        method_type: DonationMethodType.BANK,
        title_en: "Bank of Khartoum",
        title_ar: "بنك الخرطوم",
        details_en: "Account name: South Darfur ERRs. Account: 123456789.",
        details_ar: "اسم الحساب: غرف طوارئ جنوب دارفور. الرقم: 123456789.",
        sort_order: 1
      },
      {
        method_type: DonationMethodType.MOBILE_MONEY,
        title_en: "MyCashi",
        title_ar: "ماي كاشي",
        details_en: "Wallet: 249900000000. Name: ERR South Darfur.",
        details_ar: "المحفظة: 249900000000. الاسم: غرف طوارئ جنوب دارفور.",
        sort_order: 2
      }
    ]
  });

  await prisma.siteSettings.create({
    data: {
      site_name_en: "South Darfur Emergency Response Rooms",
      site_name_ar: "غرف طوارئ جنوب دارفور",
      hero_text_en: "Community-led rapid response for emergencies.",
      hero_text_ar: "استجابة مجتمعية سريعة للطوارئ.",
      stats_json: {
        total_beneficiaries: 125000,
        interventions_delivered: 320,
        localities_covered: 8,
        active_volunteers: 540
      }
    }
  });

  await prisma.post.createMany({
    data: [
      {
        type: PostType.NEWS,
        title_en: "Rapid WASH response in Nyala North",
        title_ar: "استجابة عاجلة للمياه في نيالا شمال",
        slug: "wash-response-nyala-north",
        excerpt_en: "Community teams repaired water points and delivered hygiene kits.",
        excerpt_ar: "فرق مجتمعية أصلحت نقاط المياه ووزعت حقائب النظافة.",
        body_en: "ERR volunteers restored access to safe water for 3,000 families.",
        body_ar: "أعاد المتطوعون الوصول إلى المياه الآمنة لثلاثة آلاف أسرة.",
        locality_id: kubum?.id ?? null,
        status: PostStatus.PUBLISHED,
        published_at: new Date(),
        created_by: superAdmin.id
      },
      {
        type: PostType.NEWS,
        title_en: "Health outreach in Kass locality",
        title_ar: "حملة صحية في محلية كاس",
        slug: "health-outreach-kass",
        excerpt_en: "Mobile clinics supported displaced families with primary care.",
        excerpt_ar: "عيادات متنقلة دعمت الأسر النازحة بالرعاية الأولية.",
        body_en: "Local teams delivered consultations and essential medicines.",
        body_ar: "قدمت الفرق المحلية الاستشارات والأدوية الأساسية.",
        locality_id: null,
        status: PostStatus.PUBLISHED,
        published_at: new Date(),
        created_by: superAdmin.id
      },
      {
        type: PostType.FIELD_UPDATE,
        title_en: "Emergency shelter support in Kubum",
        title_ar: "دعم المأوى الطارئ في كبم",
        slug: "shelter-kubum",
        excerpt_en: "Temporary shelter materials provided to newly displaced families.",
        excerpt_ar: "توفير مواد مأوى مؤقت للأسر النازحة حديثاً.",
        context_en: "Recent displacement left families without safe shelter.",
        context_ar: "تسبب النزوح الأخير في فقدان الأسر للمأوى الآمن.",
        action_en: "We distributed shelter kits and coordinated with local leaders.",
        action_ar: "قمنا بتوزيع حقائب المأوى والتنسيق مع القيادات المحلية.",
        results_en: "240 households received shelter kits and blankets.",
        results_ar: "استفادت 240 أسرة من حقائب المأوى والبطانيات.",
        next_steps_en: "We need additional tarpaulins and tools for 150 families.",
        next_steps_ar: "نحتاج إلى مزيد من المشمعات والأدوات لـ 150 أسرة.",
        urgent_need: true,
        locality_id: kubum?.id ?? null,
        status: PostStatus.PUBLISHED,
        published_at: new Date(),
        created_by: superAdmin.id
      },
      {
        type: PostType.FIELD_UPDATE,
        title_en: "Food distribution in Tulus",
        title_ar: "توزيع غذائي في تلس",
        slug: "food-distribution-tulus",
        excerpt_en: "Emergency food parcels delivered with community committees.",
        excerpt_ar: "توزيع سلال غذائية طارئة بالتنسيق مع اللجان المجتمعية.",
        context_en: "Rising food insecurity impacted families in Tulus.",
        context_ar: "تفاقم انعدام الأمن الغذائي أثر على الأسر في تلس.",
        action_en: "We coordinated volunteers and delivered food parcels.",
        action_ar: "نسقنا المتطوعين وسلّمنا السلال الغذائية.",
        results_en: "500 households received two-week food support.",
        results_ar: "استفادت 500 أسرة من دعم غذائي لمدة أسبوعين.",
        next_steps_en: "We plan to expand coverage to remote villages.",
        next_steps_ar: "نخطط لتوسيع التغطية للقرى النائية.",
        urgent_need: false,
        locality_id: null,
        status: PostStatus.PUBLISHED,
        published_at: new Date(),
        created_by: superAdmin.id
      }
    ]
  });

  console.log("Seed completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

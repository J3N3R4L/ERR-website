import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ---- 1) SUPER ADMIN (change email/password) ----
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";

  const password_hash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password_hash,
      role: "SUPER_ADMIN",
      is_active: true,
    },
    create: {
      email: adminEmail,
      password_hash,
      role: "SUPER_ADMIN",
      is_active: true,
    },
    select: { id: true, email: true, role: true },
  });

  // ---- 2) Default localities (you can edit / expand) ----
  const defaultLocalities = [
    { slug: "eastern-nyala", name_en: "Eastern Nyala", name_ar: "نيالا شرق" },
    { slug: "southern-nyala", name_en: "Southern Nyala", name_ar: "نيالا جنوب" },
    { slug: "kabum", name_en: "Kabum", name_ar: "كبم" },
    { slug: "ed-el-fursan", name_en: "Ed El Fursan", name_ar: "عد الفرسان" },
    { slug: "kas", name_en: "Kas", name_ar: "كاس" },
    { slug: "belail", name_en: "Belail", name_ar: "بليل" },
    { slug: "buram", name_en: "Buram", name_ar: "برام" },
    { slug: "tulus", name_en: "Tulus", name_ar: "تلس" },
  ];

  for (const loc of defaultLocalities) {
    await prisma.locality.upsert({
      where: { slug: loc.slug },
      update: { name_en: loc.name_en, name_ar: loc.name_ar },
      create: {
        slug: loc.slug,
        name_en: loc.name_en,
        name_ar: loc.name_ar,
      },
    });
  }

  // ---- 3) Site settings (minimal) ----
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      site_name_en: "South Darfur Emergency Response Rooms",
      site_name_ar: "غرف الطوارئ – ولاية جنوب دارفور",
      hero_text_en:
        "Community-led humanitarian response to reduce suffering, protect dignity, and save lives.",
      hero_text_ar:
        "استجابة إنسانية مجتمعية لخفض المعاناة وحماية الكرامة وإنقاذ الأرواح.",
      stats_json: {
        beneficiaries: 0,
        interventions: 0,
        localities_covered: 0,
        volunteers: 0,
      },
    },
  });

  // ---- 4) Donation methods (Bank of Khartoum + MyCashi) ----
  const donationMethods = [
    {
      method_type: "BANK",
      title_en: "Bank of Khartoum",
      title_ar: "بنك الخرطوم",
      details_en: "Account Name: (Add later)\nAccount Number: (Add later)\nBranch: (Add later)",
      details_ar: "اسم الحساب: (يضاف لاحقاً)\nرقم الحساب: (يضاف لاحقاً)\nالفرع: (يضاف لاحقاً)",
      sort_order: 1,
    },
    {
      method_type: "MOBILE_MONEY",
      title_en: "MyCashi Mobile Money",
      title_ar: "ماي كاشي",
      details_en: "Wallet Name: (Add later)\nWallet Number: (Add later)",
      details_ar: "اسم المحفظة: (يضاف لاحقاً)\nرقم المحفظة: (يضاف لاحقاً)",
      sort_order: 2,
    },
  ];

  for (const m of donationMethods) {
    await prisma.donationMethod.upsert({
      where: {
        // no unique constraint in schema, so we use a manual lookup then create/update
        // We'll update by matching title_en + method_type
        // (If you add a unique key later, simplify this)
        id: (await prisma.donationMethod.findFirst({
          where: { title_en: m.title_en, method_type: m.method_type as any },
          select: { id: true },
        }))?.id || "___new___",
      },
      update: {
        method_type: m.method_type as any,
        title_en: m.title_en,
        title_ar: m.title_ar,
        details_en: m.details_en,
        details_ar: m.details_ar,
        is_active: true,
        sort_order: m.sort_order,
      },
      create: {
        method_type: m.method_type as any,
        title_en: m.title_en,
        title_ar: m.title_ar,
        details_en: m.details_en,
        details_ar: m.details_ar,
        is_active: true,
        sort_order: m.sort_order,
      },
    }).catch(async () => {
      // Fallback: if upsert where id fails due to "___new___", just create
      await prisma.donationMethod.create({
        data: {
          method_type: m.method_type as any,
          title_en: m.title_en,
          title_ar: m.title_ar,
          details_en: m.details_en,
          details_ar: m.details_ar,
          is_active: true,
          sort_order: m.sort_order,
        },
      });
    });
  }

  // ---- 5) Seed one sample NEWS post (optional) ----
  const sample = await prisma.post.findFirst({
    where: { slug: "welcome" },
    select: { id: true },
  });

  if (!sample) {
    await prisma.post.create({
      data: {
        type: "NEWS" as any,
        title_en: "Welcome",
        title_ar: "مرحباً",
        slug: "welcome",
        excerpt_en: "First news post (seed).",
        excerpt_ar: "أول خبر (تجريبي).",
        body_en: "This is a seeded post to verify the website flow.",
        body_ar: "هذا منشور تجريبي للتأكد من عمل الموقع.",
        status: "PUBLISHED" as any,
        published_at: new Date(),
        created_by: admin.id,
      },
    });
  }

  console.log("✅ Seed completed.");
  console.log(`✅ Admin: ${admin.email} (${admin.role})`);
  console.log("ℹ️ Tip: set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in your .env");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

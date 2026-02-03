import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function PublicLocalitiesPage({
  params,
}: {
  params: { lang: "ar" | "en" };
}) {
  const lang = params.lang;
  const isAr = lang === "ar";

  // Strong typing via select (prevents implicit any)
  const localities = await prisma.locality.findMany({
    orderBy: { name_en: "asc" },
    select: { id: true, slug: true, name_ar: true, name_en: true, description_ar: true, description_en: true },
  });

  return (
    <main className="container py-10">
      <h1 className="text-2xl font-semibold">
        {isAr ? "المحليات" : "Localities"}
      </h1>

      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        {localities.map(
  (locality: {
    id: string;
    slug: string;
    name_ar?: string | null;
    name_en?: string | null;
    description_ar?: string | null;
    description_en?: string | null;
  }) => (
    <li key={locality.id} className="rounded border border-slate-200 p-4">
      <Link href={`/${lang}/localities/${locality.slug}`}>
        <h2 className="text-xl font-semibold">
          {isAr ? locality.name_ar : locality.name_en}
        </h2>
        <p className="mt-2 text-slate-600">
          {isAr ? locality.description_ar || "" : locality.description_en || ""}
        </p>
      </Link>
    </li>
  )
)}

      </ul>
    </main>
  );
}

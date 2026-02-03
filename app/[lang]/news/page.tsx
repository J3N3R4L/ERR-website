import Link from "next/link";
import { prisma } from "@/lib/db";
import { isSupportedLang, t, type Lang } from "@/lib/i18n";

export default async function NewsListPage({ params }: { params: { lang: string } }) {
  if (!isSupportedLang(params.lang)) {
    return null;
  }

  const lang = params.lang as Lang;
  const posts = await prisma.post.findMany({
    where: {
      type: "NEWS",
      status: "PUBLISHED"
    },
    orderBy: { published_at: "desc" }
  });

  return (
    <main className="container py-12 space-y-6">
      <h1 className="text-3xl font-semibold">{t(lang, "News", "الأخبار")}</h1>
      <div className="grid gap-4">
        {posts.map((post) => (
          <article key={post.id} className="rounded border border-slate-200 p-4">
            <h2 className="text-xl font-semibold">
              <Link href={`/${lang}/news/${post.slug}`}>{lang === "ar" ? post.title_ar : post.title_en}</Link>
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {lang === "ar" ? post.excerpt_ar : post.excerpt_en}
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}

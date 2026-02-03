import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { isSupportedLang, type Lang } from "@/lib/i18n";

export default async function NewsDetailPage({
  params
}: {
  params: { lang: string; slug: string };
}) {
  if (!isSupportedLang(params.lang)) {
    return null;
  }

  const post = await prisma.post.findUnique({
    where: { slug: params.slug }
  });

  if (!post || post.type !== "NEWS" || post.status !== "PUBLISHED") {
    notFound();
  }

  const lang = params.lang as Lang;

  return (
    <main className="container py-12 space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">
          {lang === "ar" ? post.title_ar : post.title_en}
        </h1>
        {post.excerpt_en && (
          <p className="mt-3 text-slate-600">
            {lang === "ar" ? post.excerpt_ar : post.excerpt_en}
          </p>
        )}
      </header>
      <article className="prose max-w-none">
        <p>{lang === "ar" ? post.body_ar : post.body_en}</p>
      </article>
    </main>
  );
}

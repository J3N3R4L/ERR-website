import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { isSupportedLang, type Lang } from "@/lib/i18n";

type NewsRow = {
  title_en: string;
  title_ar: string;
  excerpt_en: string | null;
  excerpt_ar: string | null;
  body_en: string | null;
  body_ar: string | null;
  type: string;
  status: string;
};

export default async function NewsDetailPage({
  params,
}: {
  params: { lang: string; slug: string };
}) {
  if (!isSupportedLang(params.lang)) return null;

  const post: NewsRow | null = await prisma.post.findUnique({
    where: { slug: params.slug },
    select: {
      title_en: true,
      title_ar: true,
      excerpt_en: true,
      excerpt_ar: true,
      body_en: true,
      body_ar: true,
      type: true,
      status: true,
    },
  });

  if (!post || post.type !== "NEWS" || post.status !== "PUBLISHED") notFound();

  const lang = params.lang as Lang;
  const title = lang === "ar" ? post.title_ar : post.title_en;
  const excerpt = lang === "ar" ? post.excerpt_ar : post.excerpt_en;
  const body = lang === "ar" ? post.body_ar : post.body_en;

  return (
    <main className="container py-12 space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">{title}</h1>
        {excerpt ? <p className="mt-3 text-slate-600">{excerpt}</p> : null}
      </header>

      <article className="prose max-w-none">
        <p>{body ?? ""}</p>
      </article>
    </main>
  );
}

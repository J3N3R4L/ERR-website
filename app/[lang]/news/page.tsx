import Link from "next/link";
import { prisma } from "@/lib/db";
import { isSupportedLang, t, type Lang } from "@/lib/i18n";
import Container from "@/components/ui/container";
import { Card, CardContent } from "@/components/ui/card";
import EmptyState from "@/components/ui/empty-state";

type NewsListItem = {
  id: string;
  slug: string;
  title_en: string;
  title_ar: string;
  excerpt_en: string | null;
  excerpt_ar: string | null;
};

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
    select: {
      id: true,
      slug: true,
      title_en: true,
      title_ar: true,
      excerpt_en: true,
      excerpt_ar: true
    },
    orderBy: { published_at: "desc" }
  });

  return (
    <main className="py-12">
      <Container className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">{t(lang, "News", "الأخبار")}</h1>
          <p className="mt-2 text-sm text-slate-600">
            {t(lang, "Latest news and updates from ERR teams.", "آخر الأخبار والتحديثات من فرق غرف الطوارئ.")}
          </p>
        </div>
        {posts.length === 0 ? (
          <EmptyState
            title={t(lang, "No news yet", "لا توجد أخبار بعد")}
            description={t(lang, "Published news will appear here.", "ستظهر الأخبار المنشورة هنا.")}
          />
        ) : (
          <div className="grid gap-4">
            {posts.map((post: NewsListItem) => (
              <Card key={post.id}>
                <CardContent>
                  <h2 className="text-xl font-semibold">
                    <Link href={`/${lang}/news/${post.slug}`}>
                      {lang === "ar" ? post.title_ar : post.title_en}
                    </Link>
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    {lang === "ar" ? post.excerpt_ar : post.excerpt_en}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </main>
  );
}

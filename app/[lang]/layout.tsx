import type { ReactNode } from "react";
import { dirForLang, isSupportedLang } from "@/lib/i18n";

export default function LangLayout({
  children,
  params
}: {
  children: ReactNode;
  params: { lang: string };
}) {
  if (!isSupportedLang(params.lang)) {
    return <>{children}</>;
  }

  const direction = dirForLang(params.lang);

  return (
    <div dir={direction} lang={params.lang} className="min-h-screen">
      {children}
    </div>
  );
}

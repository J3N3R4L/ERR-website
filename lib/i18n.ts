export type Lang = "en" | "ar";

export const supportedLangs: Lang[] = ["en", "ar"];

export const isSupportedLang = (lang: string): lang is Lang =>
  supportedLangs.includes(lang as Lang);

export const dirForLang = (lang: string) => (lang === "ar" ? "rtl" : "ltr");

export const t = (lang: Lang, en: string, ar: string) => (lang === "ar" ? ar : en);

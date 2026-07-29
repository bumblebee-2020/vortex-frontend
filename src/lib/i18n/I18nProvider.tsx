"use client";

import { createContext, useContext, useMemo } from "react";
import { createTranslator, DEFAULT_LOCALE, type Locale, type Translator } from "./index";

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

/**
 * Returns the translator for the active locale. Components render in
 * DEFAULT_LOCALE when no I18nProvider is mounted above them.
 */
export function useTranslation(): { t: Translator; locale: Locale } {
  const locale = useLocale();
  const t = useMemo(() => createTranslator(locale), [locale]);
  return { t, locale };
}

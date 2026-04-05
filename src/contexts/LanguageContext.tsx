import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import en from "@/i18n/en.json";
import ka from "@/i18n/ka.json";
import ru from "@/i18n/ru.json";

export type Language = "en" | "ka" | "ru";

const dictionaries: Record<Language, Record<string, any>> = { en, ka, ru };

export const languageNames: Record<Language, string> = {
  en: "EN",
  ka: "KA",
  ru: "RU",
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const getNestedValue = (obj: any, path: string): string => {
  const val = path.split(".").reduce((acc, part) => acc?.[part], obj);
  return typeof val === "string" ? val : path;
};

const getStoredLanguage = (): Language => {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem("preferred-language");
  return stored === "ka" || stored === "ru" ? stored : "en";
};

const fallbackLanguageContext: LanguageContextType = {
  language: getStoredLanguage(),
  setLanguage: () => undefined,
  t: (key: string) => getNestedValue(dictionaries.en, key),
};

const LanguageContext = createContext<LanguageContextType>(fallbackLanguageContext);

export const getLocalizedField = <T extends Record<string, any>>(
  item: T,
  field: string,
  lang: Language
): string => {
  if (lang === "en") return (item[field] as string) || "";
  const localized = item[`${field}_${lang}`] as string | null | undefined;
  return localized || (item[field] as string) || "";
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLang] = useState<Language>(getStoredLanguage);

  const setLanguage = useCallback((lang: Language) => {
    setLang(lang);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("preferred-language", lang);
    }
  }, []);

  const t = useCallback(
    (key: string) => getNestedValue(dictionaries[language], key) || getNestedValue(dictionaries.en, key),
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

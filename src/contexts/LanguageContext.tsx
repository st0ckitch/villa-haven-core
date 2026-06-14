import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import en from "@/i18n/en.json";
import ka from "@/i18n/ka.json";
import ru from "@/i18n/ru.json";

export type Language = "en" | "ka" | "ru";

const dictionaries: Record<Language, Record<string, any>> = { en, ka, ru };

export const languageNames: Record<Language, string> = {
  en: "Eng",
  ka: "ქარ",
  ru: "Рус",
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
  if (typeof window === "undefined") return "ka";
  const stored = window.localStorage.getItem("preferred-language");
  return stored === "en" || stored === "ru" ? stored : "ka";
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
  const localized = item[`${field}_${lang}`] as string | null | undefined;
  return localized || (item[field] as string) || "";
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLang] = useState<Language>(getStoredLanguage);

  // Keep <html lang> in sync with the active language. index.html ships a
  // hard-coded lang="en", so Georgian/Russian content was mislabelled as
  // English — browsers use `lang` for font selection and text shaping, so on
  // devices where FiraGO isn't applied this picked the wrong fallback font
  // for Georgian and rendered it with uneven baselines ("zigzag"). Setting
  // the correct lang makes the system fall back to a proper Georgian/Cyrillic
  // font and shape the script correctly. (Client 2026-06-14.)
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
    }
  }, [language]);

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

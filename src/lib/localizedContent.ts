/**
 * Resolve localized CMS content with a three-tier fallback.
 *
 * Priority order:
 *   1. Language-specific key:  `<key>_<lang>`  (e.g. `polograph_title_ka`)
 *   2. Language-neutral key:   `<key>`         (e.g. `polograph_title`)
 *   3. i18n default from translations (passed in as `fallback`)
 *
 * This lets the admin optionally override text per language via new
 * site_settings rows, while Georgian / English / Russian visitors always
 * see something in their language even when the CMS hasn't been populated.
 *
 * Example:
 *   const titleText = getLocalizedContent(
 *     "polograph_title",
 *     language,           // "ka" | "en" | "ru" from useLanguage()
 *     content,            // Record<string, string> fetched from site_settings
 *     t("polograph.titleDefault")
 *   );
 */

type LanguageCode = string;

export const getLocalizedContent = (
  key: string,
  language: LanguageCode,
  content: Record<string, string | undefined>,
  fallback: string
): string => {
  const localized = content[`${key}_${language}`];
  if (localized && localized.trim().length > 0) return localized;

  const generic = content[key];
  if (generic && generic.trim().length > 0) return generic;

  return fallback;
};

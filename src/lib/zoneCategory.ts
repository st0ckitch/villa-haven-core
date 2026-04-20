/**
 * Map a plot zone name (e.g. "A-12", "B-03", "C-24") to its project category label.
 * Used in the plot popup and villa detail page when arriving via ?plot= param.
 *
 * - Names starting with "A" → "პოლოგრაფი 1"
 * - Names starting with "B" → "პოლოგრაფი 2"
 * - Names starting with "C" → "პოლოგრაფი 3"
 * - Anything else → returns the raw name (graceful fallback)
 */
export const getZoneCategory = (name: string | null | undefined): string => {
  if (!name) return "";
  const first = name.trim().charAt(0).toUpperCase();
  switch (first) {
    case "A":
      return "პოლოგრაფი 1";
    case "B":
      return "პოლოგრაფი 2";
    case "C":
      return "პოლოგრაფი 3";
    default:
      return name;
  }
};

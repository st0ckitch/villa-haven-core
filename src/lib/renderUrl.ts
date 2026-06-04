/**
 * Normalize bundled render URLs to their real file extension.
 *
 * The app ships its project renders under `public/renders/**` and those files
 * are ALL `.jpg`. A handful of `project_renders` DB rows were seeded with the
 * wrong extension (`.jpeg` / `.png`), so those images 404'd and showed a
 * broken tile (e.g. Olimpo "render-3", Polograph lake/business-center).
 *
 * Rather than wait on a DB data-fix, we correct the extension at read time.
 * Only local `/renders/` paths are touched — user uploads (absolute Supabase
 * Storage URLs) are returned unchanged.
 */
export const normalizeRenderUrl = (url: string | null | undefined): string => {
  if (!url) return url ?? "";
  if (url.startsWith("/renders/")) {
    return url.replace(/\.(jpeg|png)$/i, ".jpg");
  }
  return url;
};

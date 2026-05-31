-- Client report 2026-05-31: /polograph page freezes / lags / goes blank.
-- Diagnosis: the polograph_hero_image URL points to a 45.5 MB JPEG that
-- the browser has to decode into ~150 MB of RGB pixels before paint,
-- blocking the main thread for several seconds and exhausting GPU
-- memory once backdrop-blur layers composite over it.
--
-- Olimpo (39 KB) and Equestrian (632 KB) heroes are fine — only the
-- Polograph one is the problem.
--
-- Swap to the existing /renders/polograph/03-polograph-aerial.jpg local
-- asset (1.3 MB, served by Vercel's CDN), which already shows the full
-- residential master plan and works as an establishing hero. Admin can
-- re-upload a properly sized image (recommended: 1920×1080, ≤500 KB,
-- WebP) via /admin/polograph any time.
--
-- ProjectHero.tsx is also hardened in this commit with decoding="async"
-- and fetchPriority="high" so future heavy uploads decode off the main
-- thread instead of locking the tab.

UPDATE public.site_settings
SET value = '/renders/polograph/03-polograph-aerial.jpg'
WHERE key = 'polograph_hero_image';

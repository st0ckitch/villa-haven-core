-- Seed 8 villa records ("Artiom villas") from client spreadsheet
-- (ვილების აღწერა არტიომ.xlsx — one villa per sheet, 2026-05-28).
-- Hero photos uploaded to storage bucket "villa-images" as villa-<n>/hero.jpg.
-- Re-runnable: ON CONFLICT (slug) DO UPDATE refreshes each row in place.

-- ─────────────────────────────────────────────────────────────────────────────
-- Villas
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.villas (
  slug, name, size_sqm, bedrooms, bathrooms,
  plot_area, total_area, bedroom_count, rooms_count,
  wet_point_1, wet_point_2, pool, parking,
  description_ka, status, section
) VALUES
  -- Villa 1 — 300 m² house, 800 m² plot, no garage, no pool
  ('villa-1', 'ვილა #1', 300, 3, 4,
   800, 300, 3, 6,
   1, 3, false, 'არა',
   $txt$ვილა #1 — 300 მ² საერთო ფართი, 800 მ² ნაკვეთი.

I სართული: მისაღები/სასადილო ზონა, კაბინეტი, სამზარეულო, სველი წერტილი, 3 დამხმარე ოთახი.
II სართული: 2 ტერასა, 3 საძინებელი, 3 სველი წერტილი.

ავტოფარეხი: არა
აუზი: არა$txt$,
   'available', 'a-section'),

  -- Villa 2 — 350 m² house, 800 m² plot, no garage, no pool
  ('villa-2', 'ვილა #2', 350, 4, 3,
   800, 350, 4, 7,
   1, 2, false, 'არა',
   $txt$ვილა #2 — 350 მ² საერთო ფართი, 800 მ² ნაკვეთი.

I სართული: მისაღები/სასადილო ზონა, სამზარეულო, კაბინეტი, სველი წერტილი, 3 დამხმარე ოთახი.
II სართული: 2 ტერასა, 4 საძინებელი, საგარდერობე, 2 სველი წერტილი.

ავტოფარეხი: არა
აუზი: არა$txt$,
   'available', 'a-section'),

  -- Villa 3 — 250 m² house, 800 m² plot (alt. 600 m²), pool included
  ('villa-3', 'ვილა #3', 250, 3, 4,
   800, 250, 3, 6,
   1, 3, true, 'შესაძლებელია',
   $txt$ვილა #3 — 250 მ² საერთო ფართი, 800 მ² ნაკვეთი (ალტერნატივა: 600 მ²).

I სართული: მისაღები/სასადილო ზონა, სამზარეულო, კაბინეტი, სველი წერტილი, 3 დამხმარე ოთახი.
II სართული: 2 ტერასა, 3 საძინებელი, საგარდერობე, 3 სველი წერტილი.

ავტოფარეხი: შესაძლებელია
აუზი: დიახ$txt$,
   'available', 'a-section'),

  -- Villa 4 — 400 m² house, 800 m² plot (alt. 1000 m²), garage + pool
  ('villa-4', 'ვილა #4', 400, 4, 5,
   800, 400, 4, 7,
   1, 4, true, 'დიახ',
   $txt$ვილა #4 — 400 მ² საერთო ფართი, 800 მ² ნაკვეთი (ალტერნატივა: 1000 მ²).

I სართული: მისაღები/სასადილო ზონა, სამზარეულო, კაბინეტი, სველი წერტილი, 3 დამხმარე ოთახი.
II სართული: ტერასა, 3 აივანი, 4 საძინებელი, საგარდერობე, 4 სველი წერტილი.

ავტოფარეხი: დიახ
აუზი: დიახ$txt$,
   'available', 'a-section'),

  -- Villa 5 — 500 m² house, 800 m² plot (alt. 1000 m²), garage + pool
  ('villa-5', 'ვილა #5', 500, 5, 4,
   800, 500, 5, 8,
   1, 3, true, 'დიახ',
   $txt$ვილა #5 — 500 მ² საერთო ფართი, 800 მ² ნაკვეთი (ალტერნატივა: 1000 მ²).

I სართული: მისაღები/სასადილო ზონა, სამზარეულო, კაბინეტი, სველი წერტილი, 3 დამხმარე ოთახი.
II სართული: ტერასა, აივანი, 5 საძინებელი, 2 საგარდერობე, 3 სველი წერტილი, დამხმარე ოთახი.

ავტოფარეხი: დიახ
აუზი: დიახ$txt$,
   'available', 'a-section'),

  -- Villa 6 — 350 m² house, 800 m² plot
  ('villa-6', 'ვილა #6', 350, 4, 4,
   800, 350, 4, 7,
   1, 3, true, 'შესაძლებელია',
   $txt$ვილა #6 — 350 მ² საერთო ფართი, 800 მ² ნაკვეთი.

I სართული: მისაღები/სასადილო ზონა, სამზარეულო, კაბინეტი, სველი წერტილი, 2 დამხმარე ოთახი.
II სართული: ტერასა, 4 საძინებელი, 2 საგარდერობე, 3 სველი წერტილი.

ავტოფარეხი: შესაძლებელია
აუზი: შესაძლებელია$txt$,
   'available', 'a-section'),

  -- Villa 7 — 200 m² house, 600 m² plot (alt. 800 m²)
  ('villa-7', 'ვილა #7', 200, 4, 3,
   600, 200, 4, 8,
   1, 2, true, 'შესაძლებელია',
   $txt$ვილა #7 — 200 მ² საერთო ფართი, 600 მ² ნაკვეთი (ალტერნატივა: 800 მ²).

I სართული: მისაღები ოთახი, სასადილო სივრცე, სამზარეულო, კაბინეტი, სველი წერტილი, დამხმარე ოთახი.
II სართული: ტერასა, 4 საძინებელი, საგარდერობე, 2 სველი წერტილი.

ავტოფარეხი: შესაძლებელია
აუზი: შესაძლებელია$txt$,
   'available', 'a-section'),

  -- Villa 8 — 250 m² house, 600 m² plot (alt. 800 m²)
  ('villa-8', 'ვილა #8', 250, 3, 2,
   600, 250, 3, 6,
   NULL, 2, true, 'შესაძლებელია',
   $txt$ვილა #8 — 250 მ² საერთო ფართი, 600 მ² ნაკვეთი (ალტერნატივა: 800 მ²).

I სართული: მისაღები/სასადილო ზონა, სამზარეულო, კაბინეტი, 2 დამხმარე ოთახი.
II სართული: ტერასა, 3 საძინებელი, საგარდერობე, 2 სველი წერტილი.

ავტოფარეხი: შესაძლებელია
აუზი: შესაძლებელია$txt$,
   'available', 'a-section')

ON CONFLICT (slug) DO UPDATE SET
  name           = EXCLUDED.name,
  size_sqm       = EXCLUDED.size_sqm,
  bedrooms       = EXCLUDED.bedrooms,
  bathrooms      = EXCLUDED.bathrooms,
  plot_area      = EXCLUDED.plot_area,
  total_area     = EXCLUDED.total_area,
  bedroom_count  = EXCLUDED.bedroom_count,
  rooms_count    = EXCLUDED.rooms_count,
  wet_point_1    = EXCLUDED.wet_point_1,
  wet_point_2    = EXCLUDED.wet_point_2,
  pool           = EXCLUDED.pool,
  parking        = EXCLUDED.parking,
  description_ka = EXCLUDED.description_ka,
  status         = EXCLUDED.status,
  section        = EXCLUDED.section;

-- ─────────────────────────────────────────────────────────────────────────────
-- Hero images
-- Bucket path: villa-images/villa-<n>/hero.jpg  (uploaded separately).
-- We delete any prior hero rows for these villas, then insert fresh ones so
-- re-runs don't accumulate duplicates.
-- ─────────────────────────────────────────────────────────────────────────────
DELETE FROM public.villa_images
WHERE villa_id IN (SELECT id FROM public.villas WHERE slug IN
  ('villa-1','villa-2','villa-3','villa-4','villa-5','villa-6','villa-7','villa-8'));

INSERT INTO public.villa_images (villa_id, image_url, sort_order, is_hero)
SELECT
  v.id,
  'https://yzivppebumckpsrvuwkr.supabase.co/storage/v1/object/public/villa-images/'
    || v.slug || '/hero.jpg',
  0,
  true
FROM public.villas v
WHERE v.slug IN
  ('villa-1','villa-2','villa-3','villa-4','villa-5','villa-6','villa-7','villa-8');

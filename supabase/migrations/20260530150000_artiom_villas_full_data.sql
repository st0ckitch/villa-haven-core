-- Re-seed the 8 'Artiom villas' with the full parameter set from
-- ვილების აღწერა არტიომ.xlsx (every value the client actually filled in;
-- the "100" cells in the spreadsheet are placeholders and stay NULL).
--
-- Depends on 20260530140000_villa_full_parameters.sql (adds the new columns).
-- Idempotent: matched by slug.

WITH data(
  slug, name, size_sqm, bedrooms, bathrooms,
  plot_area, total_area,
  rooms_count, bedroom_count,
  living_room, dining_room, study_room, kitchen,
  wet_point_1, auxiliary_rooms_1,
  terrace, balcony_count, wardrobe, wet_point_2, auxiliary_rooms_2,
  pool, parking, description_ka
) AS (VALUES
  ('villa-1', 'ვილა #1', 300::numeric, 3, 4,
   800::numeric, 300::numeric,
   6, 3,
   1, NULL::int, 1, 1,
   1, 3,
   2, NULL::int, NULL::int, 3, NULL::int,
   false, 'არა',
   E'ვილა #1 — 300 მ² საერთო ფართი, 800 მ² ნაკვეთი.\n\nI სართული: მისაღები/სასადილო ზონა, კაბინეტი, სამზარეულო, სველი წერტილი, 3 დამხმარე ოთახი.\nII სართული: 2 ტერასა, 3 საძინებელი, 3 სველი წერტილი.\n\nავტოფარეხი: არა\nაუზი: არა'),

  ('villa-2', 'ვილა #2', 350, 4, 3,
   800, 350,
   7, 4,
   1, NULL, 1, 1,
   1, 3,
   2, NULL, 1, 2, NULL,
   false, 'არა',
   E'ვილა #2 — 350 მ² საერთო ფართი, 800 მ² ნაკვეთი.\n\nI სართული: მისაღები/სასადილო ზონა, სამზარეულო, კაბინეტი, სველი წერტილი, 3 დამხმარე ოთახი.\nII სართული: 2 ტერასა, 4 საძინებელი, საგარდერობე, 2 სველი წერტილი.\n\nავტოფარეხი: არა\nაუზი: არა'),

  ('villa-3', 'ვილა #3', 250, 3, 4,
   800, 250,
   6, 3,
   1, NULL, 1, 1,
   1, 3,
   2, NULL, 1, 3, NULL,
   true, 'შესაძლებელია',
   E'ვილა #3 — 250 მ² საერთო ფართი, 800 მ² ნაკვეთი (ალტერნატივა: 600 მ²).\n\nI სართული: მისაღები/სასადილო ზონა, სამზარეულო, კაბინეტი, სველი წერტილი, 3 დამხმარე ოთახი.\nII სართული: 2 ტერასა, 3 საძინებელი, საგარდერობე, 3 სველი წერტილი.\n\nავტოფარეხი: შესაძლებელია\nაუზი: დიახ'),

  ('villa-4', 'ვილა #4', 400, 4, 5,
   800, 400,
   7, 4,
   1, NULL, 1, 1,
   1, 3,
   1, 3, 1, 4, NULL,
   true, 'დიახ',
   E'ვილა #4 — 400 მ² საერთო ფართი, 800 მ² ნაკვეთი (ალტერნატივა: 1000 მ²).\n\nI სართული: მისაღები/სასადილო ზონა, სამზარეულო, კაბინეტი, სველი წერტილი, 3 დამხმარე ოთახი.\nII სართული: ტერასა, 3 აივანი, 4 საძინებელი, საგარდერობე, 4 სველი წერტილი.\n\nავტოფარეხი: დიახ\nაუზი: დიახ'),

  ('villa-5', 'ვილა #5', 500, 5, 4,
   800, 500,
   8, 5,
   1, NULL, 1, 1,
   1, 3,
   1, 1, 2, 3, 1,
   true, 'დიახ',
   E'ვილა #5 — 500 მ² საერთო ფართი, 800 მ² ნაკვეთი (ალტერნატივა: 1000 მ²).\n\nI სართული: მისაღები/სასადილო ზონა, სამზარეულო, კაბინეტი, სველი წერტილი, 3 დამხმარე ოთახი.\nII სართული: ტერასა, აივანი, 5 საძინებელი, 2 საგარდერობე, 3 სველი წერტილი, დამხმარე ოთახი.\n\nავტოფარეხი: დიახ\nაუზი: დიახ'),

  ('villa-6', 'ვილა #6', 350, 4, 4,
   800, 350,
   7, 4,
   1, NULL, 1, 1,
   1, 2,
   1, NULL, 2, 3, NULL,
   true, 'შესაძლებელია',
   E'ვილა #6 — 350 მ² საერთო ფართი, 800 მ² ნაკვეთი.\n\nI სართული: მისაღები/სასადილო ზონა, სამზარეულო, კაბინეტი, სველი წერტილი, 2 დამხმარე ოთახი.\nII სართული: ტერასა, 4 საძინებელი, 2 საგარდერობე, 3 სველი წერტილი.\n\nავტოფარეხი: შესაძლებელია\nაუზი: შესაძლებელია'),

  ('villa-7', 'ვილა #7', 200, 4, 3,
   600, 200,
   8, 4,
   1, 1, 1, 1,
   1, 1,
   1, NULL, 1, 2, NULL,
   true, 'შესაძლებელია',
   E'ვილა #7 — 200 მ² საერთო ფართი, 600 მ² ნაკვეთი (ალტერნატივა: 800 მ²).\n\nI სართული: მისაღები ოთახი, სასადილო სივრცე, სამზარეულო, კაბინეტი, სველი წერტილი, დამხმარე ოთახი.\nII სართული: ტერასა, 4 საძინებელი, საგარდერობე, 2 სველი წერტილი.\n\nავტოფარეხი: შესაძლებელია\nაუზი: შესაძლებელია'),

  ('villa-8', 'ვილა #8', 250, 3, 2,
   600, 250,
   6, 3,
   1, NULL, 1, 1,
   NULL, 2,
   1, NULL, 1, 2, NULL,
   true, 'შესაძლებელია',
   E'ვილა #8 — 250 მ² საერთო ფართი, 600 მ² ნაკვეთი (ალტერნატივა: 800 მ²).\n\nI სართული: მისაღები/სასადილო ზონა, სამზარეულო, კაბინეტი, 2 დამხმარე ოთახი.\nII სართული: ტერასა, 3 საძინებელი, საგარდერობე, 2 სველი წერტილი.\n\nავტოფარეხი: შესაძლებელია\nაუზი: შესაძლებელია')
)
UPDATE public.villas v SET
  name              = d.name,
  size_sqm          = d.size_sqm,
  bedrooms          = d.bedrooms,
  bathrooms         = d.bathrooms,
  plot_area         = d.plot_area,
  total_area        = d.total_area,
  -- placeholder "100" cells stay NULL until the client fills them in:
  living_area       = NULL,
  floor_1_total_area  = NULL,
  floor_1_living_area = NULL,
  floor_1_summer_area = NULL,
  floor_2_total_area  = NULL,
  floor_2_living_area = NULL,
  floor_2_summer_area = NULL,
  yard_area         = NULL,
  rooms_count       = d.rooms_count,
  bedroom_count     = d.bedroom_count,
  living_room       = d.living_room,
  dining_room       = d.dining_room,
  study_room        = d.study_room,
  kitchen           = d.kitchen,
  wet_point_1       = d.wet_point_1,
  auxiliary_rooms_1 = d.auxiliary_rooms_1,
  terrace           = d.terrace,
  balcony_count     = d.balcony_count,
  wardrobe          = d.wardrobe,
  wet_point_2       = d.wet_point_2,
  auxiliary_rooms_2 = d.auxiliary_rooms_2,
  pool              = d.pool,
  parking           = d.parking,
  description_ka    = d.description_ka,
  status            = 'available',
  section           = 'a-section'
FROM data d
WHERE v.slug = d.slug;

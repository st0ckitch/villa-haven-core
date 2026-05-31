-- Client feedback 2026-05-31 (chat):
--   "Change images of the gallery on the main page to show renders of a full
--    project, so that it's more interesting for the user."
--
-- The homepage GallerySection reads from public.renders ordered by
-- sort_order, takes first 6. The first 6 were tennis-court / equestrian
-- close-ups from the seeded gallery-NN.jpg set, which read as detail
-- shots rather than "this is the scale of the project." Demote those to
-- the back of the line (sort_order 100+) and insert six establishing
-- shots — one each from Polograph (aerial), Polograph (overview),
-- Equestrian (aerial), Olimpo (overview), plus two Polograph signature
-- scenes (Round Garden, Lake) for variety. Admin can re-curate any time
-- via the existing Renders manager.

-- 1) Push existing rows out of the homepage's top-6 window without
-- destroying them — they still appear on /gallery.
UPDATE public.renders
SET sort_order = sort_order + 100
WHERE sort_order < 100;

-- 2) Insert the six featured establishing shots at the top.
INSERT INTO public.renders (image_url, title, title_ka, title_en, title_ru, category, sort_order) VALUES
  ('/renders/polograph/03-polograph-aerial.jpg', 'Polograph aerial',  'პოლოგრაფი — საჰაერო ხედი',  'Polograph aerial',  'Полограф — вид с воздуха',  1),
  ('/renders/polograph/02-polograph-overview.jpg', 'Polograph overview', 'პოლოგრაფი — საერთო ხედი',   'Polograph overview', 'Полограф — общий вид',      2),
  ('/renders/ipodromi/04-ipodromi-aerial.jpg',  'Equestrian aerial', 'საცხენოსნო კომპლექსი',       'Equestrian aerial',  'Конный комплекс',           3),
  ('/renders/olimpo/02-olimpo-1.jpg',           'Olimpo complex',    'ოლიმპო',                      'Olimpo complex',     'Олимпо',                    4),
  ('/renders/polograph/10-round-garden.jpg',    'Round Garden',      'მრგვალი ბაღი',                'Round Garden',       'Круглый сад',               5),
  ('/renders/polograph/08-lake.jpg',            'Polograph lake',    'პოლოგრაფის ტბა',              'Polograph lake',     'Озеро Полографа',           6);

-- Seed project renders and gallery photos from client-supplied presentation
-- (საიტი.pptx + accompanying image zips, delivered May 26-27, 2026).
--
-- All image files now live under `public/renders/<project>/...` and ship with
-- the Vercel build. The DB rows below provide titles (per-language) and order
-- so RenderGalleryWithDescription and the Gallery page surface them.
--
-- This migration is idempotent: it replaces all rows for the three projects
-- in `project_renders` plus all rows in `renders` (general gallery), then
-- re-inserts the canonical set. Running it twice is a no-op.

-- ─── Polograph (slides 4-9) ────────────────────────────────────────────────
DELETE FROM public.project_renders WHERE project = 'polograph';

INSERT INTO public.project_renders (project, image_url, title_ka, title_en, title_ru, sort_order) VALUES
  ('polograph', '/renders/polograph/01-polograph-hero.jpg',     'პოლოგრაფი',          'Polograph',          'Полограф',          1),
  ('polograph', '/renders/polograph/02-polograph-overview.jpg', 'პოლოგრაფი',          'Polograph overview', 'Полограф',          2),
  ('polograph', '/renders/polograph/03-polograph-aerial.jpg',   'პოლოგრაფი',          'Polograph aerial',   'Полограф с воздуха', 3),
  ('polograph', '/renders/polograph/04-polograph-render.jpg',   'პოლოგრაფი',          'Polograph render',   'Полограф',          4),
  ('polograph', '/renders/polograph/05-park.jpg',               'პარკი',               'Park',               'Парк',              5),
  ('polograph', '/renders/polograph/06-running-track.jpg',      'სარბენი ბილიკი',      'Running track',      'Беговая дорожка',    6),
  ('polograph', '/renders/polograph/07-sakura.jpg',             'საკურა',              'Sakura',             'Сакура',            7),
  ('polograph', '/renders/polograph/08-lake.jpg',               'ტბა',                 'Lake',               'Озеро',             8),
  ('polograph', '/renders/polograph/09-business-center.jpg',   'ბიზნეს ცენტრი',       'Business Center',    'Бизнес-центр',      9),
  ('polograph', '/renders/polograph/10-round-garden.jpg',       'მრგვალი ბაღი',        'Round Garden',       'Круглый сад',      10);

-- ─── Olimpo (slides 10-17) ─────────────────────────────────────────────────
DELETE FROM public.project_renders WHERE project = 'olimpo';

INSERT INTO public.project_renders (project, image_url, title_ka, title_en, title_ru, sort_order) VALUES
  ('olimpo', '/renders/olimpo/01-olimpo-hero.jpg',          'ოლიმპო',                  'Olimpo',                  'Олимпо',                  1),
  ('olimpo', '/renders/olimpo/02-olimpo-1.jpg',             'ოლიმპო',                  'Olimpo',                  'Олимпо',                  2),
  ('olimpo', '/renders/olimpo/03-olimpo-2.jpg',             'ოლიმპო',                  'Olimpo',                  'Олимпо',                  3),
  ('olimpo', '/renders/olimpo/04-tennis-courts.jpg',        'ჩოგბურთის კორტები',        'Tennis Courts',           'Теннисные корты',          4),
  ('olimpo', '/renders/olimpo/05-football-stadium.jpg',    'ფეხბურთის სტადიონი',       'Football Stadium',        'Футбольный стадион',       5),
  ('olimpo', '/renders/olimpo/06-hotel.jpg',                'სასტუმრო',                 'Hotel',                   'Отель',                   6),
  ('olimpo', '/renders/olimpo/07-padel-courts.jpg',         'პადელის კორტები',          'Padel Courts',            'Падел-корты',              7),
  ('olimpo', '/renders/olimpo/08-wellness-center.jpg',      'ველნეს ცენტრი',            'Wellness Center',         'Велнес-центр',             8),
  ('olimpo', '/renders/olimpo/09-recreation-zones.jpg',     'რეკრეაციული ზონები',       'Recreation Zones',        'Зоны отдыха',              9),
  ('olimpo', '/renders/olimpo/10-volleyball-field.jpg',     'ფრენბურთის მოედანი',       'Volleyball Court',        'Волейбольная площадка',   10),
  ('olimpo', '/renders/olimpo/11-bike-paths.jpg',          'ველობილიკები',             'Bike Paths',              'Велодорожки',             11),
  ('olimpo', '/renders/olimpo/12-billiards.jpg',            'საბილიარდო',               'Billiards',               'Бильярдная',              12),
  ('olimpo', '/renders/olimpo/13-pools.jpg',                'ღია და დახურული აუზები',   'Open and Indoor Pools',    'Открытые и крытые бассейны', 13),
  ('olimpo', '/renders/olimpo/14-entertainment.jpg',        'გასართობი სივრცეები',       'Entertainment Spaces',     'Развлекательные зоны',     14);

-- ─── Equestrian / Ipodromi (slides 18, 21-26) ──────────────────────────────
DELETE FROM public.project_renders WHERE project = 'equestrian';

INSERT INTO public.project_renders (project, image_url, title_ka, title_en, title_ru, sort_order) VALUES
  ('equestrian', '/renders/ipodromi/01-club-banner.jpg',               'საცხენოსნო კლუბი',                    'Equestrian Club',                  'Конный клуб',                       1),
  ('equestrian', '/renders/ipodromi/04-ipodromi-aerial.jpg',           'იპოდრომი',                            'Ipodromi',                         'Ипподром',                          2),
  ('equestrian', '/renders/ipodromi/07-equestrian-school.jpg',         'საცხენოსნო სკოლა',                    'Equestrian School',                'Школа верховой езды',                3),
  ('equestrian', '/renders/ipodromi/08-dressage-field.jpg',            'დრესაჟის მოედანი',                    'Dressage Field',                   'Поле для выездки',                   4),
  ('equestrian', '/renders/ipodromi/09-arenas.jpg',                    'ღია და დახურული მანეჟები',            'Open and Indoor Arenas',           'Открытые и крытые манежи',           5),
  ('equestrian', '/renders/ipodromi/10-stable-120-horses.jpg',         '120 ცხენზე გათვლილი თავლა',           'Stable for 120 Horses',            'Конюшня на 120 лошадей',             6),
  ('equestrian', '/renders/ipodromi/02-restaurants-1.jpg',             'რესტორნები და გასართობი სივრცეები',    'Restaurants and Entertainment',    'Рестораны и развлекательные зоны',   7),
  ('equestrian', '/renders/ipodromi/03-restaurants-2.jpg',             'რესტორნები და გასართობი სივრცეები',    'Restaurants and Entertainment',    'Рестораны и развлекательные зоны',   8),
  ('equestrian', '/renders/ipodromi/05-cafes-bars.jpg',                'კაფე-ბარები და რესტორნები',            'Cafes, Bars and Restaurants',       'Кафе, бары и рестораны',             9),
  ('equestrian', '/renders/ipodromi/06-private-corporate-events.jpg',  'პირადი და კორპორაციული ღონისძიებები',  'Private and Corporate Events',     'Частные и корпоративные мероприятия', 10);

-- ─── General Gallery (slide 3: ~43 photos, "გალერეაში შევიყვანოთ ყველა ფოტო") ─
-- Replaces any existing renders rows. Category defaults to 'exterior' since
-- the client did not categorize them; admin can re-tag via the Renders page.
DELETE FROM public.renders;

INSERT INTO public.renders (image_url, title, title_ka, title_en, title_ru, category, sort_order) VALUES
  ('/renders/gallery/gallery-01.jpg', 'Render 01', 'რენდერი 01', 'Render 01', 'Рендер 01', 'exterior', 1),
  ('/renders/gallery/gallery-02.jpg', 'Render 02', 'რენდერი 02', 'Render 02', 'Рендер 02', 'exterior', 2),
  ('/renders/gallery/gallery-03.jpg', 'Render 03', 'რენდერი 03', 'Render 03', 'Рендер 03', 'exterior', 3),
  ('/renders/gallery/gallery-04.jpg', 'Render 04', 'რენდერი 04', 'Render 04', 'Рендер 04', 'exterior', 4),
  ('/renders/gallery/gallery-05.jpg', 'Render 05', 'რენდერი 05', 'Render 05', 'Рендер 05', 'exterior', 5),
  ('/renders/gallery/gallery-06.jpg', 'Render 06', 'რენდერი 06', 'Render 06', 'Рендер 06', 'exterior', 6),
  ('/renders/gallery/gallery-07.jpg', 'Render 07', 'რენდერი 07', 'Render 07', 'Рендер 07', 'exterior', 7),
  ('/renders/gallery/gallery-08.jpg', 'Render 08', 'რენდერი 08', 'Render 08', 'Рендер 08', 'exterior', 8),
  ('/renders/gallery/gallery-09.jpg', 'Render 09', 'რენდერი 09', 'Render 09', 'Рендер 09', 'exterior', 9),
  ('/renders/gallery/gallery-10.jpg', 'Render 10', 'რენდერი 10', 'Render 10', 'Рендер 10', 'exterior', 10),
  ('/renders/gallery/gallery-11.jpg', 'Render 11', 'რენდერი 11', 'Render 11', 'Рендер 11', 'exterior', 11),
  ('/renders/gallery/gallery-12.jpg', 'Render 12', 'რენდერი 12', 'Render 12', 'Рендер 12', 'exterior', 12),
  ('/renders/gallery/gallery-13.jpg', 'Render 13', 'რენდერი 13', 'Render 13', 'Рендер 13', 'exterior', 13),
  ('/renders/gallery/gallery-14.jpg', 'Render 14', 'რენდერი 14', 'Render 14', 'Рендер 14', 'exterior', 14),
  ('/renders/gallery/gallery-15.jpg', 'Render 15', 'რენდერი 15', 'Render 15', 'Рендер 15', 'exterior', 15),
  ('/renders/gallery/gallery-16.jpg', 'Render 16', 'რენდერი 16', 'Render 16', 'Рендер 16', 'exterior', 16),
  ('/renders/gallery/gallery-17.jpg', 'Render 17', 'რენდერი 17', 'Render 17', 'Рендер 17', 'exterior', 17),
  ('/renders/gallery/gallery-18.jpg', 'Render 18', 'რენდერი 18', 'Render 18', 'Рендер 18', 'exterior', 18),
  ('/renders/gallery/gallery-19.jpg', 'Render 19', 'რენდერი 19', 'Render 19', 'Рендер 19', 'exterior', 19),
  ('/renders/gallery/gallery-20.jpg', 'Render 20', 'რენდერი 20', 'Render 20', 'Рендер 20', 'exterior', 20),
  ('/renders/gallery/gallery-21.jpg', 'Render 21', 'რენდერი 21', 'Render 21', 'Рендер 21', 'exterior', 21),
  ('/renders/gallery/gallery-22.jpg', 'Render 22', 'რენდერი 22', 'Render 22', 'Рендер 22', 'exterior', 22),
  ('/renders/gallery/gallery-23.jpg', 'Render 23', 'რენდერი 23', 'Render 23', 'Рендер 23', 'exterior', 23),
  ('/renders/gallery/gallery-24.jpg', 'Render 24', 'რენდერი 24', 'Render 24', 'Рендер 24', 'exterior', 24),
  ('/renders/gallery/gallery-25.jpg', 'Render 25', 'რენდერი 25', 'Render 25', 'Рендер 25', 'exterior', 25),
  ('/renders/gallery/gallery-26.jpg', 'Render 26', 'რენდერი 26', 'Render 26', 'Рендер 26', 'exterior', 26),
  ('/renders/gallery/gallery-27.jpg', 'Render 27', 'რენდერი 27', 'Render 27', 'Рендер 27', 'exterior', 27),
  ('/renders/gallery/gallery-28.jpg', 'Render 28', 'რენდერი 28', 'Render 28', 'Рендер 28', 'exterior', 28),
  ('/renders/gallery/gallery-29.jpg', 'Render 29', 'რენდერი 29', 'Render 29', 'Рендер 29', 'exterior', 29),
  ('/renders/gallery/gallery-30.jpg', 'Render 30', 'რენდერი 30', 'Render 30', 'Рендер 30', 'exterior', 30),
  ('/renders/gallery/gallery-31.jpg', 'Render 31', 'რენდერი 31', 'Render 31', 'Рендер 31', 'exterior', 31),
  ('/renders/gallery/gallery-32.jpg', 'Render 32', 'რენდერი 32', 'Render 32', 'Рендер 32', 'exterior', 32),
  ('/renders/gallery/gallery-33.jpg', 'Render 33', 'რენდერი 33', 'Render 33', 'Рендер 33', 'exterior', 33),
  ('/renders/gallery/gallery-34.jpg', 'Render 34', 'რენდერი 34', 'Render 34', 'Рендер 34', 'exterior', 34),
  ('/renders/gallery/gallery-35.jpg', 'Render 35', 'რენდერი 35', 'Render 35', 'Рендер 35', 'exterior', 35),
  ('/renders/gallery/gallery-36.jpg', 'Render 36', 'რენდერი 36', 'Render 36', 'Рендер 36', 'exterior', 36),
  ('/renders/gallery/gallery-37.jpg', 'Render 37', 'რენდერი 37', 'Render 37', 'Рендер 37', 'exterior', 37),
  ('/renders/gallery/gallery-38.jpg', 'Render 38', 'რენდერი 38', 'Render 38', 'Рендер 38', 'exterior', 38),
  ('/renders/gallery/gallery-39.jpg', 'Render 39', 'რენდერი 39', 'Render 39', 'Рендер 39', 'exterior', 39),
  ('/renders/gallery/gallery-40.jpg', 'Render 40', 'რენდერი 40', 'Render 40', 'Рендер 40', 'exterior', 40),
  ('/renders/gallery/gallery-41.jpg', 'Render 41', 'რენდერი 41', 'Render 41', 'Рендер 41', 'exterior', 41),
  ('/renders/gallery/gallery-42.jpg', 'Render 42', 'რენდერი 42', 'Render 42', 'Рендер 42', 'exterior', 42),
  ('/renders/gallery/gallery-43.jpg', 'Render 43', 'რენდერი 43', 'Render 43', 'Рендер 43', 'exterior', 43);

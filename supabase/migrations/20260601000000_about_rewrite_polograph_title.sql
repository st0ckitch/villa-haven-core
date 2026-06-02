-- Client PDF 2026-05-31:
--
-- 1) About page should be rewritten as three labeled paragraphs:
--      ჩვენი ხედვა  (Vision)
--      ჩვენი მისია  (Mission)
--      ჩვენი ამოცანა (Goal)
--    The current layout has one lead description block + a Mission card
--    + a Vision card. We re-use the existing slots:
--      description    → Vision (lead paragraph)
--      mission_text   → Mission (right-side card)
--      vision_text    → Goal   (right-side card; relabeled via title)
--
-- 2) Polograph page hero title currently shows "პოლოგრაფი იგავისგან"
--    because the site_settings.polograph_title_<lang> rows have that
--    value. Client wants it shortened to just "პოლოგრაფი".

-- ────────────────────────────────────────────────────────────────────────
-- About: Vision / Mission / Goal copy (3 locales)
-- ────────────────────────────────────────────────────────────────────────

INSERT INTO public.site_settings (key, value) VALUES
  -- Lead column = "ჩვენი ხედვა" (Vision)
  ('about_description_ka', E'ჩვენი ხედვა:\n\nიგავი დეველოპმენტი არის სამშენებლო-დეველოპერული კომპანია, რომელიც საცხოვრებელი გარემოს სრულად ახლებურ ხედვას და კონცეფციას გვთავაზობს.'),
  ('about_description_en', E'Our Vision:\n\nIgavi Development is a construction-development company offering an entirely new vision and concept for the residential environment.'),
  ('about_description_ru', E'Наше видение:\n\nIgavi Development — строительно-девелоперская компания, предлагающая принципиально новый взгляд и концепцию жилой среды.'),

  -- Right card #1 = Mission
  ('about_mission_title_ka', 'ჩვენი მისია'),
  ('about_mission_title_en', 'Our Mission'),
  ('about_mission_title_ru', 'Наша миссия'),
  ('about_mission_text_ka', 'ჩვენ გვწერა, რომ საცხოვრებელი სივრცე მხოლოდ სახლით არ შემოიფარგლება. ჩვენი ფილოსოფია ბუნებასთან ჰარმონიაში მყოფი ურბანისტიკის განვითარება და ეკო-მეგობრული გარემოს შექმნა.'),
  ('about_mission_text_en', 'We believe that a residential space is more than just a house. Our philosophy is to develop urbanism in harmony with nature and to create an eco-friendly environment.'),
  ('about_mission_text_ru', 'Мы считаем, что жилое пространство — это не только дом. Наша философия — развитие урбанистики в гармонии с природой и создание эко-дружественной среды.'),

  -- Right card #2 = Goal (reusing the vision_* slot)
  ('about_vision_title_ka', 'ჩვენი ამოცანა'),
  ('about_vision_title_en', 'Our Objective'),
  ('about_vision_title_ru', 'Наша задача'),
  ('about_vision_text_ka', 'იგავი დეველოპმენტის ამოცანა უნიკალური, ეკოლოგიურად სუფთა, მშვიდი, პრემიუმ კლასის საცხოვრებელი გარემოს შექმნა. ადგილი, სადაც ჯანსაგი ცხოვრების წესი და ბუნებაზე ზრუნვა პრიორიტეტია.'),
  ('about_vision_text_en', 'The objective of Igavi Development is to create a unique, ecologically clean, calm, premium-class residential environment — a place where a healthy lifestyle and care for nature are the priority.'),
  ('about_vision_text_ru', 'Задача Igavi Development — создать уникальную, экологически чистую, спокойную жилую среду премиум-класса: место, где здоровый образ жизни и забота о природе являются приоритетом.')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ────────────────────────────────────────────────────────────────────────
-- Polograph page hero title cleanup
-- ────────────────────────────────────────────────────────────────────────

INSERT INTO public.site_settings (key, value) VALUES
  ('polograph_title_ka', 'პოლოგრაფი'),
  ('polograph_title_en', 'Polograph'),
  ('polograph_title_ru', 'Полограф')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

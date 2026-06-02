-- About page restructure per client PDF 2026-05-31. Three labeled
-- paragraphs (Vision / Mission / Goal) with the exact Georgian copy
-- the client provided, plus a new "Reference / VR Holding" section
-- below describing the parent developer.
--
-- Content lives in public.site_settings (admin-editable) so the client
-- can re-tune wording without a code deploy.

INSERT INTO public.site_settings (key, value) VALUES
  -- Vision (existing key, refreshed to PDF copy)
  ('about_vision_title_ka', 'ჩვენი ხედვა'),
  ('about_vision_title_en', 'Our Vision'),
  ('about_vision_title_ru', 'Наше видение'),
  ('about_vision_text_ka',
   'იგავი დეველოპმენტი არის სამშენებლო-დეველოპერული კომპანია, რომელიც საცხოვრებელი გარემოს სრულად ახლებურ ხედვას და კონცეფციას გვთავაზობს.'),
  ('about_vision_text_en',
   'Igavi Development is a construction-development company that offers a completely new vision and concept for the residential environment.'),
  ('about_vision_text_ru',
   'Igavi Development — строительно-девелоперская компания, предлагающая принципиально новый взгляд и концепцию жилой среды.'),

  -- Mission (existing key, refreshed)
  ('about_mission_title_ka', 'ჩვენი მისია'),
  ('about_mission_title_en', 'Our Mission'),
  ('about_mission_title_ru', 'Наша миссия'),
  ('about_mission_text_ka',
   'ჩვენ გვწამს, რომ საცხოვრებელი სივრცე მხოლოდ სახლით არ შემოიფარგლება. ჩვენი ფილოსოფია ბუნებასთან ჰარმონიაში მყოფი ურბანისტიკის განვითარება და ეკო-მეგობრული გარემოს შექმნაა.'),
  ('about_mission_text_en',
   'We believe a residential space is not limited to just a house. Our philosophy is the development of urbanism in harmony with nature and the creation of an eco-friendly environment.'),
  ('about_mission_text_ru',
   'Мы убеждены, что жилое пространство не ограничивается только домом. Наша философия — развитие урбанистики в гармонии с природой и создание эко-дружественной среды.'),

  -- NEW: Goal section
  ('about_goal_title_ka', 'ჩვენი ამოცანა'),
  ('about_goal_title_en', 'Our Goal'),
  ('about_goal_title_ru', 'Наша задача'),
  ('about_goal_text_ka',
   'იგავი დეველოპმენტის ამოცანაა უნიკალური, ეკოლოგიურად სუფთა, მშვიდი, პრემიუმ კლასის საცხოვრებელი გარემოს შექმნა. ადგილი, სადაც ჯანსაღი ცხოვრების წესი და ბუნებაზე ზრუნვა პრიორიტეტია.'),
  ('about_goal_text_en',
   'Igavi Development''s goal is to create a unique, ecologically clean, peaceful, premium-class residential environment — a place where a healthy lifestyle and care for nature are the priority.'),
  ('about_goal_text_ru',
   'Цель Igavi Development — создать уникальную, экологически чистую, спокойную, премиум-класса жилую среду. Место, где приоритетом являются здоровый образ жизни и забота о природе.'),

  -- NEW: VR Holding reference section
  ('about_vr_title_ka', 'VR Holding'),
  ('about_vr_title_en', 'VR Holding'),
  ('about_vr_title_ru', 'VR Holding'),
  ('about_vr_text_ka',
   'VR Holding არის უძრავი ქონების დეველოპერული კომპანია, რომელმაც ქართულ ბაზარზე ერთ-ერთმა პირველმა დანერგა უმაღლესი სტანდარტი სამშენებლო ინდუსტრიაში.

კომპანია 2010 წელს ბიზნესმენ ნოშრო ნამორაძის მიერ დაარსდა და მას შემდეგ წარმატებით ახორციელებს ინოვაციურ პროექტებს საქართველოს მასშტაბით, რომლებიც აყალიბებენ ქვეყნის ურბანულ ლანდშაფტს.

VR Holding-ის მიერ განხორციელებული პროექტები ასახავს ინოვაციას, მდგრადობასა და გვთავაზობს შეუდარებელ ხარისხს. VR Holding წარმოადგენს იმ დეველოპერულ კომპანიას, რომელსაც ძალიან დიდი წვლილი აქვს შეტანილი უახლესი კონცეფციებისა და სტანდარტების დანერგვაში.

სანდოობის, ხარისხის, პროფესიონალიზმისა და პროექტების დროულად მიწოდების უწყვეტი ერთგულებით, VR Holding ინარჩუნებს ლიდერის პოზიციას უძრავი ქონების სექტორში.'),
  ('about_vr_text_en',
   'VR Holding is a real-estate development company that was among the first on the Georgian market to bring the highest standard into the construction industry.

The company was founded in 2010 by businessman Noshro Namoradze and has since successfully delivered innovative projects across Georgia, shaping the country''s urban landscape.

VR Holding''s projects reflect innovation, sustainability and offer unmatched quality. VR Holding is the developer that has contributed substantially to introducing the newest concepts and standards.

With an unbroken commitment to trust, quality, professionalism and on-time delivery, VR Holding maintains its leading position in the real-estate sector.'),
  ('about_vr_text_ru',
   'VR Holding — девелоперская компания в сфере недвижимости, одной из первых внедрившая в строительной индустрии Грузии высочайший стандарт.

Компания была основана в 2010 году бизнесменом Ношро Намарадзе и с тех пор успешно реализует инновационные проекты по всей Грузии, формируя городской ландшафт страны.

Проекты VR Holding отражают инновации, устойчивость и предлагают непревзойдённое качество. VR Holding — девелопер, внёсший огромный вклад во внедрение новейших концепций и стандартов.

Благодаря непрерывной приверженности доверию, качеству, профессионализму и своевременной сдаче проектов VR Holding сохраняет лидерскую позицию в секторе недвижимости.')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Translate the `new-development` blog category label into Russian so it no
-- longer renders as English ("Igavi Development") on the Russian-language
-- /blog filter pills. We use the Cyrillic transliteration already used
-- elsewhere in the UI (see src/i18n/ru.json `catalogIgavi`).
UPDATE public.blog_categories
SET name_ru = 'Игави Девелопмент'
WHERE slug = 'new-development';


-- Update existing stat values
UPDATE site_settings SET value = '279' WHERE key = 'stat_1_value';
UPDATE site_settings SET value = 'პრემიუმ კლასის ვილა' WHERE key = 'stat_1_label';
UPDATE site_settings SET value = '0' WHERE key = 'stat_2_value';
UPDATE site_settings SET value = 'რეკრეაციული ზონა' WHERE key = 'stat_2_label';
UPDATE site_settings SET value = '90' WHERE key = 'stat_3_value';
UPDATE site_settings SET value = 'საერთო ფართობი' WHERE key = 'stat_3_label';
UPDATE site_settings SET value = 'ჰექტარი' WHERE key = 'stat_3_suffix';

-- Delete old stat_4 entries and reinsert with correct data
DELETE FROM site_settings WHERE key IN ('stat_4_value', 'stat_4_label', 'stat_4_suffix', 'stat_5_value', 'stat_5_label', 'stat_5_suffix');

INSERT INTO site_settings (key, value) VALUES
  ('stat_4_value', '40'),
  ('stat_4_label', 'დასახლება'),
  ('stat_4_suffix', 'ჰექტარი'),
  ('stat_5_value', '15'),
  ('stat_5_label', 'თბილისიდან'),
  ('stat_5_suffix', 'წუთი');

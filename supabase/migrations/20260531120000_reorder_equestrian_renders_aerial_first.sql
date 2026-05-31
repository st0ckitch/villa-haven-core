-- Client feedback 2026-05-31 (WhatsApp):
--   "Before going into the gallery, put distant views from outside so
--    everything appears. Currently only stables and sports are visible."
--
-- The Equestrian project renders previously led with the close-up "club
-- banner" shot, then the aerial. The aerial gives the establishing context
-- the client wants — promote it to the lead, and demote the close-ups.

UPDATE public.project_renders
SET sort_order = CASE image_url
  -- Establishing shots first
  WHEN '/renders/ipodromi/04-ipodromi-aerial.jpg'           THEN 1
  WHEN '/renders/ipodromi/01-club-banner.jpg'               THEN 2
  -- Sport / facility detail
  WHEN '/renders/ipodromi/09-arenas.jpg'                    THEN 3
  WHEN '/renders/ipodromi/07-equestrian-school.jpg'         THEN 4
  WHEN '/renders/ipodromi/08-dressage-field.jpg'            THEN 5
  WHEN '/renders/ipodromi/10-stable-120-horses.jpg'         THEN 6
  -- Hospitality
  WHEN '/renders/ipodromi/02-restaurants-1.jpg'             THEN 7
  WHEN '/renders/ipodromi/03-restaurants-2.jpg'             THEN 8
  WHEN '/renders/ipodromi/05-cafes-bars.jpg'                THEN 9
  WHEN '/renders/ipodromi/06-private-corporate-events.jpg'  THEN 10
  ELSE sort_order
END
WHERE project = 'equestrian';

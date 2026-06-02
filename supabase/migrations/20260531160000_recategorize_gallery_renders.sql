-- Client feedback 2026-05-31: replace the generic Gallery filter buckets
-- (exterior / interior / amenities / landscape) with project-by-project
-- buckets — polograph / olimpo / ipodromi / villas. The Gallery page
-- reads `renders.category` directly for filter matching, so the rows
-- need to be re-tagged in place.
--
-- Strategy: derive the new bucket from each row's image_url prefix.
-- Anything under /renders/polograph/ → polograph, /olimpo/ → olimpo,
-- /ipodromi/ → ipodromi. Generic /renders/gallery/gallery-NN.jpg
-- placeholders default to 'polograph' (the lead project) so the
-- homepage gallery still has content after the cut-over.

UPDATE public.renders
SET category = CASE
  WHEN image_url LIKE '/renders/polograph/%' THEN 'polograph'
  WHEN image_url LIKE '/renders/olimpo/%'    THEN 'olimpo'
  WHEN image_url LIKE '/renders/ipodromi/%'  THEN 'ipodromi'
  WHEN image_url LIKE '%villa%'              THEN 'villas'
  WHEN image_url LIKE '/renders/gallery/%'   THEN 'polograph'
  ELSE category
END;

NOTIFY pgrst, 'reload schema';

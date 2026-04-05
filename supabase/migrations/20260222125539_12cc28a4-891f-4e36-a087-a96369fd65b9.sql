
-- Add section column to villas
ALTER TABLE public.villas ADD COLUMN section text DEFAULT 'a-section';

-- Update existing villas to have section
UPDATE public.villas SET section = 'a-section' WHERE section IS NULL;

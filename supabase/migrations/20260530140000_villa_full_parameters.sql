-- Full villa parameter set per client spreadsheet (ვილების აღწერა არტიომ.xlsx).
-- Every field is nullable so admins can choose which ones to populate; the
-- detail page already filters out null/0/empty values, so unset fields are
-- silently hidden.

ALTER TABLE public.villas
  -- Per-floor areas (the spreadsheet leaves these blank with a "100"
  -- placeholder; once real numbers arrive they go here)
  ADD COLUMN IF NOT EXISTS floor_1_total_area    numeric,
  ADD COLUMN IF NOT EXISTS floor_1_living_area   numeric,
  ADD COLUMN IF NOT EXISTS floor_1_summer_area   numeric,
  ADD COLUMN IF NOT EXISTS floor_2_total_area    numeric,
  ADD COLUMN IF NOT EXISTS floor_2_living_area   numeric,
  ADD COLUMN IF NOT EXISTS floor_2_summer_area   numeric,
  ADD COLUMN IF NOT EXISTS yard_area             numeric,

  -- Room counts not yet covered by the legacy schema
  ADD COLUMN IF NOT EXISTS dining_room           integer,  -- სასადილო სივრცე
  ADD COLUMN IF NOT EXISTS study_room            integer,  -- კაბინეტი
  ADD COLUMN IF NOT EXISTS auxiliary_rooms_1     integer,  -- დამხმარე ოთახები (I)
  ADD COLUMN IF NOT EXISTS auxiliary_rooms_2     integer,  -- დამხმარე ოთახი   (II)
  ADD COLUMN IF NOT EXISTS terrace               integer,  -- ტერასა
  ADD COLUMN IF NOT EXISTS balcony_count         integer,  -- აივანი (count — distinct from balcony_area)
  ADD COLUMN IF NOT EXISTS wardrobe              integer;  -- საგარდერობე

-- Client PDF #10 (2026-06-14): add a "master bedroom" field to villas.
-- Free text so it can hold "yes" / a count / an area (e.g. "25 m²").
-- Surfaced in the villa spec list and editable in the admin panel.
alter table public.villas
  add column if not exists master_bedroom text;

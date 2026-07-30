-- Merge purchase/lifecycle fields directly onto soda_flavors (one row per
-- purchase, same pattern as coffee_bags) instead of a separate batches
-- table — simpler to read and manage in one place.
ALTER TABLE soda_flavors RENAME COLUMN name TO flavor_name;
ALTER TABLE soda_flavors
  ADD COLUMN IF NOT EXISTS brand varchar(100),
  ADD COLUMN IF NOT EXISTS cost numeric CHECK (cost IS NULL OR cost >= 0),
  ADD COLUMN IF NOT EXISTS ml smallint CHECK (ml IS NULL OR ml > 0),
  ADD COLUMN IF NOT EXISTS purchase_date date,
  ADD COLUMN IF NOT EXISTS finished_date date,
  ADD COLUMN IF NOT EXISTS always_available boolean NOT NULL DEFAULT false;

-- Limon is fresh-squeezed with no real cost to track — the one flavor that
-- stays available regardless of finished_date.
UPDATE soda_flavors SET always_available = true WHERE lower(flavor_name) = 'limón';

DROP TABLE IF EXISTS soda_flavor_batches;

-- Cylinders: created_at was redundant with purchase_date (a cylinder is
-- always logged the day it's bought) — drop it and let purchase_date
-- default to today automatically.
ALTER TABLE soda_cylinders DROP COLUMN IF EXISTS created_at;
ALTER TABLE soda_cylinders ALTER COLUMN purchase_date SET DEFAULT CURRENT_DATE;

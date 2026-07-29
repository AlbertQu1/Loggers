-- Year is always the capture year, not something the user enters — derive
-- it from created_at instead of storing it redundantly.
ALTER TABLE cafeteria_benchmarks DROP COLUMN IF EXISTS year;

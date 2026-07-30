-- Converts a positive integer into a base-26 letter label: 1->A, 2->B, ...,
-- 26->Z, 27->AA, 28->AB, ... Used to auto-name cylinders (A, B, C, ...).
CREATE OR REPLACE FUNCTION int_to_letters(n integer) RETURNS text AS $$
DECLARE
  result text := '';
  i integer := n;
BEGIN
  WHILE i > 0 LOOP
    i := i - 1;
    result := chr(65 + (i % 26)) || result;
    i := i / 26;
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Auto-assigns the cylinder label from its own id (already populated by the
-- IDENTITY column before this BEFORE INSERT trigger runs) — the app no
-- longer sends a label at all.
CREATE OR REPLACE FUNCTION assign_cylinder_label() RETURNS trigger AS $$
BEGIN
  IF NEW.label IS NULL THEN
    NEW.label := int_to_letters(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_assign_cylinder_label ON soda_cylinders;
CREATE TRIGGER trg_assign_cylinder_label
  BEFORE INSERT ON soda_cylinders
  FOR EACH ROW
  EXECUTE FUNCTION assign_cylinder_label();

ALTER TABLE soda_cylinders ALTER COLUMN label DROP NOT NULL;

-- Preparations: a real pour can be multiple shots of different intensities
-- (matching the legacy "S, s" comma-list data), plus how many bottles were
-- carbonated in this session.
ALTER TABLE soda_preparations
  ADD COLUMN IF NOT EXISTS shots_light smallint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shots_medium smallint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shots_strong smallint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bottles_prepared smallint NOT NULL DEFAULT 1;

-- Backfill existing rows from the old single-select intensity column
-- before dropping it, so real logged data isn't lost.
UPDATE soda_preparations SET shots_light = 1 WHERE intensity = 'LIGHT';
UPDATE soda_preparations SET shots_medium = 1 WHERE intensity = 'MEDIUM';
UPDATE soda_preparations SET shots_strong = 1 WHERE intensity = 'STRONG';

ALTER TABLE soda_preparations DROP COLUMN IF EXISTS intensity;

ALTER TABLE soda_preparations DROP CONSTRAINT IF EXISTS at_least_one_shot;
ALTER TABLE soda_preparations
  ADD CONSTRAINT at_least_one_shot CHECK (shots_light + shots_medium + shots_strong > 0);

CREATE TABLE IF NOT EXISTS flavors (
  id smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name varchar(50) NOT NULL UNIQUE,
  display_order smallint
);

INSERT INTO flavors (name, display_order) VALUES
  ('Vanilla', 1), ('Chocolate', 2), ('Mazapan', 3), ('Lavender', 4)
ON CONFLICT (name) DO NOTHING;

ALTER TABLE coffee_preparations
  ADD COLUMN IF NOT EXISTS flavor_ids smallint[],
  ADD COLUMN IF NOT EXISTS other_flavor text;

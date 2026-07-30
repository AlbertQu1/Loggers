-- soda_cylinders.id is bigint (IDENTITY), but int_to_letters() was defined
-- for integer — Postgres won't implicitly cast bigint -> integer here.
DROP FUNCTION IF EXISTS int_to_letters(integer);

CREATE OR REPLACE FUNCTION int_to_letters(n bigint) RETURNS text AS $$
DECLARE
  result text := '';
  i bigint := n;
BEGIN
  WHILE i > 0 LOOP
    i := i - 1;
    result := chr(65 + (i % 26)::integer) || result;
    i := i / 26;
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

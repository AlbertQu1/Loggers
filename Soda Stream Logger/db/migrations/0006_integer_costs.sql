-- Costs are always whole numbers in practice — round existing values and
-- switch the columns to integer so decimals can't creep back in.
ALTER TABLE soda_cylinders ALTER COLUMN price TYPE integer USING ROUND(price)::integer;
ALTER TABLE soda_flavors ALTER COLUMN cost TYPE integer USING ROUND(cost)::integer;

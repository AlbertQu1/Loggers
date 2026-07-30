-- flavor_name is no longer a catalog key — it's one row per purchase, so
-- the same flavor name legitimately repeats across multiple buys (same
-- pattern as coffee_bags.coffee_name).
ALTER TABLE soda_flavors DROP CONSTRAINT IF EXISTS soda_flavors_name_key;

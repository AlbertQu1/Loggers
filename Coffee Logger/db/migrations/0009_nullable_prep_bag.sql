-- Flavor/milk-only preparations (hot chocolate, matcha, plain milk) have no
-- coffee bag at all. fetch_preparation()'s existing INNER JOIN to
-- coffee_bags in the Python pipeline already excludes NULL bag_id rows for
-- free, so no analytics-side changes are needed.
ALTER TABLE coffee_preparations ALTER COLUMN bag_id DROP NOT NULL;

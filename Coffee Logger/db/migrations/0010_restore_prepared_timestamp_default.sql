-- The app never sends prepared_timestamp explicitly on INSERT (app/api/cups/route.ts) --
-- it always relied on this column defaulting to the capture time. Lost during the
-- test -> casa.coffee_analytics production cutover, causing every /api/cups POST to
-- fail with a not-null violation.
ALTER TABLE coffee_analytics.coffee_preparations ALTER COLUMN prepared_timestamp SET DEFAULT now();

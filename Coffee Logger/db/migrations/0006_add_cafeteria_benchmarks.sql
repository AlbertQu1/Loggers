-- Benchmark price points (double espresso reference) for competitor
-- cafeterias, feeding coffee_WIP.py's build_price_context(). Not used by
-- the app's own features — this is a data-entry surface for the analytics
-- script's "Cafeterias" sheet equivalent.
CREATE TABLE IF NOT EXISTS cafeteria_benchmarks (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  year smallint NOT NULL,
  cafeteria_name varchar(100) NOT NULL,
  city varchar(50) NOT NULL DEFAULT 'CDMX',
  price numeric NOT NULL CHECK (price >= 0),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

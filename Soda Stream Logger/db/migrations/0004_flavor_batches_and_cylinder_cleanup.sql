-- Cylinders: all tanks are the same size, and nobody gifts them — cost 0
-- just means it came bundled with the machine. Both fields are dead weight.
ALTER TABLE soda_cylinders DROP COLUMN IF EXISTS liters_total;
ALTER TABLE soda_cylinders DROP COLUMN IF EXISTS is_gift;

-- Flavor purchase batches: optional lifecycle tracking per flavor. A flavor
-- with zero batches (e.g. fresh-squeezed Limon, no real cost to track) is
-- always available. A flavor with at least one batch is only available
-- while it has an unfinished one — marking a batch finished removes it
-- from the picker until a new batch is added.
CREATE TABLE IF NOT EXISTS soda_flavor_batches (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  flavor_id smallint NOT NULL REFERENCES soda_flavors(id),
  brand varchar(100),
  cost numeric CHECK (cost IS NULL OR cost >= 0),
  ml smallint CHECK (ml IS NULL OR ml > 0),
  purchase_date date,
  finished_date date,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Adds the open/close lifecycle fields the app needs on top of the existing
-- coffee_bags table (which only tracked purchase_date/closed_date).
ALTER TABLE coffee_bags
  ADD COLUMN IF NOT EXISTS opened_date date,
  ADD COLUMN IF NOT EXISTS status varchar(10) NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'ACTIVE', 'CLOSED'));

-- Backfill any pre-existing rows based on closed_date so status stays consistent.
UPDATE coffee_bags SET status = 'CLOSED' WHERE closed_date IS NOT NULL AND status <> 'CLOSED';

-- Enforce "only one active bag at a time" at the database level.
CREATE UNIQUE INDEX IF NOT EXISTS one_active_bag_idx ON coffee_bags (status) WHERE status = 'ACTIVE';

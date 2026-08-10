-- Snapshot of each analytics run's prediction for a bag, so realized
-- accuracy can be measured later against predicted_total_cups /
-- predicted_cycle_days once that bag actually closes.
CREATE TABLE IF NOT EXISTS bag_predictions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  bag_id bigint NOT NULL REFERENCES coffee_bags(id) ON DELETE CASCADE,
  prediction_date date NOT NULL DEFAULT CURRENT_DATE,
  predicted_total_cups numeric,
  predicted_cycle_days numeric,
  cups_model varchar(20),
  duration_model varchar(20),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

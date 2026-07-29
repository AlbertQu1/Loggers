CREATE TABLE IF NOT EXISTS maintenance (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  maintenance_type varchar(10) NOT NULL CHECK (maintenance_type IN ('CLEAN', 'DESCALE')),
  performed_date date NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Migrated from the legacy Google Sheets "Mtto" tab (as of 2026-07-29):
-- both a clean and a descale were logged on 2026-06-02.
INSERT INTO maintenance (maintenance_type, performed_date, notes) VALUES
  ('CLEAN', '2026-06-02', 'Migrado de Google Sheets - 600 tazas acumuladas al momento'),
  ('DESCALE', '2026-06-02', 'Migrado de Google Sheets - 600 tazas acumuladas al momento');

CREATE TABLE IF NOT EXISTS soda_flavors (
  id smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name varchar(50) NOT NULL UNIQUE
);

INSERT INTO soda_flavors (name) VALUES
  ('Pepino Menta'), ('Arándano'), ('Limón')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS soda_cylinders (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  label varchar(50) NOT NULL,
  price numeric NOT NULL DEFAULT 0 CHECK (price >= 0),
  liters_total smallint NOT NULL CHECK (liters_total > 0),
  purchase_date date NOT NULL,
  is_gift boolean NOT NULL DEFAULT false,
  notes text,
  opened_date date,
  closed_date date,
  status varchar(10) NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'ACTIVE', 'CLOSED')),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Enforce "only one active cylinder at a time" at the database level.
CREATE UNIQUE INDEX IF NOT EXISTS one_active_cylinder_idx ON soda_cylinders (status) WHERE status = 'ACTIVE';

CREATE TABLE IF NOT EXISTS soda_preparations (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  prepared_timestamp timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cylinder_id bigint NOT NULL REFERENCES soda_cylinders(id) ON DELETE RESTRICT,
  intensity varchar(10) NOT NULL CHECK (intensity IN ('LIGHT', 'MEDIUM', 'STRONG')),
  flavor_id smallint REFERENCES soda_flavors(id),
  ml smallint
);

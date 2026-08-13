-- Precios de referencia del mercado (Ciel, Peñafiel, Topo Chico, Perrier...)
-- por segmento y año, para comparar contra el costo real de hacer soda en
-- casa y determinar ahorro. Se actualiza agregando filas cada año nuevo
-- (UNIQUE permite upsert por segmento+marca+año en vez de duplicar).
CREATE TABLE IF NOT EXISTS soda_market_benchmarks (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  segment varchar(50) NOT NULL,
  brand varchar(200) NOT NULL,
  year smallint NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (segment, brand, year)
);

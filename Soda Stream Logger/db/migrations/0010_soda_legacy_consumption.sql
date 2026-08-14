-- Preserva evento-por-evento las filas de CONSUMPTION de la era manual
-- (intensidad='-', sin shots reales) que migracion.py NO inserta en
-- soda_preparations -- esa tabla exige shots reales (CHECK
-- at_least_one_shot) y fabricarlos violaria la integridad de los datos.
-- Pero el detalle (fecha, cilindro, sabor, consumo) SI importa: hace
-- falta para analisis futuro que cruce consumo contra otras fechas (ej.
-- reuniones en casa), no solo el agregado por cilindro que ya vive en
-- soda_cylinders.historical_liters (ver migracion 0009). No es parte del
-- flujo operativo de la app -- ninguna pantalla la lee, es solo registro
-- historico para scripts de analisis (ej. Gasificador).
CREATE TABLE IF NOT EXISTS soda_legacy_consumption (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_date date NOT NULL,
  cylinder_id bigint REFERENCES soda_cylinders(id),
  flavor_id bigint REFERENCES soda_flavors(id),
  ml integer,
  bottles_prepared smallint NOT NULL
);

-- Clima (Open-Meteo, coordenadas de "Casa" reusadas de coffee-consumption-
-- analytics/boardgames-assistant: 19.4326, -99.1332) por preparacion.
-- Para filas migradas del sheet (prepared_timestamp/event_date sinteticos,
-- sin hora real capturada) se backfillea con el promedio DIARIO. Para
-- preparaciones nuevas capturadas en vivo desde la app, se guarda el clima
-- de esa HORA real al momento de insertar.
ALTER TABLE soda_preparations
  ADD COLUMN IF NOT EXISTS temp_c numeric,
  ADD COLUMN IF NOT EXISTS precipitacion_mm numeric;

ALTER TABLE soda_legacy_consumption
  ADD COLUMN IF NOT EXISTS temp_c numeric,
  ADD COLUMN IF NOT EXISTS precipitacion_mm numeric;

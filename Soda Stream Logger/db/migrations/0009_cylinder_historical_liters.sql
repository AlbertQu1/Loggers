-- Litros rendidos por cilindro durante la era "manual" (antes del equipo
-- nuevo que trackea shots por intensidad). soda_preparations no cubre esa
-- era -- son datos migrados una sola vez desde el historial de Google
-- Sheets (ver migracion.py), asi que se guardan aqui aparte para no
-- perderlos. El total real de litros de un cilindro es
-- historical_liters + SUM(soda_preparations.bottles_prepared).
ALTER TABLE soda_cylinders ADD COLUMN IF NOT EXISTS historical_liters smallint;

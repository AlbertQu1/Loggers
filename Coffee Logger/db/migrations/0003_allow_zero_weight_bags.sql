-- The annual "Molido <year>" virtual bag intentionally uses weight_grams = 0
-- as an analytics marker (see docs/prompts/GROUND_COFFEE_IMPLEMENTATION.md).
-- The original check constraint required weight_grams > 0; relax it to allow
-- zero (still blocking negative values) instead of faking a nonzero weight.
ALTER TABLE coffee_bags DROP CONSTRAINT IF EXISTS coffee_bags_weight_grams_check;
ALTER TABLE coffee_bags ADD CONSTRAINT coffee_bags_weight_grams_check CHECK (weight_grams >= 0);

-- Same incident class as 0010: lost during the test -> casa.coffee_analytics
-- production cutover, this time on bag_predictions.prediction_date, breaking
-- any insert that doesn't explicitly pass it (e.g. predict_active_bag.py).
ALTER TABLE coffee_analytics.bag_predictions ALTER COLUMN prediction_date SET DEFAULT CURRENT_DATE;
ALTER TABLE coffee_analytics.bag_predictions ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;

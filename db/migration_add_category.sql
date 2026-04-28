ALTER TABLE sw_clothes
  ADD COLUMN category VARCHAR(32) NOT NULL DEFAULT 'top' AFTER weather;

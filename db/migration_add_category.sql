-- Run once in phpMyAdmin (database u6708134_csc350 → SQL) if sw_clothes already exists without category.
ALTER TABLE sw_clothes
  ADD COLUMN category VARCHAR(32) NOT NULL DEFAULT 'top' AFTER weather;

-- Run once against your CSC350 database (e.g. u6708134_csc350).
CREATE TABLE IF NOT EXISTS sw_users (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sw_clothes (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  name VARCHAR(500) NOT NULL,
  description TEXT,
  weather VARCHAR(20) NOT NULL,
  category VARCHAR(32) NOT NULL DEFAULT 'top',
  img LONGTEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_weather (user_id, weather),
  CONSTRAINT fk_sw_clothes_user FOREIGN KEY (user_id) REFERENCES sw_users (id) ON DELETE CASCADE
);

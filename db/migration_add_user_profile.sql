
ALTER TABLE sw_users
  ADD COLUMN full_name VARCHAR(255) NULL AFTER email;

ALTER TABLE sw_users
  ADD COLUMN bio TEXT NULL AFTER full_name;

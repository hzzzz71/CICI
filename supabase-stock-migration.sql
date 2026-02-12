-- Add stock column (default 100) for existing and future products
alter table products
add column if not exists stock integer not null default 100;

-- Backfill existing rows (safety)
update products
set stock = 100
where stock is null;


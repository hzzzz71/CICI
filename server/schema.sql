create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  price numeric not null,
  image text,
  description text,
  colors text[],
  rating numeric,
  reviews integer,
  is_new boolean default false,
  is_sale boolean default false,
  is_limited boolean default false,
  created_at timestamp with time zone default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  email text,
  total numeric not null,
  status text not null,
  created_at timestamp with time zone default now()
);

create table if not exists profiles (
  id uuid primary key,
  email text,
  display_name text,
  created_at timestamp with time zone default now()
);

create table if not exists addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  type text,
  name text,
  street text,
  city text,
  zip text,
  is_default boolean default false,
  created_at timestamp with time zone default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id text,
  name text,
  price numeric,
  quantity integer,
  size text,
  color text
);

create table if not exists support_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  role text check (role in ('user','support')) default 'user',
  text text,
  created_at timestamp with time zone default now()
);

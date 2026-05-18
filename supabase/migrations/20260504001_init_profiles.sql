-- Crear tabla de perfiles de usuarios
create table if not exists profiles (
  id uuid not null primary key references auth.users on delete cascade,
  username text unique,
  email text unique,
  avatar_url text,
  bio text,
  location text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Crear índices
create index if not exists idx_profiles_username on profiles(username);
create index if not exists idx_profiles_email on profiles(email);

-- Habilitar RLS (Row Level Security)
alter table profiles enable row level security;

-- Política: Usuarios pueden ver todos los perfiles públicamente
create policy "Perfiles are publicly readable"
  on profiles for select
  using (true);

-- Política: Usuarios pueden actualizar solo su propio perfil
create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Política: Usuarios pueden insertar su propio perfil
create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Trigger para actualizar updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_profiles_updated_at on profiles;
create trigger update_profiles_updated_at
  before update on profiles
  for each row
  execute function update_updated_at_column();

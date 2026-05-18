-- Crear tabla maestra de cafés
create table if not exists cafes_master (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  origen text,
  finca text,
  proceso text,
  tueste text,
  imagen_url text,
  descripcion text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Crear índices
create index if not exists idx_cafes_nombre on cafes_master(nombre);
create index if not exists idx_cafes_origen on cafes_master(origen);
create index if not exists idx_cafes_created_at on cafes_master(created_at);

-- Habilitar RLS
alter table cafes_master enable row level security;

-- Política: Todos pueden ver los cafés
create policy "Cafes are publicly readable"
  on cafes_master for select
  using (true);

-- Política: Solo usuarios autenticados pueden insertar
create policy "Authenticated users can insert cafes"
  on cafes_master for insert
  with check (auth.role() = 'authenticated');

-- Trigger para updated_at
drop trigger if exists update_cafes_master_updated_at on cafes_master;
create trigger update_cafes_master_updated_at
  before update on cafes_master
  for each row
  execute function update_updated_at_column();

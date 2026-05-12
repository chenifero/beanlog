-- Crear tabla de catas
create table if not exists tastings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  cafe_id uuid references cafes_master(id) on delete set null,
  puntuacion numeric check (puntuacion >= 0 and puntuacion <= 10),
  notas text,
  radar_data jsonb default '{}',
  foto_url text,
  fecha date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Estructura esperada de radar_data:
-- {
--   "acidez": 8,
--   "cuerpo": 6,
--   "dulzor": 9,
--   "amargor": 3,
--   "aroma": 7,
--   "frutado": 8
-- }

-- Crear índices
create index if not exists idx_tastings_user_id on tastings(user_id);
create index if not exists idx_tastings_cafe_id on tastings(cafe_id);
create index if not exists idx_tastings_created_at on tastings(created_at);
create index if not exists idx_tastings_fecha on tastings(fecha);

-- Índice JSONB para búsquedas en radar_data
create index if not exists idx_tastings_radar_data on tastings using gin(radar_data);

-- Habilitar RLS
alter table tastings enable row level security;

-- Política: Usuarios pueden ver sus propias catas y las públicas de otros
create policy "Users can view own tastings"
  on tastings for select
  using (auth.uid() = user_id);

-- Política: Usuarios pueden insertar sus propias catas
create policy "Users can insert their own tastings"
  on tastings for insert
  with check (auth.uid() = user_id);

-- Política: Usuarios pueden actualizar sus propias catas
create policy "Users can update their own tastings"
  on tastings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Política: Usuarios pueden eliminar sus propias catas
create policy "Users can delete their own tastings"
  on tastings for delete
  using (auth.uid() = user_id);

-- Trigger para updated_at
drop trigger if exists update_tastings_updated_at on tastings;
create trigger update_tastings_updated_at
  before update on tastings
  for each row
  execute function update_updated_at_column();

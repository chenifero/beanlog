-- El trigger asume que profiles tiene updated_at, pero la columna no existe en producción
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

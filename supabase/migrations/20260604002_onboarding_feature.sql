-- Añade campo para rastrear si el usuario completó el onboarding
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- RPC para eliminar datos del usuario (el usuario en auth se elimina desde el frontend)
CREATE OR REPLACE FUNCTION delete_user()
RETURNS void AS $$
BEGIN
  -- Eliminar datos relacionados
  DELETE FROM posts WHERE user_id = auth.uid();
  DELETE FROM comments WHERE user_id = auth.uid();
  DELETE FROM likes WHERE user_id = auth.uid();
  DELETE FROM tastings WHERE user_id = auth.uid();
  DELETE FROM follows WHERE user_id = auth.uid();
  DELETE FROM notifications WHERE recipient_id = auth.uid();
  DELETE FROM saved_posts WHERE user_id = auth.uid();

  -- Eliminar perfil
  DELETE FROM profiles WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

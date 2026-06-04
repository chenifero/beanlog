-- Actualiza la RPC delete_user para no intentar eliminar auth.users
DROP FUNCTION IF EXISTS delete_user();

CREATE FUNCTION delete_user()
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

-- Reescribe delete_user para ser segura ante tablas que no existen
-- Cada bloque ignora errores para no fallar si la tabla tiene otra estructura
CREATE OR REPLACE FUNCTION delete_user()
RETURNS void AS $$
BEGIN
  BEGIN DELETE FROM posts        WHERE user_id        = auth.uid(); EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN DELETE FROM comments     WHERE user_id        = auth.uid(); EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN DELETE FROM likes        WHERE user_id        = auth.uid(); EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN DELETE FROM follows      WHERE user_id        = auth.uid(); EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN DELETE FROM follows      WHERE following_id   = auth.uid(); EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN DELETE FROM notifications WHERE recipient_id  = auth.uid(); EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN DELETE FROM saved_posts  WHERE user_id        = auth.uid(); EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN DELETE FROM tastings     WHERE user_id        = auth.uid(); EXCEPTION WHEN OTHERS THEN NULL; END;

  -- El perfil se borra al final; si tiene CASCADE arrastra lo que quede
  DELETE FROM profiles WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

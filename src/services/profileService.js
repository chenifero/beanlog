// Servicio para leer y actualizar el perfil del usuario en Supabase

import { supabase } from "./supabase";

// Obtiene el perfil completo del usuario por su ID
export const profileService = {
  // Crea el perfil si no existe — seguro llamarlo siempre (upsert con ignore en conflicto)
  async ensureProfile(user) {
    const emailPrefix = (user.email || "")
      .split("@")[0]
      .replace(/[^a-zA-Z0-9_]/g, "")
      .slice(0, 20);
    const username = emailPrefix
      ? `${emailPrefix}_${Math.random().toString(36).slice(2, 6)}`
      : `user_${Math.random().toString(36).slice(2, 8)}`;

    const { error } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        username,
        avatar_url: user.user_metadata?.avatar_url || null,
        created_at: new Date().toISOString(),
      },
      { onConflict: "id", ignoreDuplicates: true },
    );
    if (error) throw error;
  },

  async getProfile(userId) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data;
  },

  // Actualiza los campos del perfil que se le pasen
  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Buscar user por nombre
  async searchUsers(query) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url, bio")
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .limit(20);
    if (error) throw error;
    return data;
  },

  //Obtiene perfil por username para mostrar perfiles públicos
  async getProfileByUsername(username) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .single();
    if (error) throw error;
    return data;
  },

  // Sube una foto de perfil al storage de Supabase y devuelve la URL pública
  async uploadAvatar(userId, file) {
    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

    return data.publicUrl;
  },
};

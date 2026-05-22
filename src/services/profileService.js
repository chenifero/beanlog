// Servicio para leer y actualizar el perfil del usuario en Supabase

import { supabase } from './supabase'

// Obtiene el perfil completo del usuario por su ID
export const profileService = {

  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  },

  // Actualiza los campos del perfil que se le pasen
  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  //Obtiene perfil por username para mostrar perfiles públicos
  async getProfileByUsername(username) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()
  if (error) throw error
  return data
},

  // Sube una foto de perfil al storage de Supabase y devuelve la URL pública
  async uploadAvatar(userId, file) {
    const fileExt = file.name.split('.').pop()
    const filePath = `${userId}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    return data.publicUrl
  }
}
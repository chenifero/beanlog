// Servicio para gestionar las catas del usuario
// Maneja creación, listado, actualización y eliminación

import { supabase } from './supabase'

export const tastingService = {

  // Obtiene todas las catas del usuario con los datos del café
  async getUserTastings(userId) {
    const { data, error } = await supabase
      .from('tastings')
      .select(`
        *,
        cafes_master (
          id,
          nombre,
          marca,
          origen,
          finca,
          proceso,
          tueste,
          sca,
          imagen_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Crea o encuentra el café en cafes_master y luego crea la cata
  async createTasting(userId, cafeData, tastingData) {
    let cafeId = null

    if (cafeData.nombre) {
      const { data: existing } = await supabase
        .from('cafes_master')
        .select('id')
        .ilike('nombre', cafeData.nombre)
        .limit(1)
        .maybeSingle()

      if (existing) {
        cafeId = existing.id
      } else {
        // Si no existe lo crea con todos los datos incluyendo sca
        const { data: newCafe, error: cafeError } = await supabase
          .from('cafes_master')
          .insert({
            nombre: cafeData.nombre,
            marca: cafeData.marca || null,
            origen: cafeData.origen || null,
            finca: cafeData.finca || null,
            proceso: cafeData.proceso || null,
            tueste: cafeData.tueste || null,
            sca: cafeData.sca ? Number(cafeData.sca) : null,
          })
          .select()
          .single()

        if (cafeError) throw cafeError
        cafeId = newCafe.id
      }
    }

    // Crea la cata
    const { data, error } = await supabase
      .from('tastings')
      .insert({
        user_id: userId,
        cafe_id: cafeId,
        puntuacion: tastingData.puntuacion || null,
        notas: tastingData.notas || null,
        radar_data: tastingData.radarData || {},
        fecha: tastingData.fecha || new Date().toISOString().split('T')[0],
        precio: tastingData.precio || null,
        foto_url: tastingData.fotoUrl || null,
        link_compra: tastingData.linkCompra || null,
      })
      .select(`
        *,
        cafes_master (
          id,
          nombre,
          marca,
          origen,
          finca,
          proceso,
          tueste,
          sca
        )
      `)
      .single()

    if (error) throw error
    return data
  },

  // Actualiza una cata existente
  async updateTasting(tastingId, updates) {
    const { data, error } = await supabase
      .from('tastings')
      .update(updates)
      .eq('id', tastingId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Elimina una cata
  async deleteTasting(tastingId) {
    const { error } = await supabase
      .from('tastings')
      .delete()
      .eq('id', tastingId)

    if (error) throw error
  },

  // Sube la foto de la etiqueta al storage
  async uploadLabelPhoto(userId, file) {
    const fileExt = file.name.split('.').pop()
    const filePath = `${userId}/${Date.now()}.${fileExt}`

    const { error } = await supabase.storage
      .from('labels')
      .upload(filePath, file)

    if (error) throw error

    const { data } = supabase.storage
      .from('labels')
      .getPublicUrl(filePath)

    return data.publicUrl
  }
}
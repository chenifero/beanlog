// Servicio para gestionar las cafeterías en el mapa

import { supabase } from './supabase'

export const coffeeShopService = {

  // Obtiene todas las cafeterías
  async getCoffeeShops() {
    const { data, error } = await supabase
      .from('coffee_shops')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Crea una nueva cafetería
  async createCoffeeShop({ nombre, lat, lng, valoracion, notas, ciudad, pais }) {
    const { data, error } = await supabase
      .from('coffee_shops')
      .insert({
        nombre,
        lat,
        lng,
        valoracion: valoracion || null,
        notas: notas || null,
        ciudad: ciudad || null,
        pais: pais || null,
        foto_url: foto_url || null,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Elimina una cafetería
  async deleteCoffeeShop(id) {
    const { error } = await supabase
      .from('coffee_shops')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async uploadFoto(file) {
  const ext = file.name.split('.').pop();
  const path = `${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from('coffee-shops')
    .upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from('coffee-shops').getPublicUrl(path);
  return data.publicUrl;
},




}
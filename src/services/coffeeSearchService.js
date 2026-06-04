// Servicio para buscar información de compra de un café
// Llama a la Edge Function coffee-search que usa SerpAPI

import { supabase } from './supabase'

export const coffeeSearchService = {

  // Busca precio, foto y enlace de compra usando todos los campos disponibles
  async searchCoffee({ nombre, marca, origen, proceso }) {
    const { data, error } = await supabase.functions.invoke('coffee-search', {
      body: { nombre, marca, origen, proceso }
    })

    if (error) throw error
    return data
  }
}

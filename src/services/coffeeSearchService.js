// Servicio para buscar información de compra de un café
// Llama a la Edge Function coffee-search que usa SerpAPI + Groq

import { supabase } from './supabase'

export const coffeeSearchService = {

  // Busca precio, foto y enlace de compra de un café por su nombre
  async searchCoffee(coffeeName) {
    const { data, error } = await supabase.functions.invoke('coffee-search', {
      body: { coffeeName }
    })

    if (error) throw error
    return data
  }
}
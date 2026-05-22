// Servicio para gestionar las cafeterías en el mapa

import { supabase } from "./supabase";

export const coffeeShopService = {
  // Obtiene todas las cafeterías
  async getCoffeeShops() {
    const { data, error } = await supabase
      .from("coffee_shops")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Crea una nueva cafetería
  async uploadFotos(files) {
    const urls = await Promise.all(
      files.map(async (file) => {
        const ext = file.name.split(".").pop();
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage
          .from("coffee-shops")
          .upload(path, file);
        if (error) throw error;
        const { data } = supabase.storage
          .from("coffee-shops")
          .getPublicUrl(path);
        return data.publicUrl;
      }),
    );
    return urls;
  },

  async createCoffeeShop({
    nombre,
    lat,
    lng,
    valoracion,
    notas,
    ciudad,
    pais,
    foto_urls,
  }) {
    const { data, error } = await supabase
      .from("coffee_shops")
      .insert({
        nombre,
        lat,
        lng,
        valoracion: valoracion || null,
        notas: notas || null,
        ciudad: ciudad || null,
        pais: pais || null,
        foto_urls: foto_urls?.length ? foto_urls : null,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Elimina una cafetería
  async deleteCoffeeShop(id) {
    const { error } = await supabase.from("coffee_shops").delete().eq("id", id);

    if (error) throw error;
  },

  async uploadFotos(files) {
    const urls = await Promise.all(
      files.map(async (file) => {
        const ext = file.name.split(".").pop();
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage
          .from("coffee-shops")
          .upload(path, file);
        if (error) throw error;
        const { data } = supabase.storage
          .from("coffee-shops")
          .getPublicUrl(path);
        return data.publicUrl;
      }),
    );
    return urls;
  },
};

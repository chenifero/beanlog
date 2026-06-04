// Edge Function: coffee-search
// Busca el café priorizando la web de la tostadora en los resultados orgánicos.
// Sin paso por LLM — procesa los datos de SerpAPI directamente.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Palabras genéricas del sector que no identifican un tostador concreto
const GENERIC_WORDS = new Set([
  'cafe', 'coffee', 'espresso', 'brew', 'roast', 'roastery',
  'specialty', 'speciality', 'tienda', 'shop', 'store',
])

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

// Devuelve true si la URL parece pertenecer al dominio del tostador.
// Ejemplo: "Nomad Coffee" → busca "nomad" en la URL (ignora "coffee").
function isRoasterSite(url: string, marca: string): boolean {
  if (!marca || !url) return false
  const significantWords = marca
    .toLowerCase()
    .split(/\s+/)
    .map(slugify)
    .filter(w => w.length > 3 && !GENERIC_WORDS.has(w))

  if (significantWords.length === 0) return false

  const urlSlug = slugify(url)
  return significantWords.some(word => urlSlug.includes(word))
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { nombre, marca, origen, proceso } = await req.json()

    if (!nombre) {
      return new Response(
        JSON.stringify({ error: 'nombre es requerido' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const SERPAPI_KEY = Deno.env.get('SERPAPI_KEY')

    // Con marca: query precisa → "Nomad Coffee Ethiopia Natural comprar"
    // Sin marca: añade contexto de especialidad para no mezclar con café de supermercado
    const queryParts = marca
      ? [marca, nombre, 'comprar']
      : [nombre, origen, 'café especialidad comprar'].filter(Boolean)
    const query = queryParts.join(' ')

    console.log('coffee-search query:', query)

    // Google Search normal — devuelve organic_results siempre y
    // shopping_results cuando Google muestra el panel lateral de compras.
    const serpUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&hl=es&gl=es&num=8&api_key=${SERPAPI_KEY}`

    const serpRes = await fetch(serpUrl)
    const serpData = await serpRes.json()

    const organicResults: any[] = serpData.organic_results || []
    const shoppingResults = (serpData.shopping_results || []).slice(0, 5).map((r: any) => ({
      title: r.title,
      price: r.price,
      source: r.source,
      link: r.link,
      thumbnail: r.thumbnail,
    }))

    console.log('organic_results:', organicResults.length)
    console.log('shopping_results:', shoppingResults.length)

    // Prioridad 1 — web del tostador (URL contiene nombre de la marca)
    // Prioridad 2 — cualquier resultado orgánico
    // Prioridad 3 — panel de shopping (si no hay orgánicos)
    const roasterResult = marca
      ? organicResults.find(r => isRoasterSite(r.link, marca))
      : null

    const bestOrganic = roasterResult ?? organicResults[0] ?? null

    let result: any = { found: false, shoppingResults }

    if (bestOrganic) {
      // Si hay panel de shopping, aprovecha su precio (más estructurado que un snippet)
      const shopPrice = shoppingResults[0]?.price ?? null

      result = {
        found: true,
        bestPrice: shopPrice,
        bestLink: bestOrganic.link ?? null,
        bestImage: bestOrganic.thumbnail ?? null,
        source: bestOrganic.displayed_link ?? null,
        isRoasterSite: !!roasterResult,
        shoppingResults,
      }
    } else if (shoppingResults.length > 0) {
      const best = shoppingResults[0]
      result = {
        found: true,
        bestPrice: best.price ?? null,
        bestLink: best.link ?? null,
        bestImage: best.thumbnail ?? null,
        source: best.source ?? null,
        isRoasterSite: false,
        shoppingResults,
      }
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('Error en coffee-search:', err)
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

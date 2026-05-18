// Edge Function: coffee-search
// Recibe el nombre de un café, busca en web con SerpAPI
// y usa Groq para extraer precio, foto y enlace de compra

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Manejo de CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { coffeeName } = await req.json()

    if (!coffeeName) {
      return new Response(
        JSON.stringify({ error: 'coffeeName es requerido' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const SERPAPI_KEY = Deno.env.get('SERPAPI_KEY')
    const GROQ_KEY = Deno.env.get('GROQ_KEY')

    // 1. Busca el café en Google Shopping con SerpAPI
    const searchQuery = `${coffeeName} café especialidad comprar precio`
    const serpUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(searchQuery)}&tbm=shop&hl=es&gl=es&api_key=${SERPAPI_KEY}`

    const serpRes = await fetch(serpUrl)
    const serpData = await serpRes.json()

    // Extrae los primeros 3 resultados de shopping
    const shoppingResults = (serpData.shopping_results || []).slice(0, 3).map((r: any) => ({
      title: r.title,
      price: r.price,
      source: r.source,
      link: r.link,
      thumbnail: r.thumbnail,
    }))

    // Si no hay resultados de shopping, busca resultados orgánicos
    const organicResults = (serpData.organic_results || []).slice(0, 3).map((r: any) => ({
      title: r.title,
      snippet: r.snippet,
      link: r.link,
    }))

    // 2. Usa Groq para procesar y resumir los resultados
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        max_tokens: 500,
        messages: [
          {
            role: 'system',
            content: 'Eres un asistente especializado en café de especialidad. Responde SOLO en JSON válido, sin texto adicional ni markdown.'
          },
          {
            role: 'user',
            content: `Analiza estos resultados de búsqueda para el café "${coffeeName}" y extrae la información más relevante.

Resultados de shopping: ${JSON.stringify(shoppingResults)}
Resultados orgánicos: ${JSON.stringify(organicResults)}

Responde SOLO con este JSON:
{
  "found": true/false,
  "bestPrice": "precio más bajo encontrado o null",
  "priceRange": "rango de precios o null",
  "bestLink": "mejor enlace de compra o null",
  "bestImage": "mejor URL de imagen del producto o null",
  "source": "nombre de la tienda o null",
  "summary": "resumen de 1 frase sobre dónde y a qué precio se puede comprar"
}`
          }
        ]
      })
    })

    const groqData = await groqRes.json()
    const rawContent = groqData.choices?.[0]?.message?.content || '{}'

    // Parsea la respuesta de Groq
    let result
    try {
      result = JSON.parse(rawContent)
      Object.keys(result).forEach(key => {
        if (result[key] === 'null') result[key] = null
      })
    } catch {
      result = { found: false, summary: 'No se encontró información de compra' }
    }

    // Añade los resultados de shopping directos por si el frontend los quiere mostrar
    result.shoppingResults = shoppingResults

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

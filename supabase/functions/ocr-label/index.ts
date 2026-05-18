// Edge Function: ocr-label
// Recibe una imagen en base64 y usa Groq Vision para extraer
// los datos de la etiqueta del café (nombre, origen, proceso, tueste, finca)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { imageBase64, mimeType = 'image/jpeg' } = await req.json()

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'imageBase64 es requerido' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const GROQ_KEY = Deno.env.get('GROQ_KEY')

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${imageBase64}`
                }
              },
              {
                type: 'text',
                text: `Analiza esta etiqueta de café de especialidad y extrae la información. 
Responde SOLO con este JSON sin texto adicional ni markdown:
{
  "nombre": "nombre del café o marca",
  "origen": "país o región de origen",
  "finca": "nombre de la finca si aparece o null",
  "proceso": "proceso de beneficio (lavado, natural, honey, etc.) o null",
  "tueste": "nivel de tueste (claro, medio, oscuro, etc.) o null",
  "variedad": "variedad del café si aparece o null",
  "altitud": "altitud si aparece o null",
  "notas": "notas de cata si aparecen o null"
}`
              }
            ]
          }
        ]
      })
    })

    const groqData = await groqRes.json()
    console.log('Groq raw response:', JSON.stringify(groqData))
    const rawContent = groqData.choices?.[0]?.message?.content || '{}'
    console.log('Raw content:', rawContent)

    // Parsea la respuesta
    let result
    try {
      // Limpia posibles backticks o markdown
      const clean = rawContent.replace(/```json|```/g, '').trim()
      result = JSON.parse(clean)
    } catch {
      result = { error: 'No se pudo extraer información de la etiqueta' }
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('Error en ocr-label:', err)
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

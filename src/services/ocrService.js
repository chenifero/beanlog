// Servicio para escanear etiquetas de café con OCR
// Convierte la imagen a base64 y llama a la Edge Function ocr-label

import { supabase } from './supabase'

export const ocrService = {

  // Convierte un File a base64 y llama a la Edge Function
  async scanLabel(imageFile) {
    // Convierte la imagen a base64
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result.split(',')[1])
      reader.onerror = reject
      reader.readAsDataURL(imageFile)
    })

    const { data, error } = await supabase.functions.invoke('ocr-label', {
      body: {
        imageBase64: base64,
        mimeType: imageFile.type || 'image/jpeg'
      }
    })

    if (error) throw error
    return data
  }
}
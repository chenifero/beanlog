// useShareCard.js
// Hook que captura el ShareCard con html2canvas y lo comparte con Web Share API.
// Si Web Share no está disponible, descarga la imagen directamente.

import { useRef, useState, useCallback } from "react";
import html2canvas from "html2canvas";

export function useShareCard() {
  const cardRef = useRef(null);
  const [sharing, setSharing] = useState(false);

  const share = useCallback(async (filename = "beanlog-share") => {
    if (!cardRef.current) return;
    setSharing(true);

    try {
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,          // necesario para imágenes de Supabase Storage
        allowTaint: false,
        scale: 3,               // escala 3x: 360×640 → 1080×1920 (Instagram Stories)
        backgroundColor: null,
        logging: false,
      });

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.92)
      );

      if (!blob) throw new Error("No se pudo generar la imagen");

      const file = new File([blob], `${filename}.jpg`, { type: "image/jpeg" });

      // Web Share API — disponible en móvil (Chrome Android, Safari iOS 15+)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "BeanLog",
        });
      } else {
        // Fallback: descarga directa en desktop
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${filename}.jpg`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Error al compartir:", err);
      }
    } finally {
      setSharing(false);
    }
  }, []);

  return { cardRef, share, sharing };
}
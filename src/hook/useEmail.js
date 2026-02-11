import { useCallback } from "react";
import { useFetch } from "../api/useFetch";

const useEmail = () => {
  const { postFetch } = useFetch();

  /**
   * Enviar correo con fotos y/o Excel
   * @param {string} destinatario - Email destino
   * @param {string} asunto - Asunto del correo
   * @param {string} mensaje - Texto opcional
   * @param {Array<File|Blob|string>} fotos - Fotos (puede ser base64 o File/Blob)
   * @param {File|Blob|null} excel - Excel opcional
   */
  const enviarCorreo = useCallback(
    async ({ destinatario, asunto, mensaje = "", fotos = [], excel = null }) => {
      if (!destinatario || !asunto) {
        throw new Error("Destinatario y asunto son obligatorios");
      }

      const formData = new FormData();

      // ===== Fotos =====
      fotos.forEach((foto, index) => {
        // Si es base64 lo convertimos a Blob
        let blob = foto;
        if (typeof foto === "string" && foto.startsWith("data:")) {
          const parts = foto.split(",");
          const mime = parts[0].match(/:(.*?);/)[1];
          const binary = atob(parts[1]);
          const array = [];
          for (let i = 0; i < binary.length; i++) array.push(binary.charCodeAt(i));
          blob = new Blob([new Uint8Array(array)], { type: mime });
        }

        formData.append("fotos", blob, `foto_${index + 1}.jpg`);
      });

      // ===== Excel =====
      if (excel instanceof Blob || excel instanceof File) {
        formData.append("excel", excel, "archivo.xlsx");
      }

      // ===== Otros campos =====
      formData.append("destinatario", destinatario);
      formData.append("asunto", asunto);
      formData.append("mensaje", mensaje);

      // ===== LOG para depuración =====
      console.log("📤 FORMDATA ENVIADO a /api/v1/email:");
      for (const [key, value] of formData.entries()) {
        if (value instanceof Blob || value instanceof File) {
          console.log(`📁 ${key} → ${value.name || "blob"} (${value.size} bytes)`);
        } else {
          console.log(`📝 ${key} →`, value);
        }
      }

      // ===== Enviar al backend =====
      const resp = await postFetch("email", formData);

      console.log("⬅️ RESPUESTA backend:", resp);
      return resp;
    },
    [postFetch]
  );

  return { enviarCorreo };
};

export { useEmail };

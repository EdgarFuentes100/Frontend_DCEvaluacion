import { useEffect, useState, useCallback } from "react";
import { useFetch } from "../api/useFetch";

const useRespuestas = (idIntento) => {
  const { getFetch, postFetch } = useFetch();

  const [respuestas, setRespuestas] = useState([]);

  // 🔹 Listar respuestas del intento
  const listarRespuestas = useCallback(async () => {

    console.log("🔥 listarRespuestas ejecutado");
    console.log("👉 idIntento recibido:", idIntento);

    if (!idIntento) {
      console.log("❌ No hay idIntento, no se consulta nada");
      return;
    }

    const res = await getFetch(`respuestas/${idIntento}`);

    console.log("📦 Respuesta del backend:", res);

    if (res.ok) {
      console.log("✅ Datos cargados:", res.datos);
      setRespuestas(res.datos);
    } else {
      console.log("❌ Error al listar respuestas");
    }

  }, [getFetch, idIntento]);

  // 🔹 Guardar o actualizar respuesta
  const guardarRespuesta = async (idPregunta, respuesta) => {

    console.log("📝 Intentando guardar:");
    console.log("idIntento:", idIntento);
    console.log("idPregunta:", idPregunta);
    console.log("respuesta:", respuesta);

    if (!idIntento) {
      console.log("❌ No hay idIntento, no se guarda nada");
      return;
    }

    const res = await postFetch("respuestas", {
      idIntento,
      idPregunta,
      respuesta
    });

    console.log("📦 Respuesta backend al guardar:", res);

    if (res.ok) {
      console.log("✅ Respuesta guardada correctamente");

      setRespuestas(prev => {
        const existe = prev.find(r => r.idPregunta === idPregunta);

        if (existe) {
          console.log("🔄 Actualizando respuesta existente");

          return prev.map(r =>
            r.idPregunta === idPregunta
              ? { ...r, respuesta }
              : r
          );
        }

        console.log("➕ Insertando nueva respuesta");

        return [...prev, { idPregunta, respuesta }];
      });

    } else {
      console.log("❌ Error al guardar respuesta");
    }
  };

  useEffect(() => {
    console.log("🚀 useEffect ejecutado en useRespuestas");
    listarRespuestas();
  }, [listarRespuestas]);

  console.log("📊 Estado actual respuestas:", respuestas);

  return {
    respuestas,
    guardarRespuesta
  };
};

export { useRespuestas };

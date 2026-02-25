import { useEffect, useState, useCallback } from "react";
import { useFetch } from "../api/useFetch";

const useResultados = () => {
  const { getFetch, putFetch } = useFetch();
  const [resultados, setResultados] = useState([]);

  // Listar resultados
  const listarResultados = useCallback(async () => {
    const res = await getFetch("resultados/listar");
    if (res.ok) setResultados(res.datos);
  }, [getFetch]);

  useEffect(() => {
    listarResultados();
  }, [listarResultados]);

  // Guardar resultado de un usuario
  const guardarResultado = async (resultado) => {
    try {
      // Validación simple
      if (!resultado.prueba2 || resultado.aprobado === null) {
        alert("Complete los campos obligatorios antes de guardar");
        return;
      }

      // PUT a la API
      const res = await putFetch(`resultados/${resultado.idUsuario}`, resultado);

      if (res.ok) {
        // Refrescar lista
        listarResultados();
        alert("Resultado guardado correctamente");
      } else {
        alert("Error al guardar resultado");
        console.error(res);
      }
    } catch (err) {
      console.error(err);
      alert("Error inesperado al guardar resultado");
    }
  };

  return { resultados, guardarResultado };
};

export { useResultados };
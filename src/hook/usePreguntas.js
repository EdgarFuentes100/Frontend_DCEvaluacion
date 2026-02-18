import { useEffect, useState, useCallback } from "react";
import { useFetch } from "../api/useFetch";

const usePreguntas = (idPrueba) => {
  const { getFetch } = useFetch();
  const [preguntas, setPreguntas] = useState([]);

  const listarPreguntas = useCallback(async () => {
    const res = await getFetch(`preguntas/${idPrueba}`);
    if (res.ok) setPreguntas(res.datos);
  }, [getFetch, idPrueba]);

  useEffect(() => {
    if (idPrueba) listarPreguntas();
  }, [listarPreguntas, idPrueba]);

  return {
    preguntas
  };
};

export { usePreguntas };

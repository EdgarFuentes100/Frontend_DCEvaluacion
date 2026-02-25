import { useState, useCallback } from "react";
import { useFetch } from "../api/useFetch";

const useHabilidad = () => {
  const { getFetch } = useFetch();
  const [detalles, setDetalles] = useState(null);

  const getDetalles = useCallback(
    async (idUsuario) => {
      const res = await getFetch(`habilidad/${idUsuario}`);
      if (res.ok) setDetalles(res.datos);
    },
    [getFetch]
  );

  return { detalles, getDetalles };
};

export { useHabilidad };
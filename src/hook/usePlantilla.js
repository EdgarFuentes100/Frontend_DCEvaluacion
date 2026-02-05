import { useEffect, useState, useCallback } from "react";
import { useFetch } from "../api/useFetch";

const usePlantilla = () => {
  const { getFetch } = useFetch();

  const [plantillas, setPlantillas] = useState([]);

  const listarPlantillas = useCallback(async () => {
    const res = await getFetch("plantilla/listar");
    console.log("PLANTILLAS:", res.datos);
    if (res.ok) setPlantillas(res.datos);
  }, [getFetch]);

  useEffect(() => {
    listarPlantillas();
  }, [listarPlantillas]);

  return {
    plantillas
  };
};

export { usePlantilla };

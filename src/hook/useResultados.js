import { useEffect, useState, useCallback } from "react";
import { useFetch } from "../api/useFetch";

const useResultados = () => {
  const { getFetch, putFetch } = useFetch();

  const [resultados, setResultados] = useState([]);
  const [errores, setErrores] = useState({});

  /* ===== LISTAR ===== */
  const listarResultados = useCallback(async () => {
    const res = await getFetch("resultados/listar");
    if (res.ok) setResultados(res.datos);
    console.log(res.datos);
  }, [getFetch]);

  useEffect(() => {
    listarResultados();
  }, [listarResultados]);

  /* ===== HANDLE CHANGE EN TABLA ===== */
  const handleChange = (idUsuario, name, value, type, checked) => {
    if (type === "checkbox") {
      value = checked ? 1 : 0;
    }

    setResultados((prev) =>
      prev.map((item) =>
        item.idUsuario === idUsuario
          ? { ...item, [name]: value }
          : item
      )
    );
  };

  /* ===== GUARDAR POR FILA ===== */
  const guardarResultado = async (resultado) => {
    const err = {};

    if (!resultado.prueba1) err.prueba1 = true;
    if (!resultado.prueba2) err.prueba2 = true;
    if (!resultado.prueba3) err.prueba3 = true;

    if (Object.keys(err).length > 0) {
      setErrores(err);
      return;
    }

    const res = await putFetch(
      `resultados/${resultado.idUsuario}`,
      resultado
    );

    if (res.ok) {
      listarResultados();
    }
  };

  return {
    resultados,
    handleChange,
    guardarResultado,
    errores
  };
};

export { useResultados };
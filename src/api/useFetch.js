import { useCallback } from "react";

function useFetch() {
  const urlBase = "https://backend-dcevaluacion.onrender.com/api/v1" || "http://localhost:4000/api/v1/";

  const manejarRespuesta = async (response) => {
    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    let payload = null;

    try {
      payload = isJson ? await response.json() : await response.text();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      const mensaje = (payload && (payload.mensaje || payload.message)) || "Error en el servidor";
      return { ok: false, datos: null, mensaje, status: response.status };
    }

    return {
      ok: true,
      datos: payload && payload.datos ? payload.datos : payload,
      mensaje: payload?.mensaje || null,
      status: response.status,
    };
  };

  const getFetch = useCallback((urlParcial) => {
    return fetch(urlBase + urlParcial, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }).then(manejarRespuesta);
  }, [urlBase]);

  const postFetch = useCallback((urlParcial, datos) => {
    return fetch(urlBase + urlParcial, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
      credentials: "include",
    }).then(manejarRespuesta);
  }, [urlBase]);

  return { getFetch, postFetch };
}

export { useFetch };

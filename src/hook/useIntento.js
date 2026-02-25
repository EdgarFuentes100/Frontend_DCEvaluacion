import { useEffect, useState, useCallback } from "react";
import { useFetch } from "../api/useFetch";

const useIntento = () => {
    const { getFetch, putFetch } = useFetch();

    const [intento, setIntento] = useState(null);

    // 🔹 Obtener intento actual (si tienes endpoint para eso)
    const getIntento = useCallback(async () => {
        const res = await getFetch("intento");

        console.log("intento:", res.datos);

        if (res.ok) setIntento(res.datos);
    }, [getFetch]);

    const finalizarIntento = async (idIntento) => {
        try {
            console.log("Finalizando intento:", idIntento);

            const res = await putFetch(`intento/finalizar/${idIntento}`);

            if (res.ok) {
                console.log("Intento finalizado ");

                // limpiar estado
                setIntento(null);

                // limpiar localStorage
                localStorage.removeItem("intento");

                return true;
            } else {
                console.log("Error al finalizar");
                return false;
            }

        } catch (error) {
            console.error(" Error real:", error);
            return false;
        }
    };

    const actualizarPrueba3 = async (idUsuario) => {
        try {
            const res = await putFetch(`resultados/prueba3/${idUsuario}`);
            if (res.ok) {
                return true;
            } else {
                console.log("Error al finalizar");
                return false;
            }
        } catch (error) {
            console.error(" Error real:", error);
            return false;
        }
    };

    const actualizarPrueba1 = async (idUsuario, resultado) => {
        try {
            console.log("Actualizando prueba1 para usuario", idUsuario, "con:", resultado);

            const res = await putFetch(`resultados/prueba1/${idUsuario}`, resultado);

            if (res.ok) {
                console.log("Actualización exitosa:", res.datos);
                return true;
            } else {
                console.error("Error al actualizar prueba1:", res);
                return false;
            }
        } catch (error) {
            console.error("Error real:", error);
            return false;
        }
    };

    useEffect(() => {
        getIntento();
    }, [getIntento]);

    return {
        intento,
        finalizarIntento,
        actualizarPrueba3,
        actualizarPrueba1
    };
};

export { useIntento };

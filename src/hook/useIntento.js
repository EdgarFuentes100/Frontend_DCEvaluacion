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

    // 🔹 Finalizar intento
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

    useEffect(() => {
        getIntento();
    }, [getIntento]);

    return {
        intento,
        finalizarIntento
    };
};

export { useIntento };

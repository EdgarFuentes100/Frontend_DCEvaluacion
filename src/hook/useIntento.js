import { useEffect, useState, useCallback } from "react";
import { useFetch } from "../api/useFetch";

const useIntento = () => {
    const { getFetch } = useFetch();

    const [intento, setIntento] = useState([]);

    const getIntento = useCallback(async () => {
        const res = await getFetch("intento");
        console.log("intento:", res.datos);
        
        if (res.ok) setIntento(res.datos); 
    }, [getFetch]);

    useEffect(() => {
        getIntento();
    }, [getIntento]);

    return {
        intento 
    };
};

export { useIntento };
import { useState } from "react";
import { useAuthContext } from "./AuthProvider";

/**
 * Hook para manejar login con PIN.
 */
export const useAuth = () => {
    const { login } = useAuthContext();
    const [pin, setPin] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    const handleLogin = async () => {
        setIsLoading(true);
        setErrorMsg(null);
        const result = await login(pin);
        if (!result.success) setErrorMsg(result.message);
        setIsLoading(false);
        return result;
    };

    return { pin, setPin, isLoading, errorMsg, handleLogin };
};

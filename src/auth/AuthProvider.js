import React, { createContext, useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useFetch } from "../api/useFetch";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const { getFetch, postFetch } = useFetch();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [checking, setChecking] = useState(true);
    const [logoutLoading, setLogoutLoading] = useState(false);

    // Verificar sesión al arrancar
    const checkAuth = useCallback(async () => {
        setChecking(true);
        const resp = await getFetch("auth/check");
        if (resp.ok && resp.datos) {
            setUser(resp.datos); // decoded token o usuario completo
        } else {
            setUser(null);
        }
        setChecking(false);
    }, [getFetch]);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // Logout
    const logout = useCallback(async () => {
        if (logoutLoading) return;
        setLogoutLoading(true);
        await postFetch("auth/logout", {}); // backend clearCookie
        setUser(null);
        setLogoutLoading(false);
        navigate("/login", { replace: true });
    }, [postFetch, logoutLoading, navigate]);

    const value = {
        user,
        setUser,
        logout,
        logoutLoading,
        checking,
        checkAuth,
    };

    if (checking) {
        return <div>Cargando...</div>;
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook de conveniencia
export const useAuthContext = () => useContext(AuthContext);

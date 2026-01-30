import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthContext } from "../auth/AuthProvider";

const ProtectedRoute = ({ children }) => {
  const { user, checking } = useAuthContext();

  if (checking) return <div>Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;

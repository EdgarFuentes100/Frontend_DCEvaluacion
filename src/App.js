import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from "./auth/AuthProvider";
import { Login } from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PagePruebas from "./pages/pruebas/PagePruebas";
import PruebaMecanografia from "./pages/pruebas/PruebaMecanografia";
import PruebaExcel from "./pages/pruebas/PruebaExcel";
import PruebaPsicologica from "./pages/pruebas/PruebaPsicologica";

function App() {
  const { user } = useAuthContext();

  return (
    <Routes>
      {/* LOGIN */}
      <Route
        path="/login"
        element={
          !user ? (
            <Login />
          ) : user.rol === "Candidato" ? (
            <Navigate to="/pruebas" replace />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />

      {/* DASHBOARD para cualquier rol EXCEPTO Candidato */}
      <Route
        path="/dashboard/*"
        element={
          user && user.rol !== "Candidato" ? (
            <Dashboard />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* PRUEBAS SOLO para Candidato */}
      <Route
        path="/pruebas/*"
        element={
          user && user.rol === "Candidato" ? (
            <PagePruebas />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/mecanografia/*"
        element={
          user && user.rol === "Candidato" ? (
            <PruebaMecanografia />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/Excel/*"
        element={
          user && user.rol === "Candidato" ? (
            <PruebaExcel />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />


      <Route
        path="/psicologica/*"
        element={
          user && user.rol === "Candidato" ? (
            <PruebaPsicologica />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    

      {/* DEFAULT */}
      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  );
}

export default App;
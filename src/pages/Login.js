import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../auth/AuthProvider";
import { useFetch } from "../api/useFetch";

function Login() {
  const { setUser } = useAuthContext();
  const { postFetch } = useFetch();
  const navigate = useNavigate();

  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (pin.length < 4 || pin.length > 8) return;

    setIsLoading(true);
    setErrorMsg(null);

    const resp = await postFetch("auth/login", { pin });

    if (resp.ok && resp.datos) {
      console.log(resp.datos, "datos");
      setUser(resp.datos);

      if (resp.datos.rol === "Candidato") {
        navigate("/pruebas", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } else {
      setErrorMsg(resp.mensaje || "PIN incorrecto");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light login-container">
      <div className="container-fluid px-3 px-md-4 px-lg-5">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-9 col-xl-8">
            <div className="card shadow-lg border-0 login-card">
              <div className="row g-0 flex-column-reverse flex-md-row">
                {/* Formulario - Ahora primero en móvil */}
                <div className="col-md-6 p-3 p-sm-4 p-md-4 p-lg-5 d-flex flex-column bg-white">
                  <div className="text-center mb-3 mb-sm-4">
                    <div className="login-icon-container">
                      <i className="bi bi-people-fill login-icon"></i>
                    </div>
                    <h1 className="login-title fw-bold">
                      TalentoHumano Pro
                    </h1>
                    <p className="login-subtitle text-muted">
                      Sistema de Gestión de RRHH
                    </p>
                  </div>

                  <form className="mb-3 mb-sm-4" onSubmit={handleSubmit}>
                    <div className="mb-3 mb-sm-4">
                      <label className="form-label fw-medium text-dark mb-2">
                        <i className="bi bi-key me-1"></i>
                        Código de acceso
                      </label>
                      <div className="input-group input-group-lg">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="bi bi-lock text-muted"></i>
                        </span>
                        <input
                          type="text"
                          className={`form-control border-start-0 py-2 py-sm-3 ${errorMsg ? "is-invalid" : ""}`}
                          placeholder="Ingrese su PIN (4-8 dígitos)"
                          value={pin}
                          onChange={(e) =>
                            setPin(
                              e.target.value
                                .replace(/[^A-Za-z0-9]/g, "")
                                .slice(0, 8)
                            )
                          }
                          maxLength={8}
                          autoComplete="off"
                        />
                      </div>
                      {errorMsg && (
                        <div className="invalid-feedback d-block mt-2">
                          <i className="bi bi-exclamation-triangle me-1"></i>
                          {errorMsg}
                        </div>
                      )}
                      <div className="form-text mt-2 small">
                        <i className="bi bi-info-circle me-1"></i>
                        PIN asignado por el departamento de RRHH
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-100 py-2 py-sm-3 fw-medium login-btn"
                      disabled={pin.length < 4 || pin.length > 8 || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Verificando acceso...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-box-arrow-in-right me-2"></i>
                          Acceder al Sistema
                        </>
                      )}
                    </button>
                  </form>

                  <div className="mt-3 text-center">
                    <div className="alert alert-light border small mb-0">
                      <i className="bi bi-shield-check me-1 text-primary"></i>
                      <span className="text-muted">
                        Plataforma segura para gestión de talento humano
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto pt-3 pt-sm-4 border-top border-light">
                    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
                      <button
                        type="button"
                        className="btn btn-link text-decoration-none small text-muted d-flex align-items-center p-0"
                      >
                        <i className="bi bi-headset me-1"></i>
                        <span>Soporte RRHH</span>
                      </button>
                      <span className="badge bg-light text-dark small fw-normal">
                        <i className="bi bi-patch-check me-1"></i>
                        v3.1 • HR Management
                      </span>
                    </div>
                  </div>
                </div>

                {/* Imagen lateral - Oculto en móvil, visible en tablet/desktop */}
                <div className="col-md-6 login-sidebar">
                  <div className="login-sidebar-content position-relative h-100">
                    <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-40"></div>
                    <img
                      src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                      className="w-100 h-100 login-sidebar-img"
                      alt="Equipo de trabajo colaborativo"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = "none";
                        const parent = e.target.parentElement;
                        parent.style.background = "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)";
                      }}
                    />
                    <div className="login-sidebar-text position-absolute bottom-0 start-0 end-0 p-3 p-md-4 text-white">
                      <h2 className="fs-6 fs-sm-5 fw-semibold mb-1 mb-sm-2">
                        <i className="bi bi-graph-up-arrow me-2"></i>
                        Gestión Integral de Talento
                      </h2>
                      <p className="small mb-0 opacity-75 d-none d-sm-block">
                        Reclutamiento, evaluación y desarrollo del capital humano
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos CSS corregidos - usando style tag normal */}
      <style>
        {`
        .login-container {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9f5ff 100%);
          padding: 20px 0;
        }
        
        .login-card {
          border-radius: 16px;
          overflow: hidden;
          max-width: 1000px;
          margin: 0 auto;
        }
        
        .login-icon-container {
          background: linear-gradient(135deg, #1e3c72, #2a5298);
          border-radius: 50%;
          width: 70px;
          height: 70px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }
        
        @media (min-width: 768px) {
          .login-icon-container {
            width: 80px;
            height: 80px;
          }
        }
        
        .login-icon {
          font-size: 1.8rem;
          color: white;
        }
        
        @media (min-width: 768px) {
          .login-icon {
            font-size: 2rem;
          }
        }
        
        .login-title {
          background: linear-gradient(90deg, #1e3c72, #2a5298);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }
        
        @media (min-width: 576px) {
          .login-title {
            font-size: 1.8rem;
          }
        }
        
        @media (min-width: 768px) {
          .login-title {
            font-size: 2rem;
          }
        }
        
        .login-subtitle {
          font-size: 0.9rem;
        }
        
        @media (min-width: 768px) {
          .login-subtitle {
            font-size: 1rem;
          }
        }
        
        .login-btn {
          background: linear-gradient(90deg, #1e3c72, #2a5298);
          border: none;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        
        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(30, 60, 114, 0.3);
        }
        
        .login-btn:disabled {
          opacity: 0.6;
        }
        
        .login-sidebar {
          display: none;
        }
        
        @media (min-width: 768px) {
          .login-sidebar {
            display: block;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          }
        }
        
        .login-sidebar-content {
          min-height: 300px;
        }
        
        @media (min-width: 768px) {
          .login-sidebar-content {
            min-height: 100%;
          }
        }
        
        .login-sidebar-img {
          object-fit: cover;
          min-height: 300px;
        }
        
        @media (min-width: 768px) {
          .login-sidebar-img {
            min-height: 100%;
          }
        }
        
        .login-sidebar-text {
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
          backdrop-filter: blur(2px);
        }
        
        /* Ajustes de padding responsive */
        @media (max-width: 575px) {
          .login-container {
            padding: 10px;
          }
          
          .login-card {
            border-radius: 12px;
          }
        }
        
        /* Para pantallas muy grandes */
        @media (min-width: 1400px) {
          .login-card {
            max-width: 1200px;
          }
          
          .login-title {
            font-size: 2.2rem;
          }
        }
        
        /* Para dispositivos muy pequeños */
        @media (max-width: 374px) {
          .login-icon-container {
            width: 60px;
            height: 60px;
          }
          
          .login-icon {
            font-size: 1.5rem;
          }
          
          .login-title {
            font-size: 1.3rem;
          }
          
          .login-subtitle {
            font-size: 0.8rem;
          }
        }
        `}
      </style>
    </div>
  );
}

export { Login };
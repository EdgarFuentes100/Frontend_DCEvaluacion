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

    // ✅ Permitimos PIN de 4 a 8 caracteres
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
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center bg-light"
      style={{ background: "linear-gradient(135deg, #f8f9fa 0%, #e9f5ff 100%)" }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <div
              className="card shadow-lg border-0 overflow-hidden"
              style={{ borderRadius: "20px" }}
            >
              <div className="row g-0">
                {/* Formulario */}
                <div className="col-md-6 p-4 p-md-5 d-flex flex-column bg-white">
                  <div className="text-center mb-4">
                    <div
                      className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3"
                      style={{ width: "80px", height: "80px" }}
                    >
                      <i className="bi bi-people-fill fs-3 text-primary"></i>
                    </div>
                    <h1
                      className="fw-bold fs-3 text-gradient"
                      style={{
                        background: "linear-gradient(90deg, #1e3c72, #2a5298)",
                        WebkitBackgroundClip: "text",
                        color: "transparent",
                      }}
                    >
                      TalentoHumano Pro
                    </h1>
                    <p className="text-muted small">
                      Sistema de Gestión de Recursos Humanos
                    </p>
                  </div>

                  <form className="mb-4" onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label className="form-label fw-medium text-dark">
                        Código de acceso
                      </label>
                      <div className="input-group">
                        <input
                          type="text"
                          className={`form-control py-3 ${errorMsg ? "is-invalid" : ""}`}
                          placeholder="Ingrese su PIN (4-8 caracteres)"
                          value={pin}
                          onChange={(e) =>
                            setPin(
                              e.target.value
                                .replace(/[^A-Za-z0-9]/g, "") // solo letras y números
                                .slice(0, 8) // máximo 8 caracteres
                            )
                          }
                          maxLength={8}
                          style={{ borderRight: "none" }}
                        />
                        <span
                          className="input-group-text bg-white"
                          style={{ borderLeft: "none" }}
                        >
                          <i className="bi bi-key-fill text-muted"></i>
                        </span>
                        {errorMsg && (
                          <div className="invalid-feedback d-block">{errorMsg}</div>
                        )}
                      </div>
                      <div className="form-text mt-2">
                        <i className="bi bi-info-circle me-1"></i>
                        Use su PIN asignado por el departamento de RRHH
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-100 py-3 fw-medium"
                      disabled={pin.length < 4 || pin.length > 8 || isLoading}
                      style={{
                        transition: "all 0.3s",
                        border: "none",
                        background: "linear-gradient(90deg, #1e3c72, #2a5298)",
                      }}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Verificando...
                        </>
                      ) : (
                        "Acceder al Sistema"
                      )}
                    </button>
                  </form>

                  <div className="mt-3 text-center">
                    <p className="small text-muted mb-2">
                      <i className="bi bi-shield-check me-1"></i>
                      Plataforma segura para gestión de talento humano
                    </p>
                  </div>

                  <div className="mt-auto pt-4 d-flex justify-content-between align-items-center border-top border-light">
                    <button
                      type="button"
                      className="btn btn-link text-decoration-none small text-muted d-flex align-items-center p-0"
                    >
                      <i className="bi bi-headset me-2"></i>
                      Soporte RRHH
                    </button>
                    <span className="badge bg-light text-dark small fw-normal">
                      v3.1 • HR Management
                    </span>
                  </div>
                </div>

                {/* Imagen lateral */}
                <div
                  className="col-md-6 d-none d-md-block position-relative"
                  style={{ background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)" }}
                >
                  <div className="position-absolute w-100 h-100 bg-dark bg-opacity-20"></div>
                  <img
                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80"
                    className="w-100 h-100"
                    style={{ objectFit: "cover" }}
                    alt="Equipo de trabajo colaborativo en recursos humanos"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = "none";
                      e.target.parentElement.style.background =
                        "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)";
                    }}
                  />
                  <div
                    className="position-absolute bottom-0 start-0 end-0 p-4 px-5 text-white"
                    style={{
                      background: "linear-gradient(transparent, rgba(0, 0, 0, 0.7))",
                    }}
                  >
                    <h2 className="fs-5 fw-semibold mb-1">
                      <i className="bi bi-graph-up-arrow me-2"></i>
                      Gestión Integral de Talento
                    </h2>
                    <p className="small mb-0 opacity-75">
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
  );
}

export { Login };

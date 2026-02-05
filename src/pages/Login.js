import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../auth/AuthProvider";
import { useFetch } from "../api/useFetch";

function Login() {
  const { setUser } = useAuthContext();
  const { postFetch } = useFetch();
  const navigate = useNavigate();

  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pin.length < 4 || pin.length > 8) return;

    setLoading(true);
    setError(null);

    const res = await postFetch("auth/login", { pin });

    if (res.ok && res.datos) {
      setUser(res.datos);
      navigate(
        res.datos.rol === "Candidato" ? "/pruebas" : "/dashboard",
        { replace: true }
      );
    } else {
      setError(res.mensaje || "PIN incorrecto");
    }

    setLoading(false);
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">

        {/* ===== FORM ===== */}
        <div className="login-form">
          <div className="text-center mb-4">
            <div className="login-icon">
              <i className="bi bi-diagram-3-fill"></i>
            </div>
            <h1 className="login-title">DROK</h1>
            <p className="login-subtitle">
              Sistema Profesional de Evaluación
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <label className="form-label fw-semibold">
              Código de acceso
            </label>

            <input
              type="text"
              className={`form-control form-control-lg ${
                error ? "is-invalid" : ""
              }`}
              placeholder="Ingrese su PIN"
              value={pin}
              onChange={(e) =>
                setPin(
                  e.target.value.replace(/[^A-Za-z0-9]/g, "").slice(0, 8)
                )
              }
              autoComplete="off"
            />

            {error && (
              <div className="invalid-feedback d-block mt-2">
                {error}
              </div>
            )}

            <button
              className="btn btn-dark btn-lg w-100 mt-4"
              disabled={loading || pin.length < 4}
            >
              {loading ? "Validando acceso..." : "Ingresar"}
            </button>
          </form>

          <div className="login-footer">
            Plataforma corporativa de RRHH • DROK v1.0
          </div>
        </div>

        {/* ===== IMAGE ===== */}
        <div className="login-image">
          <div className="image-overlay"></div>
          <img
            src="https://revistasumma.com/wp-content/uploads/2020/12/mundo-tecnologico.jpg"
            alt="Equipo profesional"
          />
          <div className="image-text">
            <h2>Evaluación objetiva</h2>
            <p>
              Medición estructurada de competencias y desempeño humano.
            </p>
          </div>
        </div>
      </div>

      {/* ===== STYLES ===== */}
      <style>{`
        .login-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(180deg, #f2f4f7, #e6e9ee);
          padding: clamp(1rem, 3vw, 3rem);
        }

        .login-card {
          width: 100%;
          max-width: 1200px;
          min-height: 620px;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          background: #fff;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 30px 60px rgba(0,0,0,.15);
        }

        /* FORM */
        .login-form {
          padding: clamp(2rem, 4vw, 4rem);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .login-icon {
          width: 72px;
          height: 72px;
          background: #111;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          color: #fff;
          font-size: 2rem;
        }

        .login-title {
          font-size: 2.4rem;
          font-weight: 900;
          letter-spacing: .35em;
          color: #111;
        }

        .login-subtitle {
          color: #666;
          font-size: 1rem;
        }

        .login-footer {
          margin-top: auto;
          text-align: center;
          font-size: .85rem;
          color: #888;
        }

        /* IMAGE */
        .login-image {
          position: relative;
          overflow: hidden;
        }

        .login-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,.45);
        }

        .image-text {
          position: absolute;
          bottom: 0;
          padding: 2rem;
          color: #fff;
          z-index: 2;
        }

        .image-text h2 {
          font-size: 1.6rem;
          margin-bottom: .5rem;
        }

        .image-text p {
          font-size: .95rem;
          opacity: .85;
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .login-card {
            grid-template-columns: 1fr;
          }

          .login-image {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

export { Login };

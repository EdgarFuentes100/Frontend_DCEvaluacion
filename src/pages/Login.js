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

          {/* GLOBO */}
          <div className="globe-container">
            <div className="globe"></div>
          </div>

          {/* TITULO */}
          <div className="text-center mb-4">
            <h1 className="login-title">DROK</h1>
            <p className="login-subtitle">
              Convierte habilidades en resultados
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <label className="form-label fw-semibold">
              Código de acceso
            </label>

            <input
              type="password"
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
        /* FIX GLOBAL (CLAVE PARA VERCEL) */
        html, body {
          font-size: 16px;
        }

        .login-wrapper {
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(180deg, #f2f4f7, #e6e9ee);
          padding: 1rem;
        }

        .login-card {
          width: 100%;
          max-width: 1100px;
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
          padding: 3rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        /* GLOBO */
        .globe-container {
          display: flex;
          justify-content: center;
          margin-bottom: .8rem;
        }

        .globe {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background-image: url("https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg");
          background-repeat: repeat-x;
          background-size: cover;
          animation: rotateGlobe 28s linear infinite;
          filter: grayscale(100%) contrast(1.2);
          box-shadow:
            inset -18px 0 30px rgba(0,0,0,.6),
            0 12px 30px rgba(0,0,0,.3);
        }

        @keyframes rotateGlobe {
          from { background-position: 0 center; }
          to { background-position: -1200px center; }
        }

        /* TITULO DROK */
        .login-title {
          font-size: 3.1rem;
          font-weight: 900;
          letter-spacing: .14em;
          text-transform: uppercase;
          color: #000;
          margin-bottom: .2rem;

          /* BORDE BLANCO + SOMBRA */
          text-shadow:
            -1px -1px 0 #fff,
            1px -1px 0 #fff,
            -1px  1px 0 #fff,
            1px  1px 0 #fff,
            0 8px 16px rgba(0,0,0,.35);
        }

        .login-subtitle {
          color: #555;
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

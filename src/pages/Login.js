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
        
        {/* ===== COLUMNA FORMULARIO ===== */}
        <div className="login-form">
          <div className="globe-container">
            <div className="globe"></div>
          </div>

          <div className="text-center mb-4">
            <h1 className="login-title">DROK</h1>
            <p className="login-subtitle">
              Convierte habilidades en resultados
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <label className="form-label fw-semibold mb-2">
              Código de acceso
            </label>

            <input
              type="password"
              className={`form-control form-control-lg ${error ? "is-invalid" : ""}`}
              placeholder="Ingrese su PIN"
              value={pin}
              onChange={(e) =>
                setPin(e.target.value.replace(/[^A-Za-z0-9]/g, "").slice(0, 8))
              }
              autoComplete="off"
            />

            {error && (
              <div className="invalid-feedback d-block mt-2">
                {error}
              </div>
            )}

            <button
              className="btn btn-dark btn-lg w-100 mt-4 py-3"
              disabled={loading || pin.length < 4}
            >
              {loading ? "Validando acceso..." : "Ingresar"}
            </button>
          </form>

          <div className="login-footer">
            Plataforma corporativa de RRHH • DROK v1.0
          </div>
        </div>

        {/* ===== COLUMNA IMAGEN ===== */}
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

      <style>{`
        /* RESET DE ESCALA */
        .login-wrapper * {
          box-sizing: border-box;
        }

        .login-wrapper {
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(180deg, #f8f9fa, #e9ecef);
          padding: 20px;
        }

        .login-card {
          width: 100%;
          max-width: 1000px; /* Reducido un poco para evitar gigantismo */
          background: #ffffff;
          border-radius: 20px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0,0,0,0.1);
          min-height: 600px;
        }

        /* FORMULARIO */
        .login-form {
          padding: 40px 60px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .globe-container {
          display: flex;
          justify-content: center;
          margin-bottom: 15px;
        }

        .globe {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background-image: url("https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg");
          background-repeat: repeat-x;
          background-size: cover;
          animation: rotateGlobe 30s linear infinite;
          filter: grayscale(100%) brightness(0.8);
          box-shadow: inset -10px 0 20px rgba(0,0,0,0.4), 0 10px 20px rgba(0,0,0,0.2);
        }

        @keyframes rotateGlobe {
          from { background-position: 0 center; }
          to { background-position: -1200px center; }
        }

        .login-title {
          font-size: 3rem;
          font-weight: 900;
          letter-spacing: 5px;
          color: #000;
          margin: 0;
          text-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        .login-subtitle {
          color: #6c757d;
          font-size: 0.95rem;
        }

        .login-footer {
          margin-top: 40px;
          font-size: 0.75rem;
          color: #adb5bd;
          text-align: center;
        }

        /* IMAGEN */
        .login-image {
          position: relative;
          background: #000;
        }

        .login-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.8;
        }

        .image-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.7));
        }

        .image-text {
          position: absolute;
          bottom: 40px;
          left: 40px;
          right: 40px;
          color: #fff;
          z-index: 2;
        }

        .image-text h2 { font-weight: 700; font-size: 1.8rem; }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .login-card {
            grid-template-columns: 1fr;
            max-width: 500px;
          }
          .login-image { display: none; }
          .login-form { padding: 40px 30px; }
        }
      `}</style>
    </div>
  );
}

export { Login };
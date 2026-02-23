import React, { useState } from 'react';
import { usePreguntas } from '../../hook/usePreguntas';
import { useRespuestas } from '../../hook/useRespuestas';
import { useAuthContext } from "../../auth/AuthProvider";
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useNavigate } from 'react-router-dom';
import { useIntento } from '../../hook/useIntento';

function PruebaPsicologica() {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const { finalizarIntento } = useIntento();

  const idPrueba = 3; // psicológica
  const { preguntas } = usePreguntas(idPrueba);

  // Obtener intento desde localStorage
  const intento = JSON.parse(localStorage.getItem("intento"));
  const idIntento = intento?.idIntento;

  // Hook de respuestas conectado a BD
  const { respuestas, guardarRespuesta } = useRespuestas(idIntento);

  const [paginaActual, setPaginaActual] = useState(0);

  if (!preguntas.length) return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <Header user={user} logout={logout} showLogout={false} />
      <div className="container-fluid py-5 flex-grow-1 d-flex justify-content-center align-items-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-muted">Cargando preguntas...</p>
        </div>
      </div>
      <Footer />
    </div>
  );

  // Paginación
  const preguntasPorPagina = 10;
  const totalPaginas = Math.ceil(preguntas.length / preguntasPorPagina);
  const inicio = paginaActual * preguntasPorPagina;
  const fin = inicio + preguntasPorPagina;
  const preguntasActuales = preguntas.slice(inicio, fin);

  // ✅ Guardar respuesta en BD con peso y porcentaje calculado
  const handleChange = (idPregunta, valorRespuesta) => {
    // Buscar la pregunta para obtener pesoImportancia y maximo
    const pregunta = preguntas.find(p => p.idPregunta === idPregunta);
    
    if (!pregunta) return;
    
    // Calcular peso y porcentaje
    const peso = pregunta.pesoImportancia * valorRespuesta; // pesoImportancia * respuesta
    const porcentaje = (peso / pregunta.maximo) * 100; // (peso / maximo) * 100
    
    console.log(`📊 Pregunta ${idPregunta}:`, {
      respuesta: valorRespuesta,
      pesoImportancia: pregunta.pesoImportancia,
      maximo: pregunta.maximo,
      pesoCalculado: peso,
      porcentajeCalculado: Math.round(porcentaje * 100) / 100 + '%'
    });
    
    // Guardar con peso y porcentaje calculados
    guardarRespuesta(idPregunta, valorRespuesta, peso, porcentaje);
  };

  const siguiente = () => {
    if (paginaActual < totalPaginas - 1) {
      setPaginaActual(paginaActual + 1);
      window.scrollTo(0, 0);
    }
  };

  const anterior = () => {
    if (paginaActual > 0) {
      setPaginaActual(paginaActual - 1);
      window.scrollTo(0, 0);
    }
  };

  const finalizar = async () => {
    if (!pruebaCompleta) {
      alert("Debes responder todas las preguntas antes de finalizar.");
      return;
    }

    if (!idIntento) {
      alert("No se encontró el intento activo.");
      return;
    }

    try {
      console.log("Finalizando intento:", idIntento);
      console.log("Respuestas guardadas:", respuestas);

      const ok = await finalizarIntento(idIntento);

      if (ok) {
        console.log("Intento finalizado correctamente");
        alert("Prueba finalizada correctamente");

        // limpiar localStorage
        localStorage.removeItem("intento");

        // redirigir
        navigate("/pruebas");
      } else {
        alert("Error al finalizar la prueba.");
      }
    } catch (error) {
      console.error("Error real:", error);
      alert("Error del servidor.");
    }
  };

  // Verificaciones
  const paginaCompleta = preguntasActuales.every(
    p => respuestas.find(r => r.idPregunta === p.idPregunta)
  );

  const pruebaCompleta = preguntas.every(
    p => respuestas.find(r => r.idPregunta === p.idPregunta)
  );

  const preguntasRespondidas = respuestas.length;
  const progreso = (preguntasRespondidas / preguntas.length) * 100;

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <Header user={user} logout={logout} showLogout={false} />

      <main className="container-fluid px-4 px-xl-5 py-4 flex-grow-1">
        {/* PROGRESO */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="bg-white rounded-3 shadow-sm p-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-semibold">Progreso total</span>
                <span className="text-primary fw-semibold">
                  {preguntasRespondidas}/{preguntas.length} preguntas
                </span>
              </div>
              <div className="progress" style={{ height: "8px" }}>
                <div
                  className="progress-bar bg-primary"
                  role="progressbar"
                  style={{ width: `${progreso}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ENCABEZADO */}
        <div className="row mb-3">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Prueba Psicológica</h4>
              <div className="bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-3">
                <span className="fw-semibold">
                  Página {paginaActual + 1} de {totalPaginas}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* PREGUNTAS */}
        <div className="row g-4">
          {preguntasActuales.map((pregunta, index) => {
            const respuestaGuardada = respuestas.find(
              r => r.idPregunta === pregunta.idPregunta
            );
            
            return (
              <div key={pregunta.idPregunta} className="col-xl-6">
                <div className="bg-white rounded-3 shadow-sm h-100 p-4">
                  <div className="d-flex gap-3">
                    <div
                      className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: "40px", height: "40px" }}
                    >
                      <span className="fw-bold">{inicio + index + 1}</span>
                    </div>

                    <div className="flex-grow-1">
                      <p className="fw-medium mb-4">{pregunta.pregunta}</p>

                      <div className="d-flex justify-content-between bg-light rounded-3 p-3">
                        {[1, 2, 3, 4, 5].map((valor) => (
                          <label
                            key={valor}
                            className="d-flex flex-column align-items-center gap-2"
                            style={{ cursor: "pointer" }}
                          >
                            <input
                              type="radio"
                              name={`pregunta-${pregunta.idPregunta}`}
                              checked={respuestaGuardada?.respuesta === valor}
                              onChange={() =>
                                handleChange(pregunta.idPregunta, valor)
                              }
                              className="form-check-input m-0"
                              style={{ width: "20px", height: "20px" }}
                            />
                            <span
                              className={`fw-semibold ${respuestaGuardada?.respuesta === valor
                                ? "text-primary"
                                : "text-muted"
                                }`}
                            >
                              {valor}
                            </span>
                          </label>
                        ))}
                      </div>

                      <div className="d-flex justify-content-between mt-2 px-2">
                        <span className="small text-muted">Nada de acuerdo</span>
                        <span className="small text-muted">
                          Totalmente de acuerdo
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* NAVEGACIÓN */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="bg-white rounded-3 shadow-sm p-3">
              <div className="d-flex justify-content-between align-items-center">
                <button
                  className="btn btn-outline-secondary px-4"
                  onClick={anterior}
                  disabled={paginaActual === 0}
                >
                  ← Anterior
                </button>

                {paginaActual === totalPaginas - 1 ? (
                  <button
                    className="btn btn-success px-4"
                    onClick={finalizar}
                    disabled={!pruebaCompleta}
                  >
                    Finalizar
                  </button>
                ) : (
                  <button
                    className="btn btn-primary px-4"
                    onClick={siguiente}
                    disabled={!paginaCompleta}
                  >
                    Siguiente →
                  </button>
                )}
              </div>

              {!paginaCompleta && paginaActual !== totalPaginas - 1 && (
                <div className="text-center mt-3">
                  <small className="text-warning">
                    ⚠️ Responde todas las preguntas para continuar
                  </small>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default PruebaPsicologica;
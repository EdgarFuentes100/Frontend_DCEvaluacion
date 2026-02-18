import React, { useState } from 'react';
import { usePreguntas } from '../../hook/usePreguntas';
import { useAuthContext } from "../../auth/AuthProvider";
import Header from '../../components/Header';
import Footer from '../../components/Footer';

function PruebaPsicologica() {
  const { user, logout } = useAuthContext();

  const idPrueba = 3; // psicológica
  const { preguntas } = usePreguntas(idPrueba); // Carga 50 preguntas

  const [paginaActual, setPaginaActual] = useState(0);
  const [respuestas, setRespuestas] = useState({});

  if (!preguntas.length) return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <Header user={user} logout={logout} showLogout={false} />
      <div className="container-fluid py-5 flex-grow-1 d-flex justify-content-center align-items-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-muted">Cargando 50 preguntas...</p>
        </div>
      </div>
      <Footer />
    </div>
  );

  // Configuración de paginación
  const preguntasPorPagina = 10;
  const totalPaginas = Math.ceil(preguntas.length / preguntasPorPagina);
  const inicio = paginaActual * preguntasPorPagina;
  const fin = inicio + preguntasPorPagina;
  const preguntasActuales = preguntas.slice(inicio, fin);

  const handleChange = (idPregunta, valor) => {
    setRespuestas({
      ...respuestas,
      [idPregunta]: valor
    });
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

  const finalizar = () => {
    console.log('Respuestas completas:', respuestas);
    // navigate('/resultados');
  };

  // Verificar si todas las preguntas de la página actual tienen respuesta
  const paginaCompleta = preguntasActuales.every(
    p => respuestas[p.idPregunta]
  );

  // Verificar si todas las 50 preguntas tienen respuesta
  const pruebaCompleta = preguntas.every(
    p => respuestas[p.idPregunta]
  );

  // Calcular progreso total
  const preguntasRespondidas = Object.keys(respuestas).length;
  const progreso = (preguntasRespondidas / preguntas.length) * 100;

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <Header user={user} logout={logout} showLogout={false} />

      <main className="container-fluid px-4 px-xl-5 py-4 flex-grow-1">
        {/* Barra de progreso simplificada - ANCHO COMPLETO */}
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

        {/* Encabezado de página - ANCHO COMPLETO */}
        <div className="row mb-3">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Prueba Psicológica</h4>
              <div className="bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-3">
                <span className="fw-semibold">Página {paginaActual + 1} de {totalPaginas}</span>
                <span className="mx-2">|</span>
                <span>Preguntas {inicio + 1}-{Math.min(fin, preguntas.length)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Preguntas actuales - DISTRIBUIDAS EN COLUMNAS */}
        <div className="row g-4">
          {preguntasActuales.map((pregunta, index) => (
            <div key={pregunta.idPregunta} className="col-xl-6">
              <div className="bg-white rounded-3 shadow-sm h-100 p-4">
                <div className="d-flex gap-3">
                  <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" 
                       style={{ width: "40px", height: "40px" }}>
                    <span className="fw-bold">{inicio + index + 1}</span>
                  </div>
                  <div className="flex-grow-1">
                    <p className="fw-medium mb-4">{pregunta.pregunta}</p>
                    
                    {/* Escala de 1-5 horizontal */}
                    <div className="d-flex justify-content-between bg-light rounded-3 p-3">
                      {[1, 2, 3, 4, 5].map((valor) => (
                        <label key={valor} className="d-flex flex-column align-items-center gap-2" 
                               style={{ cursor: "pointer" }}>
                          <input
                            type="radio"
                            name={`pregunta-${pregunta.idPregunta}`}
                            value={valor}
                            checked={respuestas[pregunta.idPregunta] === valor.toString()}
                            onChange={(e) => handleChange(pregunta.idPregunta, e.target.value)}
                            className="form-check-input m-0"
                            style={{ width: "20px", height: "20px", cursor: "pointer" }}
                          />
                          <span className={`fw-semibold ${
                            respuestas[pregunta.idPregunta] === valor.toString() 
                              ? 'text-primary' 
                              : 'text-muted'
                          }`}>
                            {valor}
                          </span>
                        </label>
                      ))}
                    </div>

                    {/* Etiquetas de escala */}
                    <div className="d-flex justify-content-between mt-2 px-2">
                      <span className="small text-muted">Nada de acuerdo</span>
                      <span className="small text-muted">Totalmente de acuerdo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navegación - ANCHO COMPLETO */}
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

                <div className="d-flex gap-2">
                  {Array.from({ length: totalPaginas }, (_, i) => (
                    <button
                      key={i}
                      className={`btn ${
                        i === paginaActual ? 'btn-primary' : 'btn-outline-primary'
                      }`}
                      onClick={() => setPaginaActual(i)}
                      style={{ width: "40px" }}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

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
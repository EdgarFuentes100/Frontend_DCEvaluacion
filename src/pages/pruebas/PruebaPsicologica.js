import React, { useState, useEffect, useCallback } from 'react';
import { usePreguntas } from '../../hook/usePreguntas';
import { useRespuestas } from '../../hook/useRespuestas';
import { useAuthContext } from "../../auth/AuthProvider";
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useNavigate } from 'react-router-dom';
import { useIntento } from '../../hook/useIntento';
import { useCamara } from '../../hook/useCamara';
import { useEmail } from '../../hook/useEmail';
import ModalConfirm from '../../components/ModalConfirm';

function PruebaPsicologica() {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const { finalizarIntento } = useIntento();
  const { enviarCorreo } = useEmail();

  const idPrueba = 3; // psicológica
  const { preguntas } = usePreguntas(idPrueba);

  // Cámara
  const { videoRef, canvasRef, fotos, startCamera, stopCamera } = useCamara(30);

  // Temporizador
  const [tiempoRestante, setTiempoRestante] = useState(() => {
    const tiempoGuardado = localStorage.getItem('tiempoRestantePsicologica');
    const timestampGuardado = localStorage.getItem('tiempoTimestampPsicologica');

    if (tiempoGuardado && timestampGuardado) {
      const tiempo = parseInt(tiempoGuardado);
      const timestamp = parseInt(timestampGuardado);
      const ahora = Date.now();
      const segundosPasados = Math.floor((ahora - timestamp) / 1000);
      return Math.max(0, tiempo - segundosPasados);
    }

    return 2400; // 40 minutos
  });

  const [tiempoFormateado, setTiempoFormateado] = useState(() => {
    const tiempoGuardado = localStorage.getItem('tiempoRestantePsicologica');
    if (tiempoGuardado) {
      const tiempo = parseInt(tiempoGuardado);
      const mins = Math.floor(tiempo / 60);
      const segs = tiempo % 60;
      return `${mins.toString().padStart(2,'0')}:${segs.toString().padStart(2,'0')}`;
    }
    return '40:00';
  });

  const [isTimerActive, setIsTimerActive] = useState(true);
  const [paginaActual, setPaginaActual] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showModalEnviar, setShowModalEnviar] = useState(false);

  // Obtener intento
  const intento = JSON.parse(localStorage.getItem("intento"));
  const idIntento = intento?.idIntento;

  // Hook de respuestas
  const { respuestas, guardarRespuesta } = useRespuestas(idIntento);

  // Iniciar cámara
  useEffect(() => {
    const iniciarCamara = async () => {
      try {
        await startCamera();
        console.log("📸 Cámara iniciada");
      } catch (error) {
        console.warn("Cámara no disponible:", error);
      }
    };
    iniciarCamara();
  }, [startCamera]);

  // Formatear tiempo
  const formatearTiempo = useCallback((segundos) => {
    const mins = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${mins.toString().padStart(2,'0')}:${segs.toString().padStart(2,'0')}`;
  }, []);

  // Finalizar por tiempo
  const finalizarPorTiempo = useCallback(() => {
    console.log("⏰ Tiempo agotado");
    setIsTimerActive(false);
    stopCamera();
    setIsFinished(true);
    setShowModalEnviar(true);

    localStorage.removeItem('tiempoRestantePsicologica');
    localStorage.removeItem('tiempoTimestampPsicologica');
  }, [stopCamera]);

  // Guardar tiempo cada segundo
  useEffect(() => {
    if (isTimerActive && !isFinished) {
      const interval = setInterval(() => {
        localStorage.setItem('tiempoRestantePsicologica', tiempoRestante.toString());
        localStorage.setItem('tiempoTimestampPsicologica', Date.now().toString());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [tiempoRestante, isTimerActive, isFinished]);

  // Temporizador
  useEffect(() => {
    if (!isTimerActive || isFinished) return;

    const interval = setInterval(() => {
      setTiempoRestante(prev => {
        const nuevoTiempo = prev - 1;
        setTiempoFormateado(formatearTiempo(nuevoTiempo));
        if (nuevoTiempo <= 0) {
          clearInterval(interval);
          finalizarPorTiempo();
        }
        return nuevoTiempo;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerActive, isFinished, formatearTiempo, finalizarPorTiempo]);

  // Preparar datos de envío
  const prepararDatosEnvio = () => ({
    prueba: "Psicológica",
    usuario: { id: user?.id, nombre: user?.nombre, email: user?.email },
    resultados: {
      preguntasRespondidas: respuestas.length,
      totalPreguntas: preguntas.length,
      tiempoUtilizado: 2400 - tiempoRestante,
      tiempoTotal: 2400,
      fecha: new Date().toISOString()
    },
    respuestas,
    fotos,
    idIntento
  });

  // Enviar resultados
  const enviarResultados = async () => {
    try {
      const datos = prepararDatosEnvio();
      console.log("📤 Enviando resultados", datos);

      await enviarCorreo({
        destinatario: "bernabefuentes139@gmail.com",
        asunto: `Prueba Psicológica - ${user?.nombre}`,
        mensaje: "📋 Prueba finalizada",
        fotos,
        excel: null
      });

      await finalizarIntento(idIntento);

      localStorage.removeItem("intento");
      localStorage.removeItem('tiempoRestantePsicologica');
      localStorage.removeItem('tiempoTimestampPsicologica');

      navigate('/pruebas');
    } catch (error) {
      console.error("❌ Error al enviar:", error);
      alert("❌ Error al enviar los resultados");
    } finally {
      setShowModalEnviar(false);
    }
  };

  // Limpiar cámara al salir
  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  if (!preguntas.length) {
    return (
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
  }

  // Paginación
  const preguntasPorPagina = 10;
  const totalPaginas = Math.ceil(preguntas.length / preguntasPorPagina);
  const inicio = paginaActual * preguntasPorPagina;
  const preguntasActuales = preguntas.slice(inicio, inicio + preguntasPorPagina);
  const preguntasRespondidas = respuestas.length;
  const todasRespondidas = preguntasRespondidas === preguntas.length;
  const paginaCompleta = preguntasActuales.every(p => respuestas.find(r => r.idPregunta === p.idPregunta));
  const progreso = (preguntasRespondidas / preguntas.length) * 100;
  const tiempoTranscurrido = 2400 - tiempoRestante;
  const minutosTranscurridos = Math.floor(tiempoTranscurrido / 60);
  const segundosTranscurridos = tiempoTranscurrido % 60;

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <Header user={user} logout={logout} showLogout={false} />

      <video ref={videoRef} autoPlay playsInline className="d-none" />
      <canvas ref={canvasRef} className="d-none" />

      <main className="container-fluid px-4 px-xl-5 py-4 flex-grow-1">
        {/* Progreso */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="bg-white rounded-3 shadow-sm p-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-semibold">Progreso de preguntas</span>
                <div>
                  <span className="text-danger fw-bold me-3">⏱️ {tiempoFormateado}</span>
                  <span className="text-primary fw-semibold">{preguntasRespondidas}/{preguntas.length}</span>
                </div>
              </div>
              <div className="progress" style={{ height: "8px" }}>
                <div className="progress-bar bg-primary" role="progressbar" style={{ width: `${progreso}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Preguntas */}
        <div className="row g-4">
          {preguntasActuales.map((pregunta, index) => {
            const respuestaGuardada = respuestas.find(r => r.idPregunta === pregunta.idPregunta);
            return (
              <div key={pregunta.idPregunta} className="col-xl-6">
                <div className="bg-white rounded-3 shadow-sm h-100 p-4">
                  <div className="d-flex gap-3">
                    <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width:"40px", height:"40px" }}>
                      <span className="fw-bold">{inicio + index + 1}</span>
                    </div>
                    <div className="flex-grow-1">
                      <p className="fw-medium mb-4">{pregunta.pregunta}</p>
                      <div className="d-flex justify-content-between bg-light rounded-3 p-3">
                        {[1,2,3,4,5].map(valor => (
                          <label key={valor} className="d-flex flex-column align-items-center gap-2" style={{cursor:'pointer'}}>
                            <input
                              type="radio"
                              name={`pregunta-${pregunta.idPregunta}`}
                              checked={respuestaGuardada?.respuesta === valor}
                              onChange={() => guardarRespuesta(pregunta.idPregunta, valor)}
                              className="form-check-input m-0"
                              style={{width:"20px",height:"20px"}}
                            />
                            <span className={`fw-semibold ${respuestaGuardada?.respuesta === valor ? "text-primary":"text-muted"}`}>{valor}</span>
                          </label>
                        ))}
                      </div>
                      <div className="d-flex justify-content-between mt-2 px-2">
                        <span className="small text-muted">Nada de acuerdo</span>
                        <span className="small text-muted">Totalmente de acuerdo</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Navegación */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="bg-white rounded-3 shadow-sm p-3 d-flex justify-content-between">
              <button className="btn btn-outline-secondary px-4" onClick={() => setPaginaActual(p => Math.max(0,p-1))} disabled={paginaActual===0}>← Anterior</button>
              {paginaActual === totalPaginas-1 ? (
                todasRespondidas ? (
                  <button className="btn btn-success btn-lg px-5" onClick={() => setShowModalEnviar(true)}>FINALIZAR PRUEBA</button>
                ) : (
                  <button className="btn btn-secondary btn-lg px-5" disabled>Faltan preguntas por responder</button>
                )
              ) : (
                <button className="btn btn-primary px-4" onClick={() => setPaginaActual(p => p+1)} disabled={!paginaCompleta}>Siguiente →</button>
              )}
            </div>
          </div>
        </div>
      </main>

      <ModalConfirm
        show={showModalEnviar}
        titulo="Confirmar Envío - Prueba Psicológica"
        mensaje={`¿Deseas enviar los resultados de la prueba psicológica?`}
        contenidoExtra={
          <div className="mt-3 p-3 bg-light rounded-3">
            <p className="mb-2 fw-bold">Resumen final:</p>
            <ul className="list-unstyled mb-0">
              <li>✓ Preguntas respondidas: {preguntasRespondidas}/{preguntas.length}</li>
              <li>✓ Tiempo utilizado: {minutosTranscurridos}:{segundosTranscurridos.toString().padStart(2,'0')}</li>
              <li>✓ Fotos capturadas: {fotos.length}</li>
              <li>✓ Prueba: Psicológica</li>
              <li>✓ Usuario: {user?.nombre}</li>
            </ul>
          </div>
        }
        confirmText="Sí, enviar resultados"
        cancelText="Cancelar"
        onCancel={() => setShowModalEnviar(false)}
        onConfirm={enviarResultados}
      />

      <Footer />
    </div>
  );
}

export default PruebaPsicologica;
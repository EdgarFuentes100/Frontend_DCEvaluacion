import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCamara } from '../../hook/useCamara';
import { useAuthContext } from "../../auth/AuthProvider";
import { useEmail } from '../../hook/useEmail';
import { useIntento } from '../../hook/useIntento';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ModalConfirm from '../../components/ModalConfirm';

function PruebaMecanografia() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { enviarCorreo } = useEmail();
  const { videoRef, canvasRef, fotos, isCameraActive, startCamera, stopCamera } = useCamara(30);
  const { finalizarIntento } = useIntento();
  const inputRef = useRef(null);

  const [textoOriginal, setTextoOriginal] = useState('');
  const [textoUsuario, setTextoUsuario] = useState('');
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estadisticas, setEstadisticas] = useState({
    pulsacionesTotales: 0,
    errores: 0,
    palabrasPorMinuto: 0,
    precision: 100
  });
  const [showModalEnviar, setShowModalEnviar] = useState(false);

  const TIEMPO_MAXIMO = 10; // segundos
  const textosMuestra = [
    "La programación es una habilidad esencial en la era digital...",
    "JavaScript es un lenguaje versátil que se utiliza para crear páginas web...",
    "React es una biblioteca de JavaScript para construir interfaces de usuario..."
  ];

  // --- Iniciar prueba ---
  const iniciarPrueba = useCallback(async () => {
    const textoAleatorio = textosMuestra[Math.floor(Math.random() * textosMuestra.length)];
    setTextoOriginal(textoAleatorio);
    setTextoUsuario('');
    setTiempoTranscurrido(0);
    setIsActive(true);
    setIsFinished(false);
    try { await startCamera(); } catch { console.warn('Cámara no disponible'); }
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [startCamera]);

  // --- Finalizar prueba ---
  const finalizarPrueba = useCallback(() => {
    setIsActive(false);
    setIsFinished(true);
    stopCamera();

    const intento = JSON.parse(localStorage.getItem("intento"));
    const idIntento = intento?.idIntento;
    if (idIntento) finalizarIntento(idIntento);

    localStorage.removeItem('pruebaMecanografia');
  }, [stopCamera, finalizarIntento]);

  // --- Recuperar datos del localStorage ---
  useEffect(() => {
    const savedData = localStorage.getItem('pruebaMecanografia');
    if (savedData) {
      const { textoOriginal, textoUsuario, tiempoTranscurrido, estadisticas } = JSON.parse(savedData);
      setTextoOriginal(textoOriginal);
      setTextoUsuario(textoUsuario);
      setTiempoTranscurrido(tiempoTranscurrido);
      setEstadisticas(estadisticas);
      setIsActive(true);
      setTimeout(() => inputRef.current?.focus(), 50);
      startCamera().catch(() => console.warn('Cámara no disponible'));
    } else {
      iniciarPrueba();
    }
    return () => stopCamera();
  }, [iniciarPrueba, startCamera, stopCamera]);

  // --- Cronómetro ---
  useEffect(() => {
    if (!isActive || isFinished) return;

    const interval = setInterval(() => {
      setTiempoTranscurrido(prev => {
        const nuevo = prev + 0.1;

        localStorage.setItem('pruebaMecanografia', JSON.stringify({
          textoOriginal,
          textoUsuario,
          tiempoTranscurrido: nuevo,
          estadisticas
        }));

        if (nuevo >= TIEMPO_MAXIMO) {
          finalizarPrueba();
          return TIEMPO_MAXIMO;
        }
        return nuevo;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, isFinished, textoOriginal, textoUsuario, estadisticas, finalizarPrueba]);

  // --- Manejo de escritura ---
  const handleTextChange = (e) => {
    if (!isActive || isFinished) return;
    const valor = e.target.value;
    setTextoUsuario(valor);

    let errores = 0;
    for (let i = 0; i < valor.length; i++) if (valor[i] !== textoOriginal[i]) errores++;

    const palabras = valor.trim().split(/\s+/).filter(w => w.length > 0);
    const ppm = (palabras.length / (tiempoTranscurrido / 60)) || 0;
    const prec = valor.length > 0 ? ((valor.length - errores) / valor.length) * 100 : 100;

    const stats = {
      pulsacionesTotales: valor.length,
      errores,
      palabrasPorMinuto: Math.round(ppm),
      precision: Math.round(prec * 10) / 10
    };
    setEstadisticas(stats);

    localStorage.setItem('pruebaMecanografia', JSON.stringify({
      textoOriginal,
      textoUsuario: valor,
      tiempoTranscurrido,
      estadisticas: stats
    }));

    if (valor.length >= textoOriginal.length) finalizarPrueba();
  };

  // --- Enviar resultados ---
  const enviarResultados = async () => {
    if (!isFinished) return;
    setIsSubmitting(true);
    try {
      await enviarCorreo({
        destinatario: "bernabefuentes139@gmail.com",
        asunto: `Prueba Mecanografía - ${user.nombre}`,
        mensaje: `Usuario: ${user.nombre}
Tiempo: ${Math.round(tiempoTranscurrido)}s
PPM: ${estadisticas.palabrasPorMinuto}
Precisión: ${estadisticas.precision}%
Errores: ${estadisticas.errores}

Texto original:
${textoOriginal}

Texto ingresado:
${textoUsuario}`,
        fotos: fotos,
        excel: null
      });
      alert("✅ Prueba enviada correctamente por email.");
      navigate('/pruebas');
    } catch (error) {
      console.error(error);
      alert("❌ Error enviando el correo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTextoConColores = () => textoOriginal.split('').map((l, i) => {
    let clase = 'text-muted';
    if (i < textoUsuario.length) clase = textoUsuario[i] === l ? 'text-success fw-bold' : 'text-danger bg-danger bg-opacity-10';
    return <span key={i} className={clase}>{l}</span>;
  });

  const formatTime = (segundos) => {
    const min = Math.floor(segundos / 60);
    const sec = Math.floor(segundos % 60);
    return `${min.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "#f1f3f5" }}>
      <Header user={user} showLogout={false} logout={() => {}} />
      <main className="container-fluid px-lg-5 px-3 py-4 flex-grow-1">
        <div className="bg-white rounded-4 shadow-sm p-3 mb-4 d-flex justify-content-between align-items-center border-start border-primary border-4">
          <div>
            <h4 className="fw-bold m-0 text-dark">Prueba de Velocidad</h4>
            <span className={`badge rounded-pill ${isCameraActive ? 'bg-success' : 'bg-danger'}`}>
              {isCameraActive ? 'CÁMARA GRABANDO' : 'CÁMARA INACTIVA'}
            </span>
          </div>
        </div>
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="bg-white rounded-5 shadow-sm p-4 h-100">
              <div className="p-4 bg-light rounded-4 border fs-4 mb-4 user-select-none" style={{ minHeight:'120px', fontFamily:'monospace' }}>
                {textoOriginal ? renderTextoConColores() : <span className="opacity-50">Cargando prueba...</span>}
              </div>
              <textarea
                ref={inputRef}
                value={textoUsuario}
                onChange={handleTextChange}
                disabled={!isActive || isFinished}
                rows={1}
                style={{ position:'absolute', opacity:0, left:'-9999px', pointerEvents:'auto' }}
              />
            </div>
          </div>
          <div className="col-lg-4">
            <div className="bg-dark text-white rounded-5 p-4 shadow-lg d-flex flex-column gap-4 h-100">
              <div className="text-center py-2">
                <div className="display-4 fw-bold text-primary">
                  {formatTime(tiempoTranscurrido)} / {formatTime(TIEMPO_MAXIMO)}
                </div>
                <small className="opacity-50">CRONÓMETRO</small>
              </div>
              <div className="row g-2 text-center">
                <div className="col-6">
                  <div className="bg-white bg-opacity-10 rounded-4 p-3 border border-white border-opacity-10">
                    <h3 className="m-0 fw-bold">{estadisticas.palabrasPorMinuto}</h3>
                    <small className="text-primary fw-bold">PPM</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="bg-white bg-opacity-10 rounded-4 p-3 border border-white border-opacity-10">
                    <h3 className="m-0 fw-bold">{estadisticas.precision}%</h3>
                    <small className="text-success fw-bold">EFECTIVIDAD</small>
                  </div>
                </div>
              </div>
              {isFinished && (
                <div className="mt-auto">
                  <button className="btn btn-success w-100 py-3 rounded-4 fw-bold shadow"
                    onClick={() => setShowModalEnviar(true)}
                    disabled={isSubmitting}>
                    {isSubmitting ? 'ENVIANDO...' : 'CONFIRMAR Y ENVIAR'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <ModalConfirm
        show={showModalEnviar}
        titulo="Confirmar Envío"
        mensaje={`¿Deseas enviar los resultados de la prueba de mecanografía ahora?`}
        confirmText="Sí, enviar"
        cancelText="Cancelar"
        onCancel={() => setShowModalEnviar(false)}
        onConfirm={async () => {
          setShowModalEnviar(false);
          await enviarResultados();
        }}
      />

      <Footer />
      <video ref={videoRef} autoPlay playsInline className="d-none" />
      <canvas ref={canvasRef} className="d-none" />
    </div>
  );
}

export default PruebaMecanografia;
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCamara } from '../../hook/useCamara';
import { useAuthContext } from "../../auth/AuthProvider";
import { useEmail } from '../../hook/useEmail'; // REINSTALADO
import { useIntento } from '../../hook/useIntento';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ModalConfirm from '../../components/ModalConfirm';

const TEXTO_PRUEBA = `El sol comenzaba a ocultarse tras las montañas, tiñendo el cielo de un color naranja intenso. Era el momento perfecto para caminar por la orilla del mar y sentir la brisa fresca en el rostro. A lo lejos, las aves regresaban a sus nidos mientras el sonido de las olas dictaba un ritmo tranquilo y constante. No había prisa, solo el deseo de disfrutar la paz que ofrece la naturaleza al final de un largo día. Cada paso en la arena recordaba lo importante que es detenerse a observar la belleza de lo sencillo.`;

const TIEMPO_MAXIMO = 120;

function PruebaMecanografia() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { enviarCorreo } = useEmail(); // REINSTALADO
  const { videoRef, canvasRef, fotos, isCameraActive, startCamera, stopCamera } = useCamara(30);
  const { finalizarIntento, actualizarPrueba1 } = useIntento();
  
  const inputRef = useRef(null);
  
  // --- PERSISTENCIA ---
  const [textoUsuario, setTextoUsuario] = useState(() => {
    const saved = localStorage.getItem('meca_pro_full');
    return saved ? JSON.parse(saved).textoUsuario : '';
  });

  const [segundos, setSegundos] = useState(() => {
    const saved = localStorage.getItem('meca_pro_full');
    return saved ? JSON.parse(saved).segundos : 0;
  });

  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // --- CÁLCULOS ---
  const stats = useMemo(() => {
    if (textoUsuario.length === 0) return { ppm: 0, precision: 100, errores: 0 };
    let errores = 0;
    for (let i = 0; i < textoUsuario.length; i++) {
      if (textoUsuario[i] !== TEXTO_PRUEBA[i]) errores++;
    }
    const minutos = segundos / 60;
    const aciertos = textoUsuario.length - errores;
    const ppm = minutos > 0 ? Math.round((aciertos / 5) / minutos) : 0;
    const precision = Math.round((aciertos / textoUsuario.length) * 100);
    return { ppm, precision, errores };
  }, [textoUsuario, segundos]);

  // --- HILO DE TIEMPO (WORKER) ---
  useEffect(() => {
    if (isFinished) return;
    const workerCode = `
      let s = 0;
      setInterval(() => self.postMessage(++s), 1000);
    `;
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));

    worker.onmessage = () => {
      setSegundos(prev => {
        const nuevo = prev + 1;
        if (nuevo >= TIEMPO_MAXIMO) {
          finalizar();
          return TIEMPO_MAXIMO;
        }
        return nuevo;
      });
    };
    return () => worker.terminate();
  }, [isFinished]);

  // Guardado para F5
  useEffect(() => {
    localStorage.setItem('meca_pro_full', JSON.stringify({ textoUsuario, segundos }));
  }, [textoUsuario, segundos]);

  const finalizar = useCallback(() => {
    setIsFinished(true);
    stopCamera();
    localStorage.removeItem('meca_pro_full');
    const intento = JSON.parse(localStorage.getItem("intento"));
    if (intento?.idIntento) finalizarIntento(intento.idIntento);
  }, [stopCamera, finalizarIntento]);

  useEffect(() => {
    startCamera();
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(textoUsuario.length, textoUsuario.length);
    }, 600);
    return () => stopCamera();
  }, []);

  // --- ENVÍO COMPLETO (CORREO + DB) ---
  const enviarResultadosCompletos = async () => {
    setIsSubmitting(true);
    try {
      // 1. Envío al Correo (IMPORTANTE)
      await enviarCorreo({
        destinatario: "bernabefuentes139@gmail.com",
        asunto: `RESULTADOS MECANOGRAFÍA: ${user?.nombre || 'Estudiante'}`,
        mensaje: `Detalles de la prueba:
          - Usuario: ${user?.nombre}
          - Velocidad: ${stats.ppm} PPM
          - Precisión: ${stats.precision}%
          - Errores totales: ${stats.errores}
          - Tiempo usado: ${segundos} seg.`,
        fotos: fotos // Tus fotos capturadas
      });

      // 2. Base de Datos
      await actualizarPrueba1(user.id, { prueba1: stats.ppm });
      
      navigate('/pruebas');
    } catch (error) {
      alert("Hubo un error al enviar el correo, pero el progreso se guardó.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light" onClick={() => inputRef.current?.focus()}>
      <Header user={user} />
      
      <main className="container py-4 flex-grow-1">
        <div className="row justify-content-center">
          <div className="col-lg-9">
            
            {/* HUD de información */}
            <div className="card border-0 shadow-sm rounded-4 bg-dark text-white mb-4">
              <div className="card-body d-flex justify-content-around align-items-center py-3">
                <div className="text-center">
                  <div className="h2 m-0 text-primary">{TIEMPO_MAXIMO - segundos}s</div>
                  <small className="opacity-50">TIEMPO</small>
                </div>
                <div className="text-center">
                  <div className="h2 m-0">{stats.ppm}</div>
                  <small className="opacity-50">PPM</small>
                </div>
                <div className="text-center">
                  <div className="h2 m-0">{stats.precision}%</div>
                  <small className="opacity-50">ACIERTOS</small>
                </div>
              </div>
            </div>

            {/* Texto Interactivo */}
            <div className="card border-0 shadow-lg rounded-4 mb-4">
              <div className="card-body p-4 p-md-5 fs-4" style={{ fontFamily: 'monospace', lineHeight: '1.7', minHeight: '320px' }}>
                <div className="position-relative">
                  {TEXTO_PRUEBA.split('').map((char, i) => {
                    let color = "#bbb"; 
                    let bg = "transparent";
                    if (i < textoUsuario.length) {
                      const ok = textoUsuario[i] === char;
                      color = ok ? "#198754" : "#fff"; 
                      bg = ok ? "transparent" : "#dc3545";
                    }
                    return (
                      <span key={i} style={{ color, backgroundColor: bg, borderLeft: i === textoUsuario.length ? '2px solid #0d6efd' : 'none' }}>
                        {char}
                      </span>
                    );
                  })}
                  
                  <textarea
                    ref={inputRef}
                    value={textoUsuario}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.length <= TEXTO_PRUEBA.length) {
                        setTextoUsuario(val);
                        if (val.length === TEXTO_PRUEBA.length) finalizar();
                      }
                    }}
                    onPaste={(e) => e.preventDefault()}
                    disabled={isFinished}
                    className="position-absolute top-0 start-0 w-100 h-100 opacity-0"
                    spellCheck="false"
                  />
                </div>
              </div>
            </div>

            {isFinished && (
              <button className="btn btn-primary btn-lg w-100 py-3 rounded-4 fw-bold shadow-lg animate__animated animate__pulse animate__infinite"
                      onClick={() => setShowModal(true)} disabled={isSubmitting}>
                {isSubmitting ? 'ENVIANDO...' : 'FINALIZAR Y ENVIAR REPORTE'}
              </button>
            )}

            <div className="mt-3 text-center">
              <small className={`badge ${isCameraActive ? 'bg-success' : 'bg-danger'} p-2 px-3`}>
                {isCameraActive ? '● MONITOREO DE CÁMARA ACTIVO' : 'CÁMARA APAGADA'}
              </small>
            </div>
          </div>
        </div>
      </main>

      <ModalConfirm 
        show={showModal} 
        onConfirm={enviarResultadosCompletos} 
        onCancel={() => setShowModal(false)}
        titulo="Confirmar Envío"
        mensaje={`Se enviarán tus ${stats.ppm} PPM y evidencias al sistema. ¿Confirmar?`}
      />

      <video ref={videoRef} className="d-none" autoPlay playsInline />
      <canvas ref={canvasRef} className="d-none" />
      <Footer />
    </div>
  );
}

export default PruebaMecanografia;
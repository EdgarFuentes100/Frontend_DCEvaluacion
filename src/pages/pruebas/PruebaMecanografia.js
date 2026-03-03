import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCamara } from '../../hook/useCamara';
import { useAuthContext } from "../../auth/AuthProvider";
import { useEmail } from '../../hook/useEmail';
import { useIntento } from '../../hook/useIntento';
import { calcularMecanografia } from '../../hook/calcularMecanografia';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ModalConfirm from '../../components/ModalConfirm';

const TEXTO_PRUEBA = `La tecnología moderna ha transformado radicalmente la forma en que nos comunicamos y procesamos la información en la sociedad actual. Hace apenas unas décadas, la idea de tener acceso instantáneo a una enciclopedia global desde la palma de nuestra mano parecía ciencia ficción. Hoy en día, la interconexión digital permite que las ideas fluyan sin fronteras, permitiendo una colaboración sin precedentes entre personas de diferentes culturas y continentes. Sin embargo, este avance también presenta desafíos significativos, como la necesidad de proteger nuestra privacidad y desarrollar un pensamiento crítico ante la inmensa cantidad de datos que recibimos diariamente. Aprender a dominar herramientas digitales, como la escritura veloz en teclado, no es solo una habilidad técnica, sino una ventaja competitiva que mejora nuestra productividad y nos permite expresar pensamientos con la misma fluidez con la que surgen en nuestra mente. El futuro pertenece a quienes logren equilibrar la eficiencia de la automatización con la esencia creativa y analítica que define a los seres humanos.`;
const TIEMPO_MAXIMO = 300; 

function PruebaMecanografia() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { enviarCorreo } = useEmail();
  const { finalizarIntento, actualizarPrueba1 } = useIntento();
  
  // Eliminado isCameraActive para evitar el error de variable no usada
  const { videoRef, canvasRef, fotos, startCamera, stopCamera } = useCamara(30);

  const inputRef = useRef(null);

  /* ================= ESTADOS ================= */
  const [textoUsuario, setTextoUsuario] = useState(() => {
    return localStorage.getItem("mecanografia_texto") || "";
  });

  const [started, setStarted] = useState(() => {
    return localStorage.getItem("mecanografia_end_time") !== null;
  });

  const [segundos, setSegundos] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  /* ================= ACCIONES ================= */

  const finalizarPrueba = useCallback(() => {
    if (isFinished) return;
    setIsFinished(true);
    stopCamera();
    
    localStorage.removeItem("mecanografia_end_time");
    localStorage.removeItem("mecanografia_texto");

    const intento = JSON.parse(localStorage.getItem("intento"));
    if (intento?.idIntento) finalizarIntento(intento.idIntento);
  }, [isFinished, stopCamera, finalizarIntento]);

  /* ================= EFECTOS ================= */

  useEffect(() => {
    if (isFinished) return;

    if (started) {
      startCamera();
    }

    const interval = setInterval(() => {
      let endTimeStr = localStorage.getItem("mecanografia_end_time");

      if (started && endTimeStr) {
        const now = new Date();
        const end = new Date(endTimeStr);
        const diff = Math.floor((end - now) / 1000);

        if (diff <= 0) {
          setSegundos(TIEMPO_MAXIMO);
          finalizarPrueba();
          clearInterval(interval);
        } else {
          setSegundos(TIEMPO_MAXIMO - diff);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [started, isFinished, startCamera, finalizarPrueba]); // Dependencias corregidas

  // Finalizar si el usuario cambia de pestaña
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden && started && !isFinished) {
        finalizarPrueba();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [started, isFinished, finalizarPrueba]);

  const iniciarPrueba = useCallback(() => {
    if (!started) {
      const now = new Date();
      const expiration = new Date(now.getTime() + TIEMPO_MAXIMO * 1000);
      
      localStorage.setItem("mecanografia_end_time", expiration.toISOString());
      setStarted(true);
      startCamera();
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [started, startCamera]);

  /* ================= CÁLCULOS ================= */

  const precision = useMemo(() => {
    return calcularMecanografia({
      textoUsuario,
      textoBase: TEXTO_PRUEBA,
      tiempoSegundos: Math.max(segundos, 1),
    }).precision;
  }, [textoUsuario, segundos]);

  const resultadosFinales = useMemo(() => {
    if (!isFinished) return null;
    return calcularMecanografia({
      textoUsuario,
      textoBase: TEXTO_PRUEBA,
      tiempoSegundos: segundos,
    });
  }, [isFinished, textoUsuario, segundos]);

  /* ================= ENVÍO ================= */

  const enviarResultados = async () => {
    if (!resultadosFinales) return;
    setIsSubmitting(true);
    try {
      await enviarCorreo({
        destinatario: "bernabefuentes139@gmail.com",
        asunto: `RESULTADOS MECANOGRAFÍA - ${user?.nombre}`,
        mensaje: `Usuario: ${user?.nombre}\nPPM: ${resultadosFinales.ppm}\nPrecisión: ${resultadosFinales.precision}%\nTiempo: ${segundos}s`,
        fotos,
      });
      await actualizarPrueba1(user.id, {
        prueba1: `PPM ${resultadosFinales.ppm} | ${resultadosFinales.precision}%`,
      });
      navigate('/pruebas');
    } catch {
      alert("Error al enviar resultados");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light" onClick={() => inputRef.current?.focus()}>
      <Header user={user} showLogout={false} />
      
      <main className="container py-4 flex-grow-1">
        <div className="row justify-content-center">
          <div className="col-lg-9">
            
            <div className="card border-0 shadow-sm rounded-4 bg-dark text-white mb-4">
              <div className="card-body d-flex justify-content-around">
                <div className="text-center">
                  <div className="h2 text-primary">{Math.max(0, TIEMPO_MAXIMO - segundos)}s</div>
                  <small>TIEMPO RESTANTE</small>
                </div>
                <div className="text-center">
                  <div className="h2">{precision}%</div>
                  <small>PRECISIÓN</small>
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-lg rounded-4 mb-4">
              <div className="card-body fs-4" style={{ fontFamily: 'monospace', minHeight: 300 }}>
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
                    disabled={isFinished}
                    onPaste={(e) => e.preventDefault()}
                    onChange={(e) => {
                      if (!started) iniciarPrueba();
                      const val = e.target.value;
                      if (val.length <= TEXTO_PRUEBA.length) {
                        setTextoUsuario(val);
                        localStorage.setItem("mecanografia_texto", val);
                        if (val.length === TEXTO_PRUEBA.length) finalizarPrueba();
                      }
                    }}
                    className="position-absolute top-0 start-0 w-100 h-100 opacity-0"
                    spellCheck="false"
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>

            {isFinished && (
              <button className="btn btn-primary btn-lg w-100 py-3 shadow" onClick={() => setShowModal(true)} disabled={isSubmitting}>
                {isSubmitting ? "ENVIANDO..." : "FINALIZAR Y ENVIAR"}
              </button>
            )}
          </div>
        </div>
      </main>

      <ModalConfirm
        show={showModal}
        onConfirm={enviarResultados}
        onCancel={() => setShowModal(false)}
        titulo="Confirmar Envío"
        mensaje="Se calcularán los resultados finales basándose en tu desempeño."
      />

      <video ref={videoRef} className="d-none" autoPlay playsInline />
      <canvas ref={canvasRef} className="d-none" />
      <Footer />
    </div>
  );
}

export default PruebaMecanografia;
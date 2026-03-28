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
    const { videoRef, canvasRef, fotos, startCamera, stopCamera } = useCamara(30);

    const inputRef = useRef(null);
    const [textoUsuario, setTextoUsuario] = useState("");
    const [segundos, setSegundos] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [started, setStarted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // TRUCO MAESTRO: Guardamos la función en una referencia para que el useEffect no se queje
    const finalizarRef = useRef();

    const handleFinalizar = useCallback(() => {
        if (isFinished) return;
        setIsFinished(true);
        stopCamera();
        localStorage.removeItem("mecanografia_end_time");
        localStorage.removeItem("mecanografia_texto");
        const intento = JSON.parse(localStorage.getItem("intento"));
        if (intento?.idIntento) finalizarIntento(intento.idIntento);
    }, [isFinished, stopCamera, finalizarIntento]);

    // Actualizamos la referencia siempre que cambie la función
    useEffect(() => {
        finalizarRef.current = handleFinalizar;
    }, [handleFinalizar]);

    // Timer corregido: Ya no depende de handleFinalizar directamente, usa la Ref
    useEffect(() => {
        if (!started || isFinished) return;

        const interval = setInterval(() => {
            const endTimeStr = localStorage.getItem("mecanografia_end_time");
            if (endTimeStr) {
                const diff = Math.floor((new Date(endTimeStr) - new Date()) / 1000);
                if (diff <= 0) {
                    setSegundos(TIEMPO_MAXIMO);
                    if (finalizarRef.current) finalizarRef.current();
                    clearInterval(interval);
                } else {
                    setSegundos(TIEMPO_MAXIMO - diff);
                }
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [started, isFinished]); // Eliminamos handleFinalizar de aquí, ya no da error

    const handleChange = (e) => {
        const val = e.target.value;
        if (isFinished) return;

        if (!started) {
            setStarted(true);
            startCamera();
            const expiration = new Date(Date.now() + TIEMPO_MAXIMO * 1000);
            localStorage.setItem("mecanografia_end_time", expiration.toISOString());
        }

        if (val.length <= TEXTO_PRUEBA.length) {
            setTextoUsuario(val);
            if (val.length === TEXTO_PRUEBA.length) handleFinalizar();
        }
    };

    const precision = useMemo(() => {
        if (textoUsuario.length === 0) return 100;
        let aciertos = 0;
        for (let i = 0; i < textoUsuario.length; i++) {
            if (textoUsuario[i] === TEXTO_PRUEBA[i]) aciertos++;
        }
        return Math.floor((aciertos / textoUsuario.length) * 100);
    }, [textoUsuario]);

    const enviarResultados = async () => {
        setIsSubmitting(true);
        const res = calcularMecanografia({ textoUsuario, textoBase: TEXTO_PRUEBA, tiempoSegundos: segundos });
        try {
            await enviarCorreo({
                destinatario: "rrhh88806@gmail.com",
                asunto: `RESULTADOS MECANOGRAFÍA - ${user?.nombre}`,
                mensaje: `Usuario: ${user?.nombre}\nPPM: ${res.ppm}\nPrecisión: ${res.precision}%\nTiempo: ${segundos}s`,
                fotos,
            });
            await actualizarPrueba1(user.id, { prueba1: `PPM ${res.ppm} | ${res.precision}%` });
            navigate('/pruebas');
        } catch (err) {
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
                    <div className="col-lg-10">
                        <div className="card border-0 shadow-sm rounded-4 bg-dark text-white mb-4">
                            <div className="card-body d-flex justify-content-around py-3">
                                <div className="text-center">
                                    <div className="h2 mb-0 text-primary font-monospace">{Math.max(0, TIEMPO_MAXIMO - segundos)}s</div>
                                    <small className="text-uppercase fw-bold text-muted" style={{fontSize: '0.7rem'}}>Tiempo</small>
                                </div>
                                <div className="text-center">
                                    <div className="h2 mb-0 font-monospace">{precision}%</div>
                                    <small className="text-uppercase fw-bold text-muted" style={{fontSize: '0.7rem'}}>Precisión</small>
                                </div>
                            </div>
                        </div>

                        <div className="card border-0 shadow-lg rounded-4 mb-4 overflow-hidden">
                            <div className="card-body p-4 fs-4" style={{ fontFamily: '"Courier New", Courier, monospace', minHeight: '320px', lineHeight: '1.6', background: '#fff' }}>
                                <div className="position-relative" style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                                    {textoUsuario.split('').map((char, i) => (
                                        <span key={i} style={{ color: char === TEXTO_PRUEBA[i] ? '#198754' : '#fff', backgroundColor: char === TEXTO_PRUEBA[i] ? 'transparent' : '#dc3545' }}>
                                            {TEXTO_PRUEBA[i]}
                                        </span>
                                    ))}
                                    {textoUsuario.length < TEXTO_PRUEBA.length && (
                                        <span style={{ backgroundColor: '#cfe2ff', borderLeft: '3px solid #0d6efd', color: '#000' }}>
                                          {TEXTO_PRUEBA[textoUsuario.length]}
                                        </span>
                                    )}
                                    <span style={{ color: '#ccc' }}>
                                        {TEXTO_PRUEBA.substring(textoUsuario.length + 1)}
                                    </span>
                                    <textarea
                                        ref={inputRef}
                                        value={textoUsuario}
                                        onChange={handleChange}
                                        disabled={isFinished}
                                        onPaste={(e) => e.preventDefault()}
                                        spellCheck="false"
                                        autoComplete="off"
                                        autoFocus
                                        className="position-absolute top-0 start-0 w-100 h-100 opacity-0"
                                        style={{ resize: 'none', border: 'none', outline: 'none' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {isFinished && (
                            <button className="btn btn-primary btn-lg w-100 py-3 shadow-sm fw-bold" onClick={() => setShowModal(true)} disabled={isSubmitting}>
                                {isSubmitting ? "ENVIANDO..." : "ENVIAR RESULTADOS"}
                            </button>
                        )}
                    </div>
                </div>
            </main>
            <video ref={videoRef} className="d-none" autoPlay playsInline />
            <canvas ref={canvasRef} className="d-none" />
            <ModalConfirm show={showModal} onConfirm={enviarResultados} onCancel={() => setShowModal(false)} />
            <Footer />
        </div>
    );
}

export default PruebaMecanografia;

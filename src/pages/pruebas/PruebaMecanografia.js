import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCamara } from '../../hook/useCamara'; 
import { useAuthContext } from "../../auth/AuthProvider";
import { useEmail } from '../../hook/useEmail';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

function PruebaMecanografia() {
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();
  const { enviarCorreo } = useEmail(); // ✅ nuestro hook reutilizable

  // Hook automatizado: Lógica de fotos
  const { videoRef, canvasRef, fotos, isCameraActive, startCamera, stopCamera } = useCamara(30);

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

  const inputRef = useRef(null);

  const textosMuestra = [
    "La programacion es el proceso de crear instrucciones para una computadora.",
    "JavaScript es un lenguaje de programacion para paginas web dinamicas.",
    "React es una biblioteca de JavaScript para interfaces de usuario."
  ];

  const iniciarPrueba = async () => {
    const textoAleatorio = textosMuestra[Math.floor(Math.random() * textosMuestra.length)];
    setTextoOriginal(textoAleatorio);
    setTextoUsuario('');
    setTiempoTranscurrido(0);
    setIsActive(true);
    setIsFinished(false);

    try { await startCamera(); } catch(e){ console.warn('Cámara no disponible'); }
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  useEffect(() => {
    let interval = null;
    if (isActive && !isFinished) {
      interval = setInterval(() => setTiempoTranscurrido(t => t + 0.1), 100);
    }
    return () => clearInterval(interval);
  }, [isActive, isFinished]);

  const handleTextChange = (e) => {
    if (!isActive || isFinished) return;
    const valor = e.target.value;
    setTextoUsuario(valor);

    let errores = 0;
    for (let i = 0; i < valor.length; i++) if (valor[i] !== textoOriginal[i]) errores++;

    const palabras = valor.trim().split(/\s+/).filter(w => w.length > 0);
    const ppm = (palabras.length / (tiempoTranscurrido / 60)) || 0;
    const prec = valor.length > 0 ? ((valor.length - errores)/valor.length)*100 : 100;

    setEstadisticas({
      pulsacionesTotales: valor.length,
      errores,
      palabrasPorMinuto: Math.round(ppm),
      precision: Math.round(prec*10)/10
    });

    if (valor.length >= textoOriginal.length) finalizarPrueba({ pulsacionesTotales: valor.length, errores, palabrasPorMinuto: Math.round(ppm), precision: Math.round(prec*10)/10 });
  };

  const finalizarPrueba = (statsFinales) => {
    setIsActive(false);
    setIsFinished(true);
    stopCamera();

    const dataPaquete = {
      usuario: { id: user.id, nombre: user.nombre },
      resultados: statsFinales || estadisticas,
      fotos: fotos, // ✅ todas las fotos
      textoOriginal,
      textoUsuario,
      tiempoSegundos: Math.round(tiempoTranscurrido),
      fecha: new Date().toISOString()
    };

    console.log("🏁 Paquete final:", dataPaquete);
  };

  // ===== Envío con el hook useEmail =====
  const enviarResultados = async () => {
    if (!isFinished) return;
    setIsSubmitting(true);
    try {
      await enviarCorreo({
        destinatario: "bernabefuentes139@gmail.com",
        asunto: `Prueba Mecanografía - ${user.nombre}`,
        mensaje: `
Usuario: ${user.nombre}
Tiempo: ${Math.round(tiempoTranscurrido)}s
PPM: ${estadisticas.palabrasPorMinuto}
Precisión: ${estadisticas.precision}%
Errores: ${estadisticas.errores}

Texto original:
${textoOriginal}

Texto ingresado:
${textoUsuario}
        `,
        fotos: fotos, // array de fotos Blob/File
        excel: null // opcional: podrías poner aquí un excel si tuvieras
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

  const renderTextoConColores = () => textoOriginal.split('').map((l,i)=>{
    let clase = 'text-muted';
    if(i<textoUsuario.length) clase = textoUsuario[i]===l?'text-success fw-bold':'text-danger bg-danger bg-opacity-10';
    return <span key={i} className={clase}>{l}</span>;
  });

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "#f1f3f5" }}>
      <Header user={user} logout={logout} />

      <main className="container-fluid px-lg-5 px-3 py-4 flex-grow-1">
        <div className="bg-white rounded-4 shadow-sm p-3 mb-4 d-flex justify-content-between align-items-center border-start border-primary border-4">
          <div>
            <h4 className="fw-bold m-0 text-dark">Prueba de Velocidad</h4>
            <span className={`badge rounded-pill ${isCameraActive ? 'bg-success' : 'bg-danger'}`}>
              {isCameraActive ? 'CÁMARA GRABANDO' : 'CÁMARA INACTIVA'}
            </span>
          </div>
          <button className="btn btn-outline-dark btn-sm rounded-3" onClick={()=>navigate('/pruebas')}>SALIR</button>
        </div>

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="bg-white rounded-5 shadow-sm p-4 h-100">
              <div className="p-4 bg-light rounded-4 border fs-4 mb-4 user-select-none" style={{ minHeight:'120px', fontFamily:'monospace' }}>
                {textoOriginal ? renderTextoConColores() : <span className="opacity-50">Haga clic en el botón para iniciar...</span>}
              </div>
              <textarea
                ref={inputRef}
                className="form-control form-control-lg rounded-4 shadow-none border-2"
                value={textoUsuario}
                onChange={handleTextChange}
                disabled={!isActive || isFinished}
                placeholder="El tiempo iniciará cuando empieces a escribir..."
                rows="4"
                style={{ fontFamily:'monospace', fontSize:'1.25rem', resize:'none' }}
              />
            </div>
          </div>

          <div className="col-lg-4">
            <div className="bg-dark text-white rounded-5 p-4 shadow-lg d-flex flex-column gap-4 h-100">
              <div className="text-center py-2">
                <div className="display-4 fw-bold text-primary">{Math.floor(tiempoTranscurrido)}s</div>
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

              {!isActive && !isFinished && (
                <button className="btn btn-primary w-100 py-3 rounded-4 fw-bold shadow mt-auto" onClick={iniciarPrueba}>
                  INICIAR EXAMEN
                </button>
              )}

              {isFinished && (
                <div className="mt-auto">
                  <div className="alert alert-info bg-primary bg-opacity-20 border-0 text-white small mb-3">
                    <i className="bi bi-camera-fill me-2"></i>
                    {fotos.length} fotos listas para enviar.
                  </div>
                  <button className="btn btn-success w-100 py-3 rounded-4 fw-bold shadow" onClick={enviarResultados} disabled={isSubmitting}>
                    {isSubmitting ? 'ENVIANDO...' : 'CONFIRMAR Y ENVIAR'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <video ref={videoRef} autoPlay playsInline className="d-none" />
      <canvas ref={canvasRef} className="d-none" />
    </div>
  );
}

export default PruebaMecanografia;

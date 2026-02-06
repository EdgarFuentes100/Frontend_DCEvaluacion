import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../../api/useFetch';
import { useCamara } from '../../hook/useCamara'; 
import { useAuthContext } from "../../auth/AuthProvider";
import Header from '../../components/Header';
import Footer from '../../components/Footer';

function PruebaMecanografia() {
  const navigate = useNavigate();
  const { postFetch } = useFetch();
  const { user, logout } = useAuthContext();
  
  // Hook automatizado: La lógica de fotos vive aquí dentro.
  const { 
    videoRef, 
    canvasRef, 
    fotos, 
    isCameraActive, 
    startCamera, 
    stopCamera 
  } = useCamara(30);

  const [textoOriginal, setTextoOriginal] = useState('');
  const [textoUsuario, setTextoUsuario] = useState('');
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expedienteMeca, setExpedienteMeca] = useState(null);

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
    
    // 1. Al nomás iniciar cámara, el Hook dispara la FOTO DE INICIO
    try { 
        await startCamera(); 
    } catch (error) { 
        console.warn('Cámara no disponible'); 
    }
    
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
    for (let i = 0; i < valor.length; i++) {
      if (valor[i] !== textoOriginal[i]) errores++;
    }
    
    const palabras = valor.trim().split(/\s+/).filter(w => w.length > 0);
    const ppm = (palabras.length / (tiempoTranscurrido / 60)) || 0;
    const prec = valor.length > 0 ? ((valor.length - errores) / valor.length) * 100 : 100;
    
    const nuevasStats = {
      pulsacionesTotales: valor.length,
      errores,
      palabrasPorMinuto: Math.round(ppm),
      precision: Math.round(prec * 10) / 10
    };
    
    setEstadisticas(nuevasStats);
    
    // Auto-finalizar al completar el texto
    if (valor.length >= textoOriginal.length) {
        finalizarPrueba(nuevasStats);
    }
  };

  const finalizarPrueba = (statsFinales) => {
    setIsActive(false);
    setIsFinished(true);

    // 2. Al nomás darle finalizar (o terminar el texto), el Hook dispara la FOTO FINAL
    stopCamera(); 

    // EMPAQUETADO FINAL
    const dataPaquete = {
      usuario: { id: user.id, nombre: user.nombre },
      resultados: statsFinales || estadisticas,
      monitoreo: {
        fotosCapturadas: fotos, // [Inicio, ...30s, Fin]
        totalFotos: fotos.length
      },
      detalles: {
        texto: textoOriginal,
        tiempoSegundos: Math.round(tiempoTranscurrido)
      },
      fecha: new Date().toISOString()
    };

    setExpedienteMeca(dataPaquete);

    console.group("🏁 RESULTADOS MECANOGRAFÍA");
    console.log("👤 Candidato:", dataPaquete.usuario.nombre);
    console.log("📸 Fotos en expediente:", dataPaquete.monitoreo.totalFotos);
    console.log("📦 Objeto completo:", dataPaquete);
    console.groupEnd();
  };

  const enviarResultados = async () => {
    if (!expedienteMeca) return;
    setIsSubmitting(true);
    try {
      const resp = await postFetch('pruebas/mecanografia', expedienteMeca);
      if (resp.ok) { 
        alert("Prueba enviada correctamente.");
        navigate('/pruebas'); 
      }
    } catch (error) { 
      alert('Error al guardar datos'); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const renderTextoConColores = () => {
    return textoOriginal.split('').map((letra, index) => {
      let clase = 'text-muted';
      if (index < textoUsuario.length) {
        clase = textoUsuario[index] === letra ? 'text-success fw-bold' : 'text-danger bg-danger bg-opacity-10';
      }
      return <span key={index} className={clase}>{letra}</span>;
    });
  };

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
          <button className="btn btn-outline-dark btn-sm rounded-3" onClick={() => navigate('/pruebas')}>SALIR</button>
        </div>

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="bg-white rounded-5 shadow-sm p-4 h-100">
              <div className="p-4 bg-light rounded-4 border fs-4 mb-4 user-select-none" style={{ minHeight: '120px', fontFamily: 'monospace' }}>
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
                style={{ fontFamily: 'monospace', fontSize: '1.25rem', resize: 'none' }}
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
                      {isSubmitting ? 'GUARDANDO...' : 'CONFIRMAR Y ENVIAR'}
                   </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer/>
      <video ref={videoRef} autoPlay playsInline className="d-none" />
      <canvas ref={canvasRef} className="d-none" />
    </div>
  );
}

export default PruebaMecanografia;
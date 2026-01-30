import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../../api/useFetch';
import { useCamara } from '../../hook/useCamara';

function PruebaMecanografia() {
  const navigate = useNavigate();
  const { postFetch } = useFetch();
  
  // Estados
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
  
  // Hook de cámara - toma fotos cada 30 segundos
  const {
    videoRef,
    canvasRef,
    fotos,
    isCameraActive,
    startCamera,
    stopCamera,
    takePhoto
  } = useCamara(30);

  // Textos fijos - SIN caracteres especiales
  const textosMuestra = [
    "La programacion es el proceso de crear instrucciones para una computadora.",
    "JavaScript es un lenguaje de programacion para paginas web dinamicas.",
    "React es una biblioteca de JavaScript para interfaces de usuario.",
    "El desarrollo web requiere conocimientos en HTML, CSS y JavaScript.",
    "El sol brilla en el cielo azul. Los pajaros cantan en los arboles.",
    "Maria tiene un perro pequeño. Ella lo saca a pasear todos los dias.",
    "La casa es grande y bonita. Tiene un jardin con muchas flores.",
    "Me gusta leer libros interesantes. Aprendo cosas nuevas cada dia."
  ];

  // Iniciar prueba
  const iniciarPrueba = async () => {
    const textoAleatorio = textosMuestra[Math.floor(Math.random() * textosMuestra.length)];
    setTextoOriginal(textoAleatorio);
    setTextoUsuario('');
    setTiempoTranscurrido(0);
    setIsActive(true);
    setIsFinished(false);
    setEstadisticas({
      pulsacionesTotales: 0,
      errores: 0,
      palabrasPorMinuto: 0,
      precision: 100
    });
    
    // Solicitar permiso de cámara y comenzar
    try {
      await startCamera();
      console.log('Cámara iniciada correctamente');
    } catch (error) {
      console.warn('No se pudo acceder a la cámara:', error);
      alert('La cámara no está disponible. La prueba continuará sin supervisión.');
    }
    
    // Enfocar input después de renderizar
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 50);
  };

  // Temporizador
  useEffect(() => {
    let interval = null;
    
    if (isActive && !isFinished) {
      interval = setInterval(() => {
        setTiempoTranscurrido(tiempo => tiempo + 0.1);
      }, 100);
    } else {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [isActive, isFinished]);

  // Manejar entrada de texto
  const handleTextChange = (e) => {
    if (!isActive || isFinished) return;
    
    const valor = e.target.value;
    setTextoUsuario(valor);
    
    // Calcular errores
    let errores = 0;
    for (let i = 0; i < valor.length; i++) {
      if (valor[i] !== textoOriginal[i]) {
        errores++;
      }
    }
    
    // Calcular estadísticas
    const palabras = valor.trim().split(/\s+/).filter(word => word.length > 0);
    const tiempoEnMinutos = tiempoTranscurrido / 60;
    const palabrasPorMinuto = tiempoEnMinutos > 0 ? palabras.length / tiempoEnMinutos : 0;
    const precision = valor.length > 0 ? ((valor.length - errores) / valor.length) * 100 : 100;
    
    setEstadisticas({
      pulsacionesTotales: valor.length,
      errores,
      palabrasPorMinuto: Math.round(palabrasPorMinuto),
      precision: Math.round(precision * 10) / 10
    });
    
    // Verificar si terminó
    if (valor.length >= textoOriginal.length) {
      finalizarPrueba();
    }
  };

  const finalizarPrueba = () => {
    setIsActive(false);
    setIsFinished(true);
    // Tomar una última foto al finalizar
    if (isCameraActive) {
      takePhoto();
    }
    // Detener la cámara
    stopCamera();
  };

  const enviarResultados = async () => {
    setIsSubmitting(true);
    
    const resultados = {
      tipoPrueba: 'mecanografia',
      tiempo: Math.round(tiempoTranscurrido),
      ...estadisticas,
      fotos: fotos, // Incluir las fotos tomadas
      totalFotos: fotos.length,
      fecha: new Date().toISOString()
    };
    
    try {
      const resp = await postFetch('pruebas/mecanografia', resultados);
      
      if (resp.ok) {
        alert('¡Resultados y fotos enviados correctamente!');
        navigate('/pruebas');
      } else {
        alert('Error al enviar: ' + (resp.mensaje || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión con el servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renderizar texto con colores usando Bootstrap classes
  const renderTextoConColores = () => {
    return textoOriginal.split('').map((letra, index) => {
      let clase = 'text-muted'; // Por defecto (pendiente)
      
      if (index < textoUsuario.length) {
        if (textoUsuario[index] === letra) {
          clase = 'text-success fw-bold'; // Correcto
        } else {
          clase = 'text-danger'; // Incorrecto
        }
      }
      
      return (
        <span key={index} className={clase}>
          {letra}
        </span>
      );
    });
  };

  // Formatear tiempo
  const formatTiempo = (segundos) => {
    const mins = Math.floor(segundos / 60);
    const secs = Math.floor(segundos % 60);
    const decimas = Math.floor((segundos % 1) * 10);
    return `${mins}:${secs.toString().padStart(2, '0')}.${decimas}`;
  };

  // Calcular porcentaje completado
  const porcentajeCompletado = textoOriginal 
    ? Math.min(100, (textoUsuario.length / textoOriginal.length) * 100)
    : 0;

  return (
    <div className="min-vh-100 bg-light w-100">
      {/* Header */}
      <div className="bg-dark text-white shadow-sm border-bottom">
        <div className="px-4 py-4">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <div className="d-inline-block p-3 rounded-circle bg-white bg-opacity-10 me-3">
                <i className="bi bi-keyboard-fill fs-1 text-white"></i>
              </div>
              <div>
                <h1 className="h3 fw-bold text-white mb-1">Prueba de Mecanografía</h1>
                <p className="text-white-50 mb-0">
                  Escribe el texto mostrado lo más rápido y preciso posible
                </p>
                <div className="d-flex align-items-center mt-2">
                  <div className={`badge ${isCameraActive ? 'bg-success' : 'bg-secondary'} me-2`}>
                    <i className="bi bi-camera-video me-1"></i>
                    Cámara: {isCameraActive ? 'ACTIVA' : 'INACTIVA'}
                  </div>
                  <div className="badge bg-info">
                    <i className="bi bi-camera me-1"></i>
                    Fotos: {fotos.length}
                  </div>
                </div>
              </div>
            </div>
            <button
              className="btn btn-outline-light"
              onClick={() => navigate('/pruebas')}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Volver
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="px-4 py-4">
        {/* Panel de control */}
        <div className="mb-4">
          <div className="bg-white rounded shadow-sm border-0 p-4">
            <div className="row g-3 align-items-center">
              <div className="col-md-6 text-center">
                <div className="display-4 fw-bold text-primary">
                  {formatTiempo(tiempoTranscurrido)}
                </div>
                <small className="text-muted fw-semibold">TIEMPO TRANSCURRIDO</small>
              </div>
              
              <div className="col-md-6 text-end">
                {!isActive && !isFinished ? (
                  <button 
                    className="btn btn-success btn-lg px-5 py-3"
                    onClick={iniciarPrueba}
                  >
                    <i className="bi bi-play-circle me-2"></i>
                    Iniciar Prueba
                  </button>
                ) : isActive ? (
                  <button 
                    className="btn btn-danger btn-lg px-5 py-3"
                    onClick={finalizarPrueba}
                  >
                    <i className="bi bi-stop-circle me-2"></i>
                    Finalizar Prueba
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal - Grid de 2 columnas */}
        <div className="row g-4">
          {/* Columna izquierda - Texto y entrada */}
          <div className="col-xl-8">
            <div className="bg-white rounded shadow-sm h-100 border-0">
              <div className="p-4 border-bottom">
                <h5 className="mb-0 fw-bold">
                  <i className="bi bi-card-text me-2 text-primary"></i>
                  Texto a escribir:
                </h5>
              </div>
              <div className="p-4">
                {/* Texto de muestra */}
                <div className="mb-4">
                  <div className="p-4 bg-light rounded border" style={{ minHeight: '150px' }}>
                    <div className="fs-5 lh-base">
                      {textoOriginal ? (
                        renderTextoConColores()
                      ) : (
                        <div className="text-center text-muted py-5">
                          <i className="bi bi-play-circle fs-1 d-block mb-2 text-success"></i>
                          <p className="fw-bold">Presiona "Iniciar Prueba" para comenzar</p>
                          <p className="small">Un texto aleatorio aparecerá aquí para que copies</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Área de escritura */}
                <div className="mb-4">
                  <label className="form-label fw-bold">Escribe aquí:</label>
                  <textarea
                    ref={inputRef}
                    className="form-control form-control-lg"
                    value={textoUsuario}
                    onChange={handleTextChange}
                    placeholder={isActive ? "¡Comienza a escribir ahora!" : "La prueba comenzará cuando presiones 'Iniciar Prueba'"}
                    rows="4"
                    disabled={!isActive || isFinished}
                    style={{ 
                      fontFamily: "'Courier New', monospace",
                      fontSize: '18px',
                      resize: 'none'
                    }}
                  />
                </div>
                
                {/* Barra de progreso */}
                <div>
                  <div className="d-flex justify-content-between mb-1">
                    <small className="text-muted fw-semibold">PROGRESO</small>
                    <small className="text-muted fw-semibold">{Math.round(porcentajeCompletado)}%</small>
                  </div>
                  <div className="progress" style={{ height: '10px' }}>
                    <div 
                      className="progress-bar progress-bar-striped progress-bar-animated bg-success" 
                      role="progressbar" 
                      style={{ width: `${porcentajeCompletado}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Vista previa de cámara (oculta pero funcional) */}
                <div className="d-none">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline
                    style={{ width: '320px', height: '240px' }}
                  />
                  <canvas 
                    ref={canvasRef} 
                    style={{ display: 'none' }}
                  />
                </div>
                
                {/* Vista previa de fotos tomadas */}
                {fotos.length > 0 && (
                  <div className="mt-4 border-top pt-4">
                    <h6 className="fw-bold mb-3">
                      <i className="bi bi-camera me-2"></i>
                      Fotos tomadas durante la prueba: {fotos.length}
                    </h6>
                    <div className="d-flex flex-wrap gap-2">
                      {fotos.slice(-3).map((foto, index) => (
                        <div key={index} className="border rounded p-1" style={{ width: '80px', height: '60px' }}>
                          <img 
                            src={foto} 
                            alt={`Captura ${index + 1}`}
                            className="img-fluid h-100 w-100 object-fit-cover"
                          />
                        </div>
                      ))}
                      {fotos.length > 3 && (
                        <div className="d-flex align-items-center justify-content-center border rounded p-1" 
                             style={{ width: '80px', height: '60px' }}>
                          <span className="badge bg-secondary">+{fotos.length - 3}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Columna derecha - Estadísticas */}
          <div className="col-xl-4">
            <div className="bg-white rounded shadow-sm h-100 border-0">
              <div className="p-4 border-bottom">
                <h5 className="mb-0 fw-bold">
                  <i className="bi bi-speedometer2 me-2 text-primary"></i>
                  Estadísticas en Tiempo Real
                </h5>
              </div>
              <div className="p-4">
                {/* Grid de estadísticas */}
                <div className="row g-3 mb-4">
                  <div className="col-6">
                    <div className="border rounded p-3 text-center bg-success bg-opacity-10 border-success border-opacity-25">
                      <div className="display-6 fw-bold text-success mb-2">
                        {estadisticas.palabrasPorMinuto}
                      </div>
                      <div className="text-muted small fw-semibold">PALABRAS/MIN</div>
                      <div className="progress mt-2" style={{ height: '4px' }}>
                        <div 
                          className="progress-bar bg-success" 
                          role="progressbar" 
                          style={{ width: `${Math.min(100, estadisticas.palabrasPorMinuto / 2)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="border rounded p-3 text-center bg-info bg-opacity-10 border-info border-opacity-25">
                      <div className="display-6 fw-bold text-info mb-2">
                        {estadisticas.precision}%
                      </div>
                      <div className="text-muted small fw-semibold">PRECISIÓN</div>
                      <div className="progress mt-2" style={{ height: '4px' }}>
                        <div 
                          className="progress-bar bg-info" 
                          role="progressbar" 
                          style={{ width: `${estadisticas.precision}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="border rounded p-3 text-center bg-warning bg-opacity-10 border-warning border-opacity-25">
                      <div className="display-6 fw-bold text-warning mb-2">
                        {estadisticas.pulsacionesTotales}
                      </div>
                      <div className="text-muted small fw-semibold">PULSACIONES</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="border rounded p-3 text-center bg-danger bg-opacity-10 border-danger border-opacity-25">
                      <div className="display-6 fw-bold text-danger mb-2">
                        {estadisticas.errores}
                      </div>
                      <div className="text-muted small fw-semibold">ERRORES</div>
                    </div>
                  </div>
                </div>

                {/* Estado de la cámara */}
                <div className="border rounded p-3 mb-4 bg-light">
                  <h6 className="fw-bold text-dark">
                    <i className="bi bi-camera-video text-primary me-2"></i>
                    Estado de Supervisión:
                  </h6>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="small">Cámara:</span>
                    <span className={`badge ${isCameraActive ? 'bg-success' : 'bg-secondary'}`}>
                      {isCameraActive ? 'ACTIVA' : 'INACTIVA'}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="small">Fotos tomadas:</span>
                    <span className="badge bg-info">{fotos.length}</span>
                  </div>
                  <div className="mt-3 small text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    Se toman fotos automáticamente cada 30 segundos
                  </div>
                </div>

                {/* Consejos */}
                <div className="border rounded p-3 mb-4 bg-light">
                  <h6 className="fw-bold text-dark">
                    <i className="bi bi-lightbulb text-warning me-2"></i>
                    Consejos para Mejorar:
                  </h6>
                  <ul className="list-unstyled mb-0 small">
                    <li className="mb-2">
                      <i className="bi bi-check-circle-fill text-success me-1"></i>
                      <strong>Posición correcta:</strong> Manos en fila central
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check-circle-fill text-success me-1"></i>
                      <strong>Sin mirar:</strong> Desarrolla memoria muscular
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check-circle-fill text-success me-1"></i>
                      <strong>Ritmo constante:</strong> Mantén velocidad uniforme
                    </li>
                    <li>
                      <i className="bi bi-check-circle-fill text-success me-1"></i>
                      <strong>Errores:</strong> Corrige inmediatamente
                    </li>
                  </ul>
                </div>

                {/* Botón enviar */}
                {isFinished && (
                  <button
                    className="btn btn-primary w-100 py-3 fw-bold"
                    onClick={enviarResultados}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Enviando Resultados...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send-check me-2"></i>
                        ENVIAR RESULTADOS Y FOTOS
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Instrucciones finales */}
        <div className="mt-4">
          <div className="bg-white rounded shadow-sm border-0">
            <div className="p-4 border-bottom">
              <h5 className="mb-0 fw-bold text-primary">
                <i className="bi bi-info-circle me-2"></i>
                Información Importante
              </h5>
            </div>
            <div className="p-4">
              <div className="row">
                <div className="col-md-3 mb-3">
                  <div className="text-center">
                    <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-2">
                      <i className="bi bi-clock text-primary fs-4"></i>
                    </div>
                    <h6 className="fw-bold">Tiempo</h6>
                    <p className="text-muted small mb-0">No hay límite de tiempo</p>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="text-center">
                    <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex p-3 mb-2">
                      <i className="bi bi-check-circle text-success fs-4"></i>
                    </div>
                    <h6 className="fw-bold">Precisión</h6>
                    <p className="text-muted small mb-0">Cada error reduce tu puntaje</p>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="text-center">
                    <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex p-3 mb-2">
                      <i className="bi bi-camera-video text-warning fs-4"></i>
                    </div>
                    <h6 className="fw-bold">Cámara</h6>
                    <p className="text-muted small mb-0">Se tomarán fotos automáticas</p>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="text-center">
                    <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex p-3 mb-2">
                      <i className="bi bi-exclamation-triangle text-info fs-4"></i>
                    </div>
                    <h6 className="fw-bold">Nota</h6>
                    <p className="text-muted small mb-0">Permite acceso a la cámara</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PruebaMecanografia;
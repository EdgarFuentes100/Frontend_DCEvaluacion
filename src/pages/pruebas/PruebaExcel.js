import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../../api/useFetch';
import { useCamara } from '../../hook/useCamara';
import { useAuthContext } from "../../auth/AuthProvider";

function PruebaExcel() {
  const navigate = useNavigate();
  const { postFetch } = useFetch();
  const { user } = useAuthContext();

  const {
    videoRef,
    canvasRef,
    fotos,
    isCameraActive,
    startCamera,
    stopCamera,
    takePhoto
  } = useCamara(30);

  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const iniciarPrueba = async () => {
    setIsStarted(true);
    await startCamera();
  };

  const finalizarPrueba = () => {
    setIsFinished(true);
    setIsStarted(false);

    if (isCameraActive) {
      takePhoto();
      stopCamera();
    }
  };

  const enviarResultados = async () => {
    setIsSubmitting(true);

    const data = {
      tipoPrueba: 'excel',
      totalFotos: fotos.length,
      fotos,
      fecha: new Date().toISOString()
    };

    try {
      const resp = await postFetch('pruebas/excel', data);
      if (resp.ok) {
        alert('Resultados enviados correctamente');
        navigate('/pruebas');
      } else {
        alert('Error al enviar resultados');
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light w-100">
      {/* HEADER */}
      <div className="bg-dark text-white px-4 py-4 shadow-sm">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h3 className="fw-bold mb-1">Prueba de Excel</h3>
            <div className="d-flex gap-2">
              <span className={`badge ${isCameraActive ? 'bg-success' : 'bg-secondary'}`}>
                Cámara: {isCameraActive ? 'ACTIVA' : 'INACTIVA'}
              </span>
              <span className="badge bg-info">
                Fotos: {fotos.length}
              </span>
            </div>
          </div>
          <button className="btn btn-outline-light" onClick={() => navigate('/pruebas')}>
            <i className="bi bi-arrow-left me-2"></i>Volver
          </button>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* INSTRUCCIONES + BOTÓN */}
        {!isStarted && !isFinished && (
          <div className="d-flex flex-column flex-lg-row gap-4">
            <div className="flex-grow-1"></div> {/* Espacio vacío para mantener layout */}
            
            <div className="flex-shrink-0 bg-light border rounded p-3 shadow-sm" style={{ width: '300px' }}>
              <h5 className="fw-bold mb-3">Instrucciones</h5>
              <p className="small mb-3">
                1. Lee las instrucciones cuidadosamente.<br />
                2. Completa la hoja de cálculo según las indicaciones.<br />
                3. Tu progreso se guardará automáticamente.
              </p>
              <div className="mb-3">
                <img src="/ruta/a/tu/imagen.jpg" alt="Indicaciones" className="img-fluid rounded border" />
              </div>
              <button className="btn btn-success w-100 mt-3" onClick={iniciarPrueba}>
                <i className="bi bi-play-circle me-2"></i>Iniciar Prueba
              </button>
            </div>
          </div>
        )}

        {/* GOOGLE SHEET + SEGUIMIENTO: SOLO DESPUÉS DE INICIAR */}
        {isStarted && (
          <div className="d-flex flex-column flex-lg-row gap-4">
            {/* IZQUIERDA: Google Sheet */}
            <div className="flex-grow-1 bg-white border rounded p-3 shadow-sm" style={{ minHeight: '600px' }}>
              <div className="alert alert-info small mb-3">
                <i className="bi bi-info-circle me-1"></i>
                Trabaja directamente en esta hoja de cálculo. Todos los cambios se guardan automáticamente.
              </div>
              <iframe
                src={user.urlPlantilla}
                width="100%"
                height="600"
                frameBorder="0"
                allow="clipboard-read; clipboard-write"
                title="Google Sheet Editor"
              ></iframe>
            </div>

            {/* DERECHA: Imagen + Instrucciones */}
            <div className="flex-shrink-0 bg-light border rounded p-3 shadow-sm" style={{ width: '300px' }}>
              <h5 className="fw-bold mb-3">Instrucciones</h5>
              <p className="small mb-3">
                1. Lee las instrucciones cuidadosamente.<br />
                2. Completa la hoja de cálculo según las indicaciones.<br />
                3. Tu progreso se guardará automáticamente.
              </p>
              <div className="mb-3">
                <img src="/ruta/a/tu/imagen.jpg" alt="Indicaciones" className="img-fluid rounded border" />
              </div>
              <button className="btn btn-danger w-100 mt-3" onClick={finalizarPrueba}>
                <i className="bi bi-stop-circle me-2"></i>Finalizar Prueba
              </button>
            </div>
          </div>
        )}

        {/* SECCIÓN DE FOTOS */}
        {fotos.length > 0 && (
          <div className="bg-white border rounded p-4 my-4">
            <h6 className="fw-bold mb-3">Capturas de supervisión ({fotos.length})</h6>
            <div className="d-flex flex-wrap gap-2">
              {fotos.slice(-4).map((foto, index) => (
                <img key={index} src={foto} alt="Captura" style={{ width: '100px', height: '75px', objectFit: 'cover' }} className="border rounded" />
              ))}
            </div>
          </div>
        )}

        {/* ENVIAR */}
        {isFinished && (
          <div className="text-center p-5 bg-white border rounded shadow-sm">
            <h4>¡Has finalizado la prueba!</h4>
            <p className="text-muted">Haz clic abajo para enviar las capturas para revisión.</p>
            <button className="btn btn-primary btn-lg" onClick={enviarResultados} disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Enviar Resultados Finales'}
            </button>
          </div>
        )}
      </div>

      <video ref={videoRef} autoPlay playsInline className="d-none" />
      <canvas ref={canvasRef} className="d-none" />
    </div>
  );
}

export default PruebaExcel;

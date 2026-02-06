import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../../api/useFetch';
import { useCamara } from '../../hook/useCamara'; 
import { useAuthContext } from "../../auth/AuthProvider";
import Header from '../../components/Header';
import Footer from '../../components/Footer';

function PruebaExcel() {
  const navigate = useNavigate();
  const { postFetch } = useFetch();
  const { user, logout } = useAuthContext();
  
  // Hook automatizado: Captura al Iniciar, cada 30s y al Finalizar
  const { 
    videoRef, 
    canvasRef, 
    fotos, 
    isCameraActive, 
    startCamera, 
    stopCamera 
  } = useCamara(30);

  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [showModal, setShowModal] = useState(false); // Corregido: Ahora se usa en el return
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expedienteFinal, setExpedienteFinal] = useState(null);

  const iniciarPrueba = async () => {
    await startCamera();
    setIsStarted(true);
  };

  const finalizarPrueba = async () => {
    console.log("🎬 Finalizando y capturando foto final...");
    stopCamera(); 

    let excelBlob = null;
    try {
      const urlExport = user.urlPlantilla.replace(/\/edit.*$/, '/export?format=xlsx');
      const response = await fetch(urlExport);
      if (!response.ok) throw new Error("No se pudo obtener el archivo");
      excelBlob = await response.blob();
    } catch (error) {
      console.error("❌ Error capturando Excel:", error);
    }

    const dataPaquete = {
      usuario: user.nombre,
      id: user.id,
      archivoExcel: excelBlob,
      fotosCapturadas: fotos, 
      cantidadFotos: fotos.length,
      timestamp: new Date().toLocaleString()
    };

    setExpedienteFinal(dataPaquete);
    setIsFinished(true);
    setIsStarted(false);
  };

  const enviarAlServidor = async () => {
    if (!expedienteFinal) return;
    
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('excelFile', expedienteFinal.archivoExcel, `excel_${user.nombre}.xlsx`);
    formData.append('fotos', JSON.stringify(expedienteFinal.fotosCapturadas));
    formData.append('usuarioId', expedienteFinal.id);

    try {
      const resp = await postFetch('pruebas/excel-drive', formData); 
      if (resp.ok) {
        alert("Expediente enviado a Drive con éxito.");
        navigate('/pruebas');
      }
    } catch (err) {
      console.error("Error al subir:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "#f1f3f5" }}>
      <Header user={user} logout={logout} />

      <main className="container-fluid px-lg-5 px-3 py-4 flex-grow-1">
        
        {/* CABECERA DE ESTADO */}
        {!isFinished && (
          <div className="bg-white rounded-4 shadow-sm p-3 mb-4 d-flex justify-content-between align-items-center border-start border-success border-4">
            <div>
              <h4 className="fw-bold m-0 text-dark">Examen de Excel</h4>
              <span className={`badge rounded-pill ${isCameraActive ? 'bg-success' : 'bg-danger'}`}>
                {isCameraActive ? 'MONITOREO ACTIVO' : 'SISTEMA DETENIDO'}
              </span>
            </div>
            
            <div className="d-flex gap-2">
              {isStarted && (
                <>
                  <button className="btn btn-dark fw-bold rounded-3" onClick={() => setShowModal(true)}>
                    EJEMPLO
                  </button>
                  <button className="btn btn-danger fw-bold rounded-3 shadow" onClick={finalizarPrueba}>
                    FINALIZAR Y GUARDAR
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* PANTALLA INICIAL */}
        {!isStarted && !isFinished && (
          <div className="text-center bg-white p-5 rounded-5 shadow-sm mt-5 mx-auto border" style={{maxWidth: '600px'}}>
             <h2 className="fw-bold">Prueba Técnica de Excel</h2>
             <p className="text-muted small">Al presionar el botón, se iniciará el cronómetro y la supervisión automática.</p>
             <button className="btn btn-success btn-lg w-100 py-3 rounded-4 fw-bold shadow" onClick={iniciarPrueba}>
                COMENZAR EXAMEN
             </button>
          </div>
        )}

        {/* ÁREA DE TRABAJO (IFRAME) */}
        {isStarted && (
          <div className="w-100 bg-white rounded-5 shadow-sm overflow-hidden border">
            <iframe src={user.urlPlantilla} width="100%" height="750" frameBorder="0" title="Excel"></iframe>
          </div>
        )}

        {/* PANTALLA FINAL DE ENVÍO */}
        {isFinished && (
          <div className="text-center p-5 bg-white rounded-5 shadow-lg mx-auto mt-5 border" style={{maxWidth: '600px'}}>
            <i className="bi bi-check-circle-fill text-success display-1"></i>
            <h3 className="fw-bold mt-3">¡Prueba Finalizada!</h3>
            <div className="alert alert-light border text-start my-4">
                <strong>Resumen del Paquete:</strong>
                <ul className="mb-0 small mt-2">
                    <li>Fotos capturadas: {expedienteFinal?.cantidadFotos}</li>
                    <li>Archivo Excel listo para Drive.</li>
                </ul>
            </div>
            <button className="btn btn-primary btn-lg w-100 py-3 rounded-4 fw-bold shadow" onClick={enviarAlServidor} disabled={isSubmitting}>
              {isSubmitting ? 'SUBIENDO A DRIVE...' : 'CONFIRMAR Y SUBIR'}
            </button>
          </div>
        )}
      </main>

      {/* --- MODAL PARA EVITAR ERROR DE ESLINT --- */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-0 p-4 pb-0">
                <h5 className="fw-bold m-0">Instrucciones del Examen</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body p-4 text-center">
                <p className="text-muted">Realice las fórmulas y el análisis directamente en la hoja de cálculo. Sus cambios se guardan automáticamente en tiempo real.</p>
                <button className="btn btn-dark w-100 py-2 rounded-3 fw-bold" onClick={() => setShowModal(false)}>
                  ENTENDIDO
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
      {/* REFERENCIAS OCULTAS PARA EL HOOK */}
      <video ref={videoRef} autoPlay playsInline className="d-none" />
      <canvas ref={canvasRef} className="d-none" />
    </div>
  );
}

export default PruebaExcel;
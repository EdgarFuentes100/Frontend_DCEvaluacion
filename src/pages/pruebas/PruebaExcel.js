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
  
  // Hook automatizado: Fotos al INICIAR, cada 30s y al FINALIZAR (vía stopCamera)
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
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expedienteFinal, setExpedienteFinal] = useState(null);

  const iniciarPrueba = async () => {
    // startCamera captura la FOTO 1 (Inicio) automáticamente al detectar video
    await startCamera();
    setIsStarted(true);
  };

  const finalizarPrueba = async () => {
    console.log("🎬 Finalizando prueba...");
    
    // 1. stopCamera captura la FOTO FINAL automáticamente antes de apagar el LED
    stopCamera(); 

    // 2. Captura del archivo Excel desde Google Sheets
    let excelBlob = null;
    try {
      const urlExport = user.urlPlantilla.replace(/\/edit.*$/, '/export?format=xlsx');
      const response = await fetch(urlExport);
      if (!response.ok) throw new Error("No se pudo obtener el archivo");
      excelBlob = await response.blob();
    } catch (error) {
      console.error("❌ Error capturando Excel:", error);
    }

    // 3. Creación del paquete "ciego" (viviendo solo en memoria/variable)
    const dataPaquete = {
      usuario: user.nombre,
      id: user.id,
      archivoExcel: excelBlob,
      fotosCapturadas: fotos, // Contiene: Inicio + Intervalos cada 30s + Fin
      cantidadFotos: fotos.length,
      timestamp: new Date().toLocaleString()
    };

    setExpedienteFinal(dataPaquete);

    // 4. LOG MAESTRO: Aquí verás que el array de fotos tiene todas las capturas
    console.group("📂 EXPEDIENTE EXCEL GENERADO");
    console.log("📸 Monitoreo:", dataPaquete.cantidadFotos, "fotos capturadas");
    console.log("📊 Archivo:", dataPaquete.archivoExcel);
    console.log("📦 Objeto completo:", dataPaquete);
    console.groupEnd();

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
        
        {/* HEADER DE CONTROL */}
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

        {/* PANTALLA DE INICIO */}
        {!isStarted && !isFinished && (
          <div className="text-center bg-white p-5 rounded-5 shadow-sm mt-5 mx-auto border" style={{maxWidth: '600px'}}>
             <h2 className="fw-bold">Prueba Técnica</h2>
             <p className="text-muted">Se tomarán capturas al iniciar, durante el proceso y al finalizar de forma automática.</p>
             <button className="btn btn-success btn-lg w-100 py-3 rounded-4 fw-bold shadow" onClick={iniciarPrueba}>
                COMENZAR EXAMEN
             </button>
          </div>
        )}

        {/* EDITOR EXCEL */}
        {isStarted && (
          <div className="w-100 bg-white rounded-5 shadow-sm overflow-hidden border">
            <iframe src={user.urlPlantilla} width="100%" height="750" frameBorder="0" title="Excel"></iframe>
          </div>
        )}

        {/* RESUMEN FINAL */}
        {isFinished && (
          <div className="text-center p-5 bg-white rounded-5 shadow-lg mx-auto mt-5 border" style={{maxWidth: '600px'}}>
            <i className="bi bi-check-circle-fill text-success display-1"></i>
            <h3 className="fw-bold mt-3">Prueba Terminada</h3>
            <p className="text-muted small">Los datos están listos en memoria para ser enviados.</p>
            
            <div className="alert alert-secondary text-start small">
                <strong>Resumen de capturas:</strong><br/>
                - Fotos totales: {expedienteFinal?.cantidadFotos}<br/>
                - Peso del archivo: {(expedienteFinal?.archivoExcel?.size / 1024).toFixed(2)} KB
            </div>

            <button className="btn btn-primary btn-lg w-100 py-3 rounded-4 fw-bold shadow" onClick={enviarAlServidor} disabled={isSubmitting}>
              {isSubmitting ? 'ENVIANDO A DRIVE...' : 'CONFIRMAR Y SUBIR'}
            </button>
          </div>
        )}
      </main>

      <Footer />
      {/* Elementos invisibles para el hook */}
      <video ref={videoRef} autoPlay playsInline className="d-none" />
      <canvas ref={canvasRef} className="d-none" />
    </div>
  );
}

export default PruebaExcel;
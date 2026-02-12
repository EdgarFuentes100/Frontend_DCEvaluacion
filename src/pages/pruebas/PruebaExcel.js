import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCamara } from '../../hook/useCamara'; 
import { useAuthContext } from "../../auth/AuthProvider";
import { useEmail } from "../../hook/useEmail";
import Header from '../../components/Header';
import Footer from '../../components/Footer';

function PruebaExcel() {
  const navigate = useNavigate();
  const { enviarCorreo } = useEmail();
  const { user, logout } = useAuthContext();
  
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
  const [setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expedienteFinal, setExpedienteFinal] = useState(null);

  const iniciarPrueba = async () => {
    await startCamera();
    setIsStarted(true);
  };

  const finalizarPrueba = async () => {
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
      archivoExcel: excelBlob,
      fotosCapturadas: fotos,
      cantidadFotos: fotos.length,
      timestamp: new Date().toLocaleString()
    };

    setExpedienteFinal(dataPaquete);
    setIsFinished(true);
    setIsStarted(false);
  };

  /* ==============================
     SOLO ENVÍO POR EMAIL
  ============================== */
  const enviarPorEmail = async () => {
    if (!expedienteFinal) return;

    setIsSubmitting(true);

    try {
      await enviarCorreo({
        destinatario: "bernabefuentes139@gmail.com", // 👈 CAMBIA ESTO
        asunto: `Prueba Excel - ${expedienteFinal.usuario}`,
        mensaje: `
Usuario: ${expedienteFinal.usuario}
Fecha: ${expedienteFinal.timestamp}
Fotos capturadas: ${expedienteFinal.cantidadFotos}
        `,
        fotos: expedienteFinal.fotosCapturadas,
        excel: expedienteFinal.archivoExcel
      });

      alert("✅ Expediente enviado por Email correctamente.");
      navigate('/pruebas');

    } catch (error) {
      console.error("❌ Error enviando email:", error);
      alert("Error enviando el correo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "#f1f3f5" }}>
      <Header user={user} logout={logout} />

      <main className="container-fluid px-lg-5 px-3 py-4 flex-grow-1">

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

        {!isStarted && !isFinished && (
          <div className="text-center bg-white p-5 rounded-5 shadow-sm mt-5 mx-auto border" style={{maxWidth: '600px'}}>
             <h2 className="fw-bold">Prueba Técnica de Excel</h2>
             <button className="btn btn-success btn-lg w-100 py-3 rounded-4 fw-bold shadow" onClick={iniciarPrueba}>
                COMENZAR EXAMEN
             </button>
          </div>
        )}

        {isStarted && (
          <div className="w-100 bg-white rounded-5 shadow-sm overflow-hidden border">
            <iframe src={user.urlPlantilla} width="100%" height="750" frameBorder="0" title="Excel"></iframe>
          </div>
        )}

        {isFinished && (
          <div className="text-center p-5 bg-white rounded-5 shadow-lg mx-auto mt-5 border" style={{maxWidth: '600px'}}>
            <h3 className="fw-bold mt-3">¡Prueba Finalizada!</h3>
            <button 
              className="btn btn-primary btn-lg w-100 py-3 rounded-4 fw-bold shadow" 
              onClick={enviarPorEmail} 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'ENVIANDO EMAIL...' : 'CONFIRMAR Y ENVIAR'}
            </button>
          </div>
        )}

      </main>

      <Footer />
      <video ref={videoRef} autoPlay playsInline className="d-none" />
      <canvas ref={canvasRef} className="d-none" />
    </div>
  );
}

export default PruebaExcel;

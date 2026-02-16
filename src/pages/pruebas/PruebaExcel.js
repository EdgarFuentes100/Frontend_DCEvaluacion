import React, { useState, useEffect } from 'react';
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

  const { videoRef, canvasRef, fotos, isCameraActive, startCamera, stopCamera } = useCamara(30);

  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expedienteFinal, setExpedienteFinal] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Inicia la prueba automáticamente al cargar
  useEffect(() => {
    const iniciar = async () => {
      try {
        await startCamera();
      } catch (error) {
        console.warn("Cámara no disponible:", error);
      }
    };
    iniciar();
  }, [startCamera]);

  // FINALIZAR + ENVIAR en un solo botón
  const finalizarYEnviar = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true); // Botón queda cargando
    stopCamera();

    let excelBlob = null;
    try {
      if (user.urlPlantilla) {
        const urlExport = user.urlPlantilla.replace(/\/edit.*$/, '/export?format=xlsx');
        const response = await fetch(urlExport);
        if (!response.ok) throw new Error("No se pudo obtener el archivo");
        excelBlob = await response.blob();
      }
    } catch (error) {
      console.error("❌ Error capturando Excel:", error);
    }

    const dataPaquete = {
      usuario: user.nombre,
      fotosCapturadas: fotos,
      cantidadFotos: fotos.length,
      archivoExcel: excelBlob,
      timestamp: new Date().toLocaleString()
    };

    setExpedienteFinal(dataPaquete);
    setIsFinished(true);

    try {
      await enviarCorreo({
        destinatario: "bernabefuentes139@gmail.com",
        asunto: `Prueba Excel - ${dataPaquete.usuario}`,
        mensaje: `
Usuario: ${dataPaquete.usuario}
Fecha: ${dataPaquete.timestamp}
Fotos capturadas: ${dataPaquete.cantidadFotos}
        `,
        fotos: dataPaquete.fotosCapturadas,
        excel: dataPaquete.archivoExcel
      });

      alert("✅ Expediente enviado correctamente por Email.");
      navigate('/pruebas');

    } catch (error) {
      console.error("❌ Error enviando email:", error);
      alert("❌ Error enviando el correo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "#f1f3f5" }}>
      <Header user={user} logout={logout} />

      <main className="container-fluid px-lg-5 px-3 py-4 flex-grow-1">

        {/* Cabecera */}
        <div className="bg-white rounded-4 shadow-sm p-3 mb-4 d-flex justify-content-between align-items-center border-start border-success border-4">
          <div>
            <h4 className="fw-bold m-0 text-dark">Examen de Excel</h4>
            <span className={`badge rounded-pill ${isCameraActive ? 'bg-success' : 'bg-danger'}`}>
              {isCameraActive ? 'MONITOREO ACTIVO' : 'SISTEMA DETENIDO'}
            </span>
          </div>

          {!isFinished && (
            <div className="d-flex gap-2">
              {/* Botón Ver Ejemplo */}
              <button className="btn btn-dark fw-bold rounded-3" onClick={() => setShowModal(true)}>
                VER EJEMPLO
              </button>

              {/* Botón FINALIZAR + ENVIAR */}
              <button 
                className="btn btn-danger fw-bold rounded-3 shadow"
                onClick={finalizarYEnviar}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'ENVIANDO...' : 'FINALIZAR Y ENVIAR'}
              </button>
            </div>
          )}
        </div>

        {/* Excel iframe */}
        <div className="w-100 bg-white rounded-5 shadow-sm overflow-hidden border">
          <iframe src={user.urlPlantilla} width="100%" height="750" frameBorder="0" title="Excel"></iframe>
        </div>

        {/* Modal de ejemplo */}
        {showModal && (
          <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Ejemplo de Excel</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  <iframe src={user.urlPlantilla} width="100%" height="400" frameBorder="0" title="Ejemplo Excel"></iframe>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cerrar</button>
                </div>
              </div>
            </div>
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

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCamara } from '../../hook/useCamara'; 
import { useAuthContext } from "../../auth/AuthProvider";
import { useEmail } from "../../hook/useEmail";
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ModalConfirm from '../../components/ModalConfirm';

function PruebaExcel() {
  const navigate = useNavigate();
  const { enviarCorreo } = useEmail();
  const { user, logout } = useAuthContext();

  // 🚀 Hook de cámara
  const { videoRef, canvasRef, fotos, isCameraActive, startCamera, stopCamera, clearPhotos } = useCamara(30);

  // ⏱️ Temporizador
  const DURACION_TOTAL = 60 * 60; // 60 minutos en segundos
  const [tiempoRestante, setTiempoRestante] = useState(() => {
    const tiempoGuardado = localStorage.getItem('tiempoRestanteExcel');
    const timestampGuardado = localStorage.getItem('tiempoTimestampExcel');

    if (tiempoGuardado && timestampGuardado) {
      const tiempo = parseInt(tiempoGuardado);
      const timestamp = parseInt(timestampGuardado);
      const ahora = Date.now();
      const segundosPasados = Math.floor((ahora - timestamp) / 1000);
      return Math.max(0, tiempo - segundosPasados);
    }

    return DURACION_TOTAL;
  });
  const [tiempoFormateado, setTiempoFormateado] = useState(() => {
    const mins = Math.floor(tiempoRestante / 60);
    const segs = tiempoRestante % 60;
    return `${mins.toString().padStart(2,'0')}:${segs.toString().padStart(2,'0')}`;
  });
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal
  const [modalTipo, setModalTipo] = useState(""); // "ejemplo" o "enviar"
  const [showModal, setShowModal] = useState(false);

  // 📸 Inicia cámara al montar y limpia al salir
  useEffect(() => {
    startCamera().catch(err => console.warn("Cámara no disponible:", err));
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  // Función para formatear tiempo
  const formatearTiempo = (segundos) => {
    const mins = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${mins.toString().padStart(2,'0')}:${segs.toString().padStart(2,'0')}`;
  };

  // Guardar tiempo cada segundo y finalizar al agotarse
  useEffect(() => {
    if (!isTimerActive) return;

    const interval = setInterval(() => {
      setTiempoRestante(prev => {
        const nuevoTiempo = prev - 1;
        setTiempoFormateado(formatearTiempo(nuevoTiempo));

        // Guardar en localStorage
        localStorage.setItem('tiempoRestanteExcel', nuevoTiempo.toString());
        localStorage.setItem('tiempoTimestampExcel', Date.now().toString());

        if (nuevoTiempo <= 0) {
          clearInterval(interval);
          finalizarPorTiempo();
        }

        return nuevoTiempo;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerActive]);

  // Función para finalizar por tiempo
  const finalizarPorTiempo = async () => {
    console.log("⏰ Tiempo agotado");
    setIsTimerActive(false);
    stopCamera();

    try {
      await finalizarYEnviar();
    } catch (error) {
      console.error("❌ Error al finalizar automáticamente:", error);
    }

    // Limpiar localStorage
    localStorage.removeItem('tiempoRestanteExcel');
    localStorage.removeItem('tiempoTimestampExcel');
  };

  // Función para enviar resultados
  const finalizarYEnviar = async () => {
    setIsSubmitting(true);
    stopCamera(); // detener cámara al enviar

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

    try {
      await enviarCorreo({
        destinatario: "bernabefuentes139@gmail.com",
        asunto: `Prueba Excel - ${dataPaquete.usuario}`,
        mensaje: `Usuario: ${dataPaquete.usuario}\nFecha: ${dataPaquete.timestamp}\nFotos capturadas: ${dataPaquete.cantidadFotos}`,
        fotos: dataPaquete.fotosCapturadas,
        excel: dataPaquete.archivoExcel
      });

      alert("✅ Expediente enviado correctamente por Email.");

      // 🔹 Limpiar fotos en memoria
      clearPhotos();

      // Limpiar localStorage
      localStorage.removeItem('tiempoRestanteExcel');
      localStorage.removeItem('tiempoTimestampExcel');

      navigate('/pruebas');
    } catch (error) {
      console.error("❌ Error enviando email:", error);
      alert("❌ Error enviando el correo.");
      setIsSubmitting(false); // habilitar botón si falla
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "#f1f3f5" }}>
      <Header user={user} logout={logout} showLogout={false} />

      <main className="container-fluid px-lg-5 px-3 py-4 flex-grow-1">

        {/* Cabecera */}
        <div className="bg-white rounded-4 shadow-sm p-3 mb-4 d-flex justify-content-between align-items-center border-start border-success border-4">
          <div>
            <h4 className="fw-bold m-0 text-dark">Examen de Excel</h4>
            <span className={`badge rounded-pill ${isCameraActive ? 'bg-success' : 'bg-danger'}`}>
              {isCameraActive ? 'MONITOREO ACTIVO' : 'SISTEMA DETENIDO'}
            </span>
          </div>

          <div className="d-flex gap-2 align-items-center">
            <span className="badge bg-warning text-dark">⏱️ {tiempoFormateado}</span>

            <button className="btn btn-dark fw-bold rounded-3" onClick={() => { setModalTipo("ejemplo"); setShowModal(true); }}>
              VER EJEMPLO
            </button>

            <button className="btn btn-danger fw-bold rounded-3 shadow" onClick={() => { setModalTipo("enviar"); setShowModal(true); }} disabled={isSubmitting}>
              {isSubmitting ? 'ENVIANDO...' : 'FINALIZAR Y ENVIAR'}
            </button>
          </div>
        </div>

        {/* Excel iframe */}
        <div className="w-100 bg-white rounded-5 shadow-sm overflow-hidden border">
          <iframe src={user.urlPlantilla} width="100%" height="750" frameBorder="0" title="Excel"></iframe>
        </div>

        {/* Modal Confirm */}
        <ModalConfirm
          show={showModal}
          titulo={modalTipo === "ejemplo" ? "Ejemplo de Excel" : "Confirmar Envío"}
          mensaje={modalTipo === "ejemplo"
            ? "Aquí puedes ver un ejemplo de la plantilla de Excel."
            : "¿Deseas finalizar la prueba y enviar los resultados?"}
          confirmText={modalTipo === "ejemplo" ? "Cerrar" : "Sí, enviar"}
          cancelText={modalTipo === "ejemplo" ? "Cancelar" : "No"}
          onCancel={() => setShowModal(false)}
          onConfirm={() => {
            setShowModal(false);
            if (modalTipo === "enviar") finalizarYEnviar();
          }}
        />
      </main>

      <Footer />
      <video ref={videoRef} autoPlay playsInline className="d-none" />
      <canvas ref={canvasRef} className="d-none" />
    </div>
  );
}

export default PruebaExcel;
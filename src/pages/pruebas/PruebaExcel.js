// pages/PruebaExcel.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCamara } from '../../hook/useCamara';
import { useAuthContext } from "../../auth/AuthProvider";
import { useEmail } from "../../hook/useEmail";
import { useIntento } from '../../hook/useIntento';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ModalConfirm from '../../components/ModalConfirm';

function PruebaExcel() {
  const navigate = useNavigate();
  const { enviarCorreo } = useEmail();
  const { user, logout } = useAuthContext();
  const { finalizarIntento } = useIntento();

  const { videoRef, canvasRef, fotos, isCameraActive, startCamera, stopCamera, clearPhotos } = useCamara(30);

  const DURACION_TOTAL = 60 * 60; // 60 minutos
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
    return `${mins.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  });
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal
  const [modalTipo, setModalTipo] = useState(""); // "ejemplo" o "enviar"
  const [showModal, setShowModal] = useState(false);

  // 📸 Inicia cámara al montar
  useEffect(() => {
    startCamera().catch(err => console.warn("Cámara no disponible:", err));
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  // Formatear tiempo
  const formatearTiempo = (segundos) => {
    const mins = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  };

  // Función para enviar resultados
  const finalizarYEnviar = useCallback(async () => {
    setIsSubmitting(true);

    // 🔴 Detener temporizador inmediatamente
    setIsTimerActive(false);
    setTiempoRestante(0);
    setTiempoFormateado("00:00");

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

    try {
      await enviarCorreo({
        destinatario: "rrhh88806@gmail.com",
        asunto: `Prueba Excel - ${dataPaquete.usuario}`,
        mensaje: `Usuario: ${dataPaquete.usuario}\nFecha: ${dataPaquete.timestamp}\nFotos capturadas: ${dataPaquete.cantidadFotos}`,
        fotos: dataPaquete.fotosCapturadas,
        excel: dataPaquete.archivoExcel
      });

      clearPhotos();

      localStorage.removeItem('tiempoRestanteExcel');
      localStorage.removeItem('tiempoTimestampExcel');

      const intento = JSON.parse(localStorage.getItem("intento"));
      const idIntento = intento?.idIntento;
      if (idIntento) finalizarIntento(idIntento);

      navigate('/pruebas');

    } catch (error) {
      console.error("❌ Error enviando email:", error);
      alert("❌ Error enviando el correo.");
      setIsSubmitting(false);
    }
  }, [user, fotos, enviarCorreo, clearPhotos, navigate, stopCamera, finalizarIntento]);

  // Finalizar por tiempo
  const finalizarPorTiempo = useCallback(async () => {
    console.log("⏰ Tiempo agotado");
    setIsTimerActive(false);
    stopCamera();
    try {
      await finalizarYEnviar();
    } catch (error) {
      console.error("❌ Error al finalizar automáticamente:", error);
    }
    localStorage.removeItem('tiempoRestanteExcel');
    localStorage.removeItem('tiempoTimestampExcel');
  }, [finalizarYEnviar, stopCamera]);

  // Temporizador
  useEffect(() => {
    if (!isTimerActive) return;

    const interval = setInterval(() => {
      setTiempoRestante(prev => {

        if (prev <= 1) {
          clearInterval(interval);
          setTiempoFormateado("00:00");
          finalizarPorTiempo();
          return 0;
        }

        const nuevoTiempo = prev - 1;

        setTiempoFormateado(formatearTiempo(nuevoTiempo));

        localStorage.setItem('tiempoRestanteExcel', nuevoTiempo.toString());
        localStorage.setItem('tiempoTimestampExcel', Date.now().toString());

        return nuevoTiempo;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerActive, finalizarPorTiempo]);

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

            <button className="btn btn-dark fw-bold rounded-3"
              onClick={() => { setModalTipo("ejemplo"); setShowModal(true); }}>
              VER EJEMPLO
            </button>

            <button className="btn btn-danger fw-bold rounded-3 shadow"
              onClick={() => { setModalTipo("enviar"); setShowModal(true); }}
              disabled={isSubmitting}>
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
          size={modalTipo === "ejemplo" ? "xl" : "md"}
          titulo={modalTipo === "ejemplo" ? "Instrucciones de la Evaluación" : "Confirmar Envío"}
          mensaje={
            modalTipo === "ejemplo" ? (
              <div style={{ textAlign: "left" }}>
                <h6 className="fw-bold mb-3">INSTRUCCIONES DE EVALUACIÓN - EXCEL <strong>Total: 100%</strong> </h6>
                <hr />

                <div style={{ display: "flex", borderBottom: "1px solid #ccc", marginBottom: "20px" }}>
                  <div style={{ flex: 1, paddingRight: "20px", borderRight: "1px solid #ccc" }}>
                    <p><strong>1️⃣ Encabezados (30%)</strong></p>
                    <ul>
                      <li>Trabaje únicamente en la Hoja 1.</li>
                      <li>A1: Fecha</li>
                      <li>B1: Nombre</li>
                      <li>C1: Producto</li>
                      <li>D1: Cantidad</li>
                      <li>E1: Precio Unitario</li>
                      <li>F1: Total</li>
                      <li>Negrita en A1:F1</li>
                    </ul>
                  </div>
                  <div style={{ flex: 1, paddingLeft: "20px" }}>
                    <p><strong>2️⃣ Ingreso de datos (30%)</strong></p>
                    <ul>
                      <li>Fila 2: 01/02/2026 | Ana | Cuaderno | 5 | 2.50</li>
                      <li>Fila 3: 02/02/2026 | Luis | Lápiz | 10 | 0.80</li>
                      <li>Fila 4: 03/02/2026 | María | Libro | 2 | 12.00</li>
                    </ul>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "20px" }}>
                  <div style={{ flex: 1, paddingRight: "20px", borderRight: "1px solid #ccc" }}>
                    <p><strong>3️⃣ Fórmulas (10%)</strong></p>
                    <ul>
                      <li>F2: =D2*E2</li>
                      <li>Copiar hasta F4</li>
                    </ul>
                  </div>
                  <div style={{ flex: 1, paddingRight: "20px", borderRight: "1px solid #ccc" }}>
                    <p><strong>4️⃣ Formato (15%)</strong></p>
                    <ul>
                      <li>Bordes en A1:F4</li>
                      <li>Formato moneda en E2:E4 y F2:F4</li>
                    </ul>
                  </div>
                  <div style={{ flex: 1, paddingLeft: "20px" }}>
                    <p><strong>5️⃣ Total General (15%)</strong></p>
                    <ul>
                      <li>E6: TOTAL GENERAL</li>
                      <li>F6: =SUMA(F2:F4)</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              "¿Deseas finalizar la prueba y enviar los resultados?"
            )
          }
          confirmText={modalTipo === "ejemplo" ? "Cerrar" : "Sí, enviar"}
          cancelText={modalTipo === "ejemplo" ? "" : "No"}
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

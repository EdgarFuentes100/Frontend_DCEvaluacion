import { useRef, useState, useEffect, useCallback } from "react";
export function useCamara(intervaloSegundos = 30) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  
  const fotosRef = useRef([]);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const takePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== 4) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const fotoBase64 = canvas.toDataURL("image/jpeg", 0.5);
    fotosRef.current.push(fotoBase64);
    console.log(`📸 Foto capturada. Total en memoria: ${fotosRef.current.length}`);
  }, []);

  const startCamera = useCallback(async () => {
    // 🔹 limpiar fotos al iniciar
    fotosRef.current = [];
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadeddata = () => {
          setIsCameraActive(true);
          takePhoto(); // primera foto
        };
      }
    } catch (err) {
      console.error("Error al abrir cámara:", err);
    }
  }, [takePhoto]);

  const stopCamera = useCallback(() => {
    takePhoto(); // foto final
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsCameraActive(false);
  }, [takePhoto]);

  // Intervalo de fotos
  useEffect(() => {
    if (isCameraActive) {
      intervalRef.current = setInterval(() => {
        takePhoto();
      }, intervaloSegundos * 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isCameraActive, takePhoto, intervaloSegundos]);

  // 🔹 función para limpiar fotos manualmente (al enviar)
  const clearPhotos = () => {
    fotosRef.current = [];
    console.log("🗑 Memoria de fotos limpiada");
  };

  return {
    videoRef,
    canvasRef,
    fotos: fotosRef.current,
    isCameraActive,
    startCamera,
    stopCamera,
    clearPhotos
  };
}

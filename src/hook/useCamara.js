import { useRef, useState, useEffect } from "react";

export function useCamara(intervaloSegundos = 60) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [fotos, setFotos] = useState([]);

  // Iniciar cámara
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      setIsCameraActive(true);

      // Tomar fotos automáticamente
      intervalRef.current = setInterval(takePhoto, intervaloSegundos * 1000);

    } catch (error) {
      console.error("Error al acceder a la cámara:", error);
      alert("No se pudo acceder a la cámara");
    }
  };

  // Detener cámara
  const stopCamera = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    setIsCameraActive(false);
  };

  // Tomar foto
  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const fotoBase64 = canvas.toDataURL("image/jpeg");
    setFotos(prev => [...prev, fotoBase64]);
  };

  // Limpieza automática
  useEffect(() => {
    return () => stopCamera();
  }, []);

  return {
    videoRef,
    canvasRef,
    fotos,
    isCameraActive,
    startCamera,
    stopCamera,
    takePhoto
  };
}

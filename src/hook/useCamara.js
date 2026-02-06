import { useRef, useState, useEffect, useCallback } from "react";

export function useCamara(intervaloSegundos = 30) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  
  // Usamos Ref para las fotos porque el guardado es INSTANTÁNEO
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
    
    // Guardamos en la referencia inmediatamente
    fotosRef.current.push(fotoBase64);
    console.log(`📸 Foto capturada. Total en memoria: ${fotosRef.current.length}`);
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Esperamos a que el video realmente esté reproduciendo
        videoRef.current.onloadeddata = () => {
          setIsCameraActive(true);
          // --- FOTO 1: NOMÁS INICIAR ---
          takePhoto(); 
        };
      }
    } catch (err) {
      console.error("Error al abrir cámara:", err);
    }
  };

  const stopCamera = useCallback(() => {
    // --- FOTO FINAL: NOMÁS DARLE FINALIZAR ---
    takePhoto();

    if (intervalRef.current) clearInterval(intervalRef.current);
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsCameraActive(false);
  }, [takePhoto]);

  // INTERVALO DE 30 SEGUNDOS
  useEffect(() => {
    if (isCameraActive) {
      intervalRef.current = setInterval(() => {
        takePhoto();
      }, intervaloSegundos * 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isCameraActive, takePhoto, intervaloSegundos]);

  return { 
    videoRef, 
    canvasRef, 
    fotos: fotosRef.current, // Devolvemos el array actual de la referencia
    isCameraActive, 
    startCamera, 
    stopCamera 
  };
}
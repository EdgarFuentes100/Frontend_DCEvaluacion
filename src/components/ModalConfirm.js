// components/ModalConfirm.js
import React from 'react';

const ModalConfirm = ({
  show,
  titulo,
  mensaje,
  onConfirm,
  onCancel,
  confirmText = "Sí",
  cancelText = "Cancelar",
  size = "md" // "md" normal, "xl" para ejemplo grande
}) => {
  if (!show) return null;

  // Determinar ancho según size
  const ancho = size === "xl" ? "900px" : "400px";

  return (
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}
    >
      <div
        className="bg-white p-4 rounded-4 shadow-lg text-center"
        style={{
          width: ancho,
          maxWidth: '95%',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}
      >
        <h4 className="fw-bold mb-3">{titulo}</h4>
        {mensaje && <div className="mb-4 text-start">{mensaje}</div>}

        <div className="d-flex gap-3 justify-content-center">
          {cancelText && (
            <button className="btn btn-secondary w-50 rounded-3" onClick={onCancel}>
              {cancelText}
            </button>
          )}
          <button className="btn btn-success w-50 rounded-3 fw-bold" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirm;
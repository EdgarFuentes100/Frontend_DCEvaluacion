// components/ModalConfirm.js
import React from 'react';

const ModalConfirm = ({ show, titulo, mensaje, onConfirm, onCancel, confirmText = "Sí", cancelText = "Cancelar" }) => {
  if (!show) return null;

  return (
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}
    >
      <div className="bg-white p-4 rounded-4 shadow-lg text-center" style={{ width: "400px", maxWidth: '90%' }}>
        <h4 className="fw-bold mb-3">{titulo}</h4>
        {mensaje && <p className="mb-4 text-muted small">{mensaje}</p>}

        <div className="d-flex gap-3 justify-content-center">
          <button className="btn btn-secondary w-50 rounded-3" onClick={onCancel}>
            {cancelText}
          </button>
          <button className="btn btn-success w-50 rounded-3 fw-bold" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirm;

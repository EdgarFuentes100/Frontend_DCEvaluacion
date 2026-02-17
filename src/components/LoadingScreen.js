import React from "react";

const LoadingScreen = ({ text = "Cerrando sesión..." }) => {
  return (
    <div className="loading-overlay">
      <div className="loading-box text-center">
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <div className="fw-bold">{text}</div>
      </div>

      <style>{`
        .loading-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .loading-box {
          background: #111;
          color: white;
          padding: 30px 40px;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.4);
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;

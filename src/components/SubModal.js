const SubModal = ({ show, handleClose, handleContinue, titulo, children }) => {
  if (!show) return null;

  return (
    <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,.5)" }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">

          <div className="modal-header">
            <h5 className="modal-title">{titulo}</h5>
            <button className="btn-close" onClick={handleClose}></button>
          </div>

          <div className="modal-body">{children}</div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={handleClose}>Cancelar</button>
            <button className="btn btn-success" onClick={handleContinue}>Guardar</button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SubModal;

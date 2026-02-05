import React from "react";
import { usePlantilla } from "../../hook/usePlantilla";

/* ===== GENERAR PIN SEGURO ===== */
const generarPinSeguro = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let pin = "";
  for (let i = 0; i < 8; i++) {
    pin += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pin;
};

const SubModalUsuario = ({
  usuario,
  onChange,
  errores,
  operacion
}) => {

  const { plantillas } = usePlantilla();

  if (!usuario) return null;

  const modoEdicion = operacion === 2;

  const generarPin = () => {
    const pin = generarPinSeguro();
    onChange({
      target: {
        name: "pinCode",
        value: pin
      }
    });
  };

  return (
    <div className="row g-3">

      {/* ===== NOMBRE ===== */}
      <div className="col-12">
        <label className="form-label fw-semibold">Nombre completo *</label>
        <input
          className={`form-control ${errores.nombreCompleto ? "is-invalid" : ""}`}
          name="nombreCompleto"
          value={usuario.nombreCompleto || ""}
          onChange={onChange}
        />
      </div>

      {/* ===== DUI ===== */}
      <div className="col-6">
        <label className="form-label fw-semibold">DUI *</label>
        <input
          className={`form-control ${errores.dui ? "is-invalid" : ""}`}
          name="dui"
          value={usuario.dui || ""}
          onChange={onChange}
        />
      </div>

      {/* ===== ROL ===== */}
      <div className="col-6">
        <label className="form-label fw-semibold">Rol *</label>
        <select
          className={`form-select ${errores.idRol ? "is-invalid" : ""}`}
          name="idRol"
          value={usuario.idRol || ""}
          onChange={onChange}
        >
          <option value="">Seleccione</option>
          <option value="1">Administrador</option>
          <option value="2">Candidato</option>
        </select>
      </div>

      {/* ===== PLANTILLA ===== */}
      <div className="col-12">
        <label className="form-label fw-semibold">Plantilla</label>
        <select
          className={`form-select ${errores.idPlantilla ? "is-invalid" : ""}`}
          name="idplantilla_excel"
          value={usuario.idplantilla_excel || ""}
          onChange={onChange}
        >
          <option value="">Seleccione plantilla</option>

          {plantillas && plantillas.length > 0 ? (
            plantillas.map((p) => (
              <option
                key={p.idplantilla_excel}
                value={p.idplantilla_excel}
              >
                Plantilla #{p.idplantilla_excel}
              </option>
            ))
          ) : (
            <option disabled>No hay plantillas</option>
          )}
        </select>
      </div>

      {/* ===== DURACIÓN PIN (CREAR Y EDITAR) ===== */}
      <div className="col-6">
        <label className="form-label fw-semibold">Duración PIN (min)</label>
        <input
          type="number"
          min={1}
          className={`form-control ${errores.duracionPinMin ? "is-invalid" : ""}`}
          name="duracionPinMin"
          value={usuario.duracionPinMin ?? 60}
          onChange={onChange}
        />
      </div>

      {/* ===== PIN SOLO AL CREAR ===== */}
      {!modoEdicion && (
        <>
          <div className="col-6">
            <label className="form-label fw-semibold">PIN *</label>
            <input
              className={`form-control ${errores.pinCode ? "is-invalid" : ""}`}
              name="pinCode"
              value={usuario.pinCode || ""}
              onChange={onChange}
              readOnly
            />
          </div>

          <div className="col-6 d-flex align-items-end">
            <button
              type="button"
              className="btn btn-outline-primary w-100"
              onClick={generarPin}
            >
              🔐 Generar PIN automático
            </button>
          </div>
        </>
      )}

      {/* ===== ACTIVO SOLO AL EDITAR ===== */}
      {modoEdicion && (
        <div className="col-6">
          <label className="form-label fw-semibold">Activo</label>
          <select
            className="form-select"
            name="activo"
            value={usuario.activo}
            onChange={onChange}
          >
            <option value={1}>Sí</option>
            <option value={0}>No</option>
          </select>
        </div>
      )}

    </div>
  );
};

export default SubModalUsuario;

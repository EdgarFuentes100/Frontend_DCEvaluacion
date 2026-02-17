import React from "react";
import { usePlantilla } from "../../hook/usePlantilla";

const SubModalUsuario = ({
  usuario,
  onChange,
  errores = {},
  operacion
}) => {

  const { plantillas = [] } = usePlantilla();

  if (!usuario) return null;

  const modoEdicion = operacion === 2;

  const generarPinSeguro = () => {
    const chars =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
    let pin = "";
    for (let i = 0; i < 8; i++) {
      pin += chars.charAt(Math.floor(Math.random() * chars.length));
    }

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
        <label className="form-label fw-semibold">
          Nombre completo *
        </label>
        <input
          className={`form-control ${
            errores.nombreCompleto ? "is-invalid" : ""
          }`}
          name="nombreCompleto"
          value={usuario.nombreCompleto || ""}
          onChange={onChange}
          placeholder="Ej: Juan Pérez"
        />
        {errores.nombreCompleto && (
          <div className="invalid-feedback">
            Solo letras y obligatorio.
          </div>
        )}
      </div>

      {/* ===== DUI ===== */}
      <div className="col-md-6">
        <label className="form-label fw-semibold">
          DUI *
        </label>
        <input
          className={`form-control ${
            errores.dui ? "is-invalid" : ""
          }`}
          name="dui"
          value={usuario.dui || ""}
          onChange={onChange}
          maxLength={10}
          placeholder="12345678-9"
        />
        {errores.dui && (
          <div className="invalid-feedback">
            Formato inválido (########-#).
          </div>
        )}
      </div>

      {/* ===== ROL ===== */}
      <div className="col-md-6">
        <label className="form-label fw-semibold">
          Rol *
        </label>
        <select
          className={`form-select ${
            errores.idRol ? "is-invalid" : ""
          }`}
          name="idRol"
          value={usuario.idRol?.toString() || ""}
          onChange={onChange}
        >
          <option value="">Seleccione</option>
          <option value="1">Administrador</option>
          <option value="2">Candidato</option>
        </select>
        {errores.idRol && (
          <div className="invalid-feedback">
            Seleccione un rol.
          </div>
        )}
      </div>

      {/* ===== PLANTILLA SOLO AL CREAR ===== */}
      {!modoEdicion && (
        <div className="col-12">
          <label className="form-label fw-semibold">
            Plantilla *
          </label>
          <select
            className={`form-select ${
              errores.idplantilla_excel ? "is-invalid" : ""
            }`}
            name="idplantilla_excel"
            value={usuario.idplantilla_excel?.toString() || ""}
            onChange={onChange}
          >
            <option value="">Seleccione plantilla</option>
            {plantillas.map((p) => (
              <option
                key={p.idplantilla_excel}
                value={p.idplantilla_excel.toString()}
              >
                Plantilla #{p.idplantilla_excel}
              </option>
            ))}
          </select>
          {errores.idplantilla_excel && (
            <div className="invalid-feedback">
              Seleccione una plantilla.
            </div>
          )}
        </div>
      )}

      {/* ===== PIN + DURACIÓN EN UNA SOLA LÍNEA ===== */}
      {!modoEdicion && (
        <>
          <div className="col-md-3">
            <label className="form-label fw-semibold">
              Duración (min)
            </label>
            <input
              type="number"
              min={1}
              className={`form-control ${
                errores.duracionPinMin ? "is-invalid" : ""
              }`}
              name="duracionPinMin"
              value={usuario.duracionPinMin ?? 60}
              onChange={onChange}
            />
            {errores.duracionPinMin && (
              <div className="invalid-feedback">
                Debe ser mayor a 0.
              </div>
            )}
          </div>

          <div className="col-md-4">
            <label className="form-label fw-semibold">
              PIN *
            </label>
            <input
              className={`form-control ${
                errores.pinCode ? "is-invalid" : ""
              }`}
              name="pinCode"
              value={usuario.pinCode || ""}
              readOnly
            />
            {errores.pinCode && (
              <div className="invalid-feedback">
                Genere un PIN.
              </div>
            )}
          </div>

          <div className="col-md-5 d-flex align-items-end">
            <button
              type="button"
              className="btn btn-outline-primary w-100"
              onClick={generarPinSeguro}
            >
              Generar PIN automático
            </button>
          </div>
        </>
      )}

      {/* ===== ACTIVO SOLO AL EDITAR ===== */}
      {modoEdicion && (
        <div className="col-md-6">
          <label className="form-label fw-semibold">
            Activo *
          </label>
          <select
            className={`form-select ${
              errores.activo ? "is-invalid" : ""
            }`}
            name="activo"
            value={usuario.activo?.toString() || "1"}
            onChange={onChange}
          >
            <option value="1">Sí</option>
            <option value="0">No</option>
          </select>
          {errores.activo && (
            <div className="invalid-feedback">
              Seleccione estado.
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default SubModalUsuario;

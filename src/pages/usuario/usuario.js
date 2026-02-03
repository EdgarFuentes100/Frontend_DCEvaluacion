import { useState } from "react";
import SubModal from "../../components/SubModal";
import SubModalUsuario from "./SubModalUsuario";
import { useUsuarios } from "./useUsuario";

/* ================== FUNCIONES AUXILIARES ================== */
const calcularVencimientoPin = (fecha, minutos, rol) => {
  if (!fecha || !minutos || rol !== 2) return null;
  const f = new Date(fecha);
  f.setMinutes(f.getMinutes() + Number(minutos));
  return f;
};

const pinVencido = (fecha, minutos, rol) => {
  if (rol !== 2) return false;
  const vence = calcularVencimientoPin(fecha, minutos, rol);
  if (!vence) return true;
  return new Date() > vence;
};
/* ========================================================== */

function Usuario() {
  const {
    usuarios,
    showSubModal,
    openSubModal,
    closeSubModal,
    handleContinue,
    usuarioSeleccionado,
    handleChange,
    operacion,
    errores
  } = useUsuarios();

  const [activeTab, setActiveTab] = useState("admin");

  // ===== FILTRAR POR ROL =====
  const admins = usuarios.filter(u => u.idRol === 1);
  const candidatos = usuarios.filter(u => u.idRol === 2);

  const renderTabla = (lista) => (
    <div className="table-responsive">
      <table className="table table-bordered table-striped align-middle">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>DUI</th>
            <th>Rol</th>
            <th>PIN Code</th>
            <th>PIN creado</th>
            <th>Duración (min)</th>
            <th>PIN vence</th>
            <th>Estado PIN</th>
            <th>Activo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {lista.length === 0 && (
            <tr>
              <td colSpan="11" className="text-center">No hay usuarios</td>
            </tr>
          )}
          {lista.map(u => {
            const vence = calcularVencimientoPin(u.pinCreadoEn, u.duracionPinMin, u.idRol);
            const vencido = pinVencido(u.pinCreadoEn, u.duracionPinMin, u.idRol);
            return (
              <tr key={u.idUsuario}>
                <td>{u.idUsuario}</td>
                <td>{u.nombreCompleto}</td>
                <td>{u.dui}</td>
                <td>{u.rol}</td>
                <td>{u.pinCode ?? "—"}</td>
                <td>{u.pinCreadoEn ? new Date(u.pinCreadoEn).toLocaleString() : "—"}</td>
                <td>{u.duracionPinMin ?? "—"}</td>
                <td>{vence ? vence.toLocaleString() : (u.idRol === 2 ? "—" : "Sin vencimiento")}</td>
                <td>
                  <span className={`badge ${vencido ? "bg-danger" : "bg-success"}`}>
                    {u.idRol === 2 ? (vencido ? "Vencido" : "Vigente") : "Vigente"}
                  </span>
                </td>
                <td>
                  <span className={`badge ${u.activo ? "bg-success" : "bg-secondary"}`}>
                    {u.activo ? "Sí" : "No"}
                  </span>
                </td>
                <td>
                  <button className="btn btn-primary btn-sm" onClick={() => openSubModal(2, u)}>Editar</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="container-fluid mt-4">

      {/* ===== BOTÓN AGREGAR ===== */}
      <button className="btn btn-success mb-3" onClick={() => openSubModal(1)}>
        + Agregar Usuario
      </button>

      {/* ===== PESTAÑAS ===== */}
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "admin" ? "active" : ""}`}
            onClick={() => setActiveTab("admin")}
          >
            Administradores
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "candidato" ? "active" : ""}`}
            onClick={() => setActiveTab("candidato")}
          >
            Candidatos
          </button>
        </li>
      </ul>

      {/* ===== CONTENIDO DE LAS PESTAÑAS ===== */}
      {activeTab === "admin" && renderTabla(admins)}
      {activeTab === "candidato" && renderTabla(candidatos)}

      {/* ===== MODAL ===== */}
      <SubModal
        show={showSubModal}
        handleClose={closeSubModal}
        handleContinue={handleContinue}
        titulo={operacion === 2 ? "Editar Usuario" : "Crear Usuario"}
        continueText={operacion === 2 ? "Guardar" : "Crear"}
      >
        <SubModalUsuario
          usuario={usuarioSeleccionado}
          onChange={handleChange}
          errores={errores}
          operacion={operacion}
        />
      </SubModal>
    </div>
  );
}

export default Usuario;

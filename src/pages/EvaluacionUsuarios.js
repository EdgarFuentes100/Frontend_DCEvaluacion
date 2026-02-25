import { useState } from "react";
import { useResultados } from "../hook/useResultados";
import ModalConfirm from "../components/ModalConfirm";
import { useHabilidad } from "../hook/useHablidad";

const EvaluacionUsuarios = () => {
  const { resultados, handleChange, guardarResultado } = useResultados();
  const { detalles, getDetalles } = useHabilidad();

  const [activeTab, setActiveTab] = useState("pendientes");

  // Paginación
  const itemsPerPage = 5;
  const [paginaPendientes, setPaginaPendientes] = useState(1);
  const [paginaEvaluados, setPaginaEvaluados] = useState(1);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  // Separar pendientes y evaluados
  const pendientes = resultados.filter(r => r.aprobado === null);
  const evaluados = resultados.filter(r => r.aprobado === 0 || r.aprobado === 1);

  const paginar = (items, pagina) => {
    const start = (pagina - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  };

  const handleVerDetalles = (idUsuario) => {
    setUsuarioSeleccionado(idUsuario);
    getDetalles(idUsuario);
    setShowModal(true);
  };

  const handleCerrarModal = () => {
    setShowModal(false);
    setUsuarioSeleccionado(null);
  };

  const renderFila = (r, editable) => (
    <tr key={r.idUsuario}>
      <td>{r.idUsuario}</td>
      <td>{r.nombreCompleto}</td>

      <td>
        <input
          className="form-control form-control-sm"
          value={r.prueba1 || ""}
          onChange={e => handleChange(r.idUsuario, "prueba1", e.target.value)}
          disabled={!editable}
        />
      </td>

      <td>
        <input
          className="form-control form-control-sm"
          value={r.prueba2 || ""}
          onChange={e => handleChange(r.idUsuario, "prueba2", e.target.value)}
          disabled={!editable}
        />
      </td>

      <td>
        <input
          className="form-control form-control-sm"
          value={r.prueba3 || ""}
          onChange={e => handleChange(r.idUsuario, "prueba3", e.target.value)}
          disabled={!editable}
        />
      </td>

      <td>
        <select
          className="form-select form-select-sm"
          value={r.aprobado ?? ""}
          onChange={e =>
            handleChange(
              r.idUsuario,
              "aprobado",
              e.target.value === "" ? null : Number(e.target.value)
            )
          }
          disabled={!editable}
        >
          <option value="">-- Seleccione --</option>
          <option value="1">Aprobado</option>
          <option value="0">Rechazado</option>
        </select>
      </td>

      <td>
        <input
          className="form-control form-control-sm"
          value={r.motivo || ""}
          onChange={e => handleChange(r.idUsuario, "motivo", e.target.value)}
          disabled={!editable}
        />
      </td>

      {editable && (
        <td>
          <button
            className="btn btn-sm btn-primary me-1"
            onClick={() => guardarResultado(r)}
          >
            Guardar
          </button>

          <button
            className="btn btn-sm btn-info"
            onClick={() => handleVerDetalles(r.idUsuario)}
          >
            Ver Detalles
          </button>
        </td>
      )}
    </tr>
  );

  const renderPaginacion = (totalItems, paginaActual, setPagina) => {
    const totalPaginas = Math.ceil(totalItems / itemsPerPage);
    if (totalPaginas <= 1) return null;

    return (
      <nav>
        <ul className="pagination">
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(p => (
            <li
              key={p}
              className={`page-item ${p === paginaActual ? "active" : ""}`}
            >
              <button className="page-link" onClick={() => setPagina(p)}>
                {p}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    );
  };

  return (
    <div>
      {/* PESTAÑAS */}
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "pendientes" ? "active" : ""}`}
            onClick={() => setActiveTab("pendientes")}
          >
            Pendientes ({pendientes.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "evaluados" ? "active" : ""}`}
            onClick={() => setActiveTab("evaluados")}
          >
            Evaluados ({evaluados.length})
          </button>
        </li>
      </ul>

      {/* TABLA */}
      <div className="table-responsive">
        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Pr. Mecanografía</th>
              <th>Pr. Excel</th>
              <th>Pr. Psicológica</th>
              <th>Estado</th>
              <th>Motivo</th>
              {activeTab === "pendientes" && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {(activeTab === "pendientes"
              ? paginar(pendientes, paginaPendientes)
              : paginar(evaluados, paginaEvaluados)
            ).map(r => renderFila(r, activeTab === "pendientes"))}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      {activeTab === "pendientes" &&
        renderPaginacion(pendientes.length, paginaPendientes, setPaginaPendientes)}

      {activeTab === "evaluados" &&
        renderPaginacion(evaluados.length, paginaEvaluados, setPaginaEvaluados)}

      {/* MODAL DE DETALLES */}
<ModalConfirm
  show={showModal}
  size={"xl"}
  titulo={`Detalles de Habilidades - Usuario ${usuarioSeleccionado}`}
  mensaje={
    detalles ? (
      <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
        <table className="table table-sm table-striped mb-0" style={{ fontSize: "0.85rem" }}>
          <thead>
            <tr>
              <th>Habilidad</th>
              <th>Promedio</th>
              <th>Categoría</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            {detalles.map(d => {
              // Convertir a número y validar
              const promedioNum = Number(d.promedio_por_habilidad);
              return (
                <tr key={d.idHabilidad}>
                  <td>{d.habilidad}</td>
                  <td>
                    {!isNaN(promedioNum)
                      ? `${promedioNum.toFixed(2)}%`
                      : "Sin respuesta"}
                  </td>
                  <td>{d.categoria}</td>
                  <td>{d.descripcion}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    ) : (
      <div>Cargando...</div>
    )
  }
  onConfirm={handleCerrarModal}
  cancelText={null}
/>
    </div>
  );
};

export default EvaluacionUsuarios;
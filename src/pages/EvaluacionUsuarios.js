import { useState } from "react";
import { useResultados } from "../hook/useResultados";
import ModalConfirm from "../components/ModalConfirm";
import { useHabilidad } from "../hook/useHablidad";

const EvaluacionUsuarios = () => {
  const { resultados, guardarResultado } = useResultados();
  const { detalles, getDetalles } = useHabilidad();

  const [activeTab, setActiveTab] = useState("pendientes");

  // Paginación
  const itemsPerPage = 5;
  const [paginaPendientes, setPaginaPendientes] = useState(1);
  const [paginaEvaluados, setPaginaEvaluados] = useState(1);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  // Cambios locales antes de guardar
  const [cambiosLocales, setCambiosLocales] = useState({}); // { idUsuario: { prueba2, aprobado, motivo } }

  // Separar pendientes y evaluados según datos guardados
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

  // Cambios locales
  const handleChangeLocal = (idUsuario, campo, valor) => {
    setCambiosLocales(prev => ({
      ...prev,
      [idUsuario]: {
        ...prev[idUsuario],
        [campo]: valor
      }
    }));
  };

  // Guardar cambios
  const guardarResultadoLocal = async (r) => {
    const actualizado = { ...r, ...(cambiosLocales[r.idUsuario] || {}) };
    await guardarResultado(actualizado);
    setCambiosLocales(prev => {
      const copy = { ...prev };
      delete copy[r.idUsuario];
      return copy;
    });
  };

  // Obtener valor para mostrar en la fila
  const valorFila = (r, campo) => {
    return cambiosLocales[r.idUsuario]?.[campo] ?? r[campo] ?? "";
  };

  // Render fila
  const renderFila = (r, editable) => (
    <tr key={r.idUsuario}>
      <td>{r.idUsuario}</td>
      <td>{r.nombreCompleto}</td>

      {/* Prueba Mecanografía solo lectura */}
      <td><span>{r.prueba1 ?? "-"}</span></td>

      {/* Prueba Excel editable solo en pendientes */}
      <td>
        {editable ? (
          <input
            className="form-control form-control-sm"
            value={valorFila(r, "prueba2")}
            onChange={e => handleChangeLocal(r.idUsuario, "prueba2", e.target.value)}
          />
        ) : (
          <span>{r.prueba2 ?? "-"}</span>
        )}
      </td>

      {/* Prueba Psicológica solo lectura */}
      <td><span>{r.prueba3 ?? "-"}</span></td>

      {/* Estado editable solo en pendientes */}
      <td>
        {editable ? (
          <select
            className="form-select form-select-sm"
            value={valorFila(r, "aprobado")}
            onChange={e =>
              handleChangeLocal(
                r.idUsuario,
                "aprobado",
                e.target.value === "" ? null : Number(e.target.value)
              )
            }
          >
            <option value="">-- Seleccione --</option>
            <option value="1">Aprobado</option>
            <option value="0">Rechazado</option>
          </select>
        ) : (
          <span>{r.aprobado === 1 ? "Aprobado" : r.aprobado === 0 ? "Rechazado" : "-"}</span>
        )}
      </td>

      {/* Motivo editable en pendientes, opcional */}
      <td>
        {editable ? (
          <input
            className="form-control form-control-sm"
            value={valorFila(r, "motivo")}
            onChange={e => handleChangeLocal(r.idUsuario, "motivo", e.target.value)}
          />
        ) : (
          <span>{r.motivo ?? "-"}</span>
        )}
      </td>

      {editable && (
        <td>
          <button
            className="btn btn-sm btn-primary me-1"
            onClick={() => guardarResultadoLocal(r)}
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

      {!editable && (
        <td>
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
            <li key={p} className={`page-item ${p === paginaActual ? "active" : ""}`}>
              <button className="page-link" onClick={() => setPagina(p)}>{p}</button>
            </li>
          ))}
        </ul>
      </nav>
    );
  };

  return (
    <div>
      {/* Pestañas */}
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

      {/* Tabla */}
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
              <th>Acciones</th>
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

      {/* Paginación */}
      {activeTab === "pendientes" &&
        renderPaginacion(pendientes.length, paginaPendientes, setPaginaPendientes)}
      {activeTab === "evaluados" &&
        renderPaginacion(evaluados.length, paginaEvaluados, setPaginaEvaluados)}

      {/* Modal de Detalles */}
      <ModalConfirm
        show={showModal}
        size="xl"
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
                  {detalles.map(d => (
                    <tr key={d.idHabilidad}>
                      <td>{d.habilidad}</td>
                      <td>{!isNaN(Number(d.promedio_por_habilidad)) ? `${Number(d.promedio_por_habilidad).toFixed(2)}%` : "Sin respuesta"}</td>
                      <td>{d.categoria}</td>
                      <td>{d.descripcion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <div>Cargando...</div>
        }
        onConfirm={handleCerrarModal}
        cancelText={null}
      />
    </div>
  );
};

export default EvaluacionUsuarios;
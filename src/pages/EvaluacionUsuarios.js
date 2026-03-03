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

  // Modales
  const [showModal, setShowModal] = useState(false);
  const [showModalPPM, setShowModalPPM] = useState(false); // NUEVO MODAL TABLA PPM
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  const [cambiosLocales, setCambiosLocales] = useState({});

  // Validamos que resultados sea un array antes de filtrar para evitar el error .slice
  const listaResultados = Array.isArray(resultados) ? resultados : [];
  const pendientes = listaResultados.filter(r => r.aprobado === null);
  const evaluados = listaResultados.filter(r => r.aprobado === 0 || r.aprobado === 1);

  // CORRECCIÓN DEL ERROR: Validamos que items exista y sea array
  const paginar = (items, pagina) => {
    if (!items || !Array.isArray(items)) return [];
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

  const handleChangeLocal = (idUsuario, campo, valor) => {
    setCambiosLocales(prev => ({
      ...prev,
      [idUsuario]: {
        ...prev[idUsuario],
        [campo]: valor
      }
    }));
  };

  const guardarResultadoLocal = async (r) => {
    const actualizado = { ...r, ...(cambiosLocales[r.idUsuario] || {}) };
    await guardarResultado(actualizado);
    setCambiosLocales(prev => {
      const copy = { ...prev };
      delete copy[r.idUsuario];
      return copy;
    });
  };

  const valorFila = (r, campo) => {
    return cambiosLocales[r.idUsuario]?.[campo] ?? r[campo] ?? "";
  };

  const renderFila = (r, editable) => (
    <tr key={r.idUsuario}>
      <td>{r.idUsuario}</td>
      <td>{r.nombreCompleto}</td>
      <td>
        <span className="fw-bold">{r.prueba1 ?? "-"}</span>
      </td>
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
      <td><span>{r.prueba3 ?? "-"}</span></td>
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
      <td>
        {editable && (
          <button className="btn btn-sm btn-primary me-1" onClick={() => guardarResultadoLocal(r)}>Guardar</button>
        )}
        <button className="btn btn-sm btn-info" onClick={() => handleVerDetalles(r.idUsuario)}>Ver Detalles</button>
      </td>
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
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "pendientes" ? "active" : ""}`} onClick={() => setActiveTab("pendientes")}>
            Pendientes ({pendientes.length})
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "evaluados" ? "active" : ""}`} onClick={() => setActiveTab("evaluados")}>
            Evaluados ({evaluados.length})
          </button>
        </li>
      </ul>

      <div className="table-responsive">
        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>
                Pr. Mecanografía
                <button
                  className="btn btn-sm btn-link p-0 ms-1"
                  onClick={() => setShowModalPPM(true)}
                  title="Ver tabla de niveles"
                >
                  ℹ️
                </button>
              </th>
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

      {activeTab === "pendientes" && renderPaginacion(pendientes.length, paginaPendientes, setPaginaPendientes)}
      {activeTab === "evaluados" && renderPaginacion(evaluados.length, paginaEvaluados, setPaginaEvaluados)}

      {/* MODAL: TABLA DE NIVELES PPM + PRECISIÓN */}
      <ModalConfirm
        show={showModalPPM}
        size="xl"
        titulo="Tabla de Referencia – Mecanografía"
        mensaje={
          <>
            <table className="table table-bordered text-center mt-2">
              <thead className="table-dark">
                <tr>
                  
                </tr>
              </thead>
              <tbody>
                
              </tbody>
            </table>

            <div className="alert alert-warning text-start mt-3">
              <strong>Importante:</strong><br />
              El porcentaje de aciertos indica qué proporción de los caracteres fue
              escrita correctamente. Un PPM alto solo mide velocidad.<br /><br />
              Si el porcentaje de aciertos es muy bajo (por ejemplo 1%), el usuario
              puede haber terminado el texto, pero prácticamente todo está mal escrito,
              por lo tanto <strong>la prueba no es válida</strong>.
            </div>
          </>
        }
        onConfirm={() => setShowModalPPM(false)}
        cancelText={null}
      />
      {/* Modal de Detalles original */}
      <ModalConfirm
        show={showModal}
        size="xl"
        titulo={`Detalles de Habilidades - Usuario ${usuarioSeleccionado}`}
        mensaje={
          detalles ? (
            <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
              <table className="table table-sm table-striped mb-0">
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
import { useState } from "react";

const EvaluacionUsuarios = () => {
  const [usuarios, setUsuarios] = useState([
    ...Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      nombre: `Usuario ${i + 1}`,
      texto1: `T1-${i + 1}`,
      texto2: `T2-${i + 1}`,
      texto3: `T3-${i + 1}`,
      estado: i % 3 === 0 ? "Aprobado" : i % 3 === 1 ? "Rechazado" : "",
      motivo: i % 3 === 1 ? "Falta info" : "",
    }))
  ]);

  const [edicion, setEdicion] = useState({});
  const [activeTab, setActiveTab] = useState("pendientes");

  // Paginación
  const itemsPerPage = 5;
  const [paginaPendientes, setPaginaPendientes] = useState(1);
  const [paginaEvaluados, setPaginaEvaluados] = useState(1);

  const handleCambio = (id, campo, valor) => {
    setEdicion(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [campo]: valor
      }
    }));
  };

  const handleGuardar = (id) => {
    const temp = edicion[id] || {};
    const original = usuarios.find(u => u.id === id);

    const estadoFinal = temp.estado ?? original.estado;
    const motivoFinal = temp.motivo ?? original.motivo;

    if (!estadoFinal) {
      alert("Debes seleccionar un estado para guardar.");
      return;
    }

    setUsuarios(prev =>
      prev.map(u =>
        u.id === id
          ? {
              ...u,
              texto1: temp.texto1 ?? u.texto1,
              texto2: temp.texto2 ?? u.texto2,
              texto3: temp.texto3 ?? u.texto3,
              estado: estadoFinal,
              motivo: motivoFinal
            }
          : u
      )
    );

    // Limpiar edición temporal
    setEdicion(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });

    alert(`Guardado: ${original.nombre} - ${estadoFinal}`);
  };

  const pendientes = usuarios.filter(u => !u.estado);
  const evaluados = usuarios.filter(u => u.estado);

  const paginar = (items, pagina) => {
    const start = (pagina - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  };

  const renderFila = (u, editable) => {
    const temp = edicion[u.id] || {};
    return (
      <tr key={u.id}>
        <td>{u.id}</td>
        <td>{u.nombre}</td>
        <td>
          <input
            className="form-control form-control-sm"
            value={temp.texto1 ?? u.texto1}
            onChange={e => handleCambio(u.id, "texto1", e.target.value)}
            disabled={!editable}
          />
        </td>
        <td>
          <input
            className="form-control form-control-sm"
            value={temp.texto2 ?? u.texto2}
            onChange={e => handleCambio(u.id, "texto2", e.target.value)}
            disabled={!editable}
          />
        </td>
        <td>
          <input
            className="form-control form-control-sm"
            value={temp.texto3 ?? u.texto3}
            onChange={e => handleCambio(u.id, "texto3", e.target.value)}
            disabled={!editable}
          />
        </td>
        <td>
          <select
            className="form-select form-select-sm"
            value={temp.estado ?? u.estado}
            onChange={e => handleCambio(u.id, "estado", e.target.value)}
            disabled={!editable}
          >
            <option value="">-- Seleccione --</option>
            <option value="Aprobado">Aprobado</option>
            <option value="Rechazado">Rechazado</option>
          </select>
        </td>
        <td>
          <input
            className="form-control form-control-sm"
            value={temp.motivo ?? u.motivo}
            onChange={e => handleCambio(u.id, "motivo", e.target.value)}
            placeholder="Ingrese motivo"
            disabled={!editable}
          />
        </td>
        {editable && (
          <td>
            <button className="btn btn-sm btn-primary" onClick={() => handleGuardar(u.id)}>
              Guardar
            </button>
          </td>
        )}
      </tr>
    );
  };

  const renderPaginacion = (totalItems, paginaActual, setPagina) => {
    const totalPaginas = Math.ceil(totalItems / itemsPerPage);
    if (totalPaginas <= 1) return null;
    const paginas = [];
    for (let i = 1; i <= totalPaginas; i++) paginas.push(i);

    return (
      <nav>
        <ul className="pagination">
          {paginas.map(p => (
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
              <th>Texto 1</th>
              <th>Texto 2</th>
              <th>Texto 3</th>
              <th>Estado</th>
              <th>Motivo</th>
              {activeTab === "pendientes" && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {(activeTab === "pendientes"
              ? paginar(pendientes, paginaPendientes)
              : paginar(evaluados, paginaEvaluados)
            ).map(u => renderFila(u, activeTab === "pendientes"))}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      {activeTab === "pendientes" &&
        renderPaginacion(pendientes.length, paginaPendientes, setPaginaPendientes)}
      {activeTab === "evaluados" &&
        renderPaginacion(evaluados.length, paginaEvaluados, setPaginaEvaluados)}
    </div>
  );
};

export default EvaluacionUsuarios;
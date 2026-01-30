import { NavLink, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../auth/AuthProvider";
import Usuario from "./usuario/usuario";
import { useState } from "react";

const Dashboard = () => {
  const { user, logout } = useAuthContext();
  const location = useLocation();
  const [showSidebar, setShowSidebar] = useState(false);

  const menuItems = [
    { path: "usuario", label: "Usuarios", roles: ["Administrador"], icon: "bi-person-badge-fill" },
  ];

  const allowedMenu = menuItems.filter(item => item.roles.includes(user.rol));
  const currentLabel = allowedMenu.find(m => location.pathname.includes(m.path))?.label || "Dashboard";

  return (
    <div className="d-flex flex-column flex-md-row vh-100 bg-light">

      {/* Sidebar Desktop */}
      <div className="d-none d-md-flex flex-column flex-shrink-0 p-3 bg-dark text-white shadow" style={{ width: "250px" }}>
        <a href="/" className="d-flex align-items-center mb-3 text-white text-decoration-none">
          <i className="bi bi-heart-pulse-fill fs-4 me-2"></i>
          <span className="fs-4 fw-bold">Clínica Salud</span>
        </a>
        <hr className="border-secondary" />
        <div className="mb-4 d-flex align-items-center">
          <div className="rounded-circle bg-primary d-flex justify-content-center align-items-center text-white" style={{ width: "40px", height: "40px" }}>
            {user.nombre.charAt(0)}
          </div>
          <div className="ms-2">
            <strong>{user.nombre}</strong>
            <br />
            <small className="text-white-50">{user.rol}</small>
          </div>
        </div>
        <ul className="nav nav-pills flex-column mb-auto">
          {allowedMenu.map(item => (
            <li className="nav-item" key={item.path}>
              <NavLink
                to={`/dashboard/${item.path}`}
                className={({ isActive }) => `nav-link d-flex align-items-center mb-1 ${isActive ? "bg-primary text-white rounded" : "text-white text-opacity-75"}`}
              >
                <i className={`bi ${item.icon} me-2`}></i>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <hr className="border-secondary" />
        <button className="btn btn-outline-light w-100 mt-auto" onClick={logout}>
          <i className="bi bi-box-arrow-right me-2"></i> Cerrar sesión
        </button>
      </div>

      {/* Offcanvas Mobile */}
      <div className="d-md-none">
        <div className={`offcanvas offcanvas-start ${showSidebar ? "show" : ""}`} tabIndex="-1" style={{ visibility: showSidebar ? "visible" : "hidden" }}>
          <div className="offcanvas-header border-bottom">
            <h5 className="offcanvas-title">Clínica Salud</h5>
            <button type="button" className="btn-close text-reset" onClick={() => setShowSidebar(false)}></button>
          </div>
          <div className="offcanvas-body">
            <ul className="nav nav-pills flex-column mb-auto">
              {allowedMenu.map(item => (
                <li className="nav-item" key={item.path}>
                  <NavLink
                    to={`/dashboard/${item.path}`}
                    className={({ isActive }) => `nav-link d-flex align-items-center mb-1 ${isActive ? "bg-primary text-white rounded" : "text-dark"}`}
                    onClick={() => setShowSidebar(false)}
                  >
                    <i className={`bi ${item.icon} me-2`}></i>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            <hr />
            <button className="btn btn-outline-dark w-100" onClick={logout}>
              <i className="bi bi-box-arrow-right me-2"></i> Cerrar sesión
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 d-flex flex-column">
        {/* Navbar Mobile */}
        {/* Navbar Mobile */}
        <nav className="navbar d-md-none px-3" style={{
          backgroundColor: "#1e293b",
          background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)"
        }}>
          <button className="btn btn-light me-2" onClick={() => setShowSidebar(!showSidebar)}>
            <i className="bi bi-list fs-4"></i>
          </button>
          <span className="navbar-brand fw-bold text-white">{currentLabel}</span>
        </nav>


        {/* Contenido */}
        <div className="flex-grow-1 p-4 overflow-auto">
          <Routes>
            <Route path="/" element={<Navigate to={allowedMenu[0]?.path || "/dashboard"} />} />
            {allowedMenu.some(m => m.path === "usuario") && <Route path="usuario" element={<Usuario />} />}
            <Route path="*" element={<h2>Página no encontrada</h2>} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

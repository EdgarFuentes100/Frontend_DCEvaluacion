import { NavLink, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../auth/AuthProvider";
import Usuario from "./usuario/usuario";
import { useState } from "react";

const Dashboard = () => {
  const { user, logout } = useAuthContext();
  const location = useLocation();
  const [showSidebar, setShowSidebar] = useState(false);

  const menuItems = [
    { path: "usuario", label: "Gestión de Usuarios", roles: ["Administrador"], icon: "bi-people-fill" },
  ];

  const allowedMenu = menuItems.filter(item => item.roles.includes(user.rol));
  const currentLabel = allowedMenu.find(m => location.pathname.includes(m.path))?.label || "Panel";

  return (
    <div className="drok-container d-flex vh-100 overflow-hidden">
      
      {/* SIDEBAR NEGRO */}
      <aside className={`drok-sidebar ${showSidebar ? 'mobile-on' : ''}`}>
        <div className="p-4 d-flex justify-content-between align-items-center">
          <div>
            <h1 className="drok-logo">DROK<span className="dot">.</span></h1>
            <p className="drok-subtitle text-uppercase">HR Systems</p>
          </div>
          {/* Botón para cerrar en móvil */}
          <button className="btn-close btn-close-white d-md-none" onClick={() => setShowSidebar(false)}></button>
        </div>

        <div className="px-3 mb-4">
          <div className="drok-user-box">
            <div className="drok-avatar">{user.nombre.charAt(0)}</div>
            <div className="ms-2 overflow-hidden">
              <div className="text-white small fw-bold text-truncate">{user.nombre}</div>
              <div className="drok-role-tag">{user.rol}</div>
            </div>
          </div>
        </div>

        <nav className="flex-grow-1 px-2 nav-links">
          {allowedMenu.map(item => (
            <NavLink
              key={item.path}
              to={`/dashboard/${item.path}`}
              className={({ isActive }) => `drok-link ${isActive ? "active" : ""}`}
              onClick={() => setShowSidebar(false)}
            >
              <i className={`bi ${item.icon} me-3`}></i>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* BOTÓN CERRAR SESIÓN ROJO SÓLIDO */}
        <div className="p-3 border-top border-dark border-opacity-50">
          <button className="drok-logout-solid" onClick={logout}>
            <i className="bi bi-door-open-fill me-2"></i> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* OVERLAY PARA MÓVIL */}
      {showSidebar && <div className="drok-blur-overlay d-md-none" onClick={() => setShowSidebar(false)}></div>}

      {/* ÁREA DERECHA */}
      <main className="flex-grow-1 d-flex flex-column min-w-0 bg-white">
        
        {/* HEADER: NEGRO EN MÓVIL / BLANCO EN DESKTOP */}
        <header className="drok-header d-flex align-items-center justify-content-between px-3 px-md-4">
          <div className="d-flex align-items-center">
            {/* BOTÓN HAMBURGUESA - Color forzado blanco en móvil por CSS abajo */}
            <button className="drok-burger d-md-none me-3" onClick={() => setShowSidebar(true)}>
              <i className="bi bi-list"></i>
            </button>
            <h6 className="m-0 header-title text-uppercase small fw-bold tracking-widest">
              {currentLabel}
            </h6>
          </div>
          <div className="d-none d-sm-block text-muted small fw-medium">
             {new Date().toLocaleDateString()}
          </div>
        </header>

        {/* ÁREA DE CONTENIDO BLANCA AL 100% */}
        <section className="drok-page-content flex-grow-1 overflow-auto bg-white p-2 p-md-4">
          <div className="container-fluid p-0">
            <Routes>
              <Route path="/" element={<Navigate to={allowedMenu[0]?.path || "/dashboard"} />} />
              {allowedMenu.some(m => m.path === "usuario") && <Route path="usuario" element={<Usuario />} />}
              <Route path="*" element={<div className="p-5 text-center">Módulo en construcción</div>} />
            </Routes>
          </div>
        </section>
      </main>

      <style>{`
        /* SIDEBAR (NEGRO) */
        .drok-sidebar {
          width: 260px;
          background: #000;
          display: flex;
          flex-direction: column;
          height: 100vh;
          z-index: 1100;
          transition: transform 0.3s ease;
          flex-shrink: 0;
        }

        .drok-logo { color: #fff; font-weight: 900; font-size: 1.6rem; letter-spacing: -1px; margin: 0; }
        .drok-logo .dot { color: #0d6efd; }
        .drok-subtitle { color: #444; font-size: 10px; font-weight: 800; letter-spacing: 2px; }

        .drok-user-box { background: #0a0a0a; border: 1px solid #1a1a1a; padding: 10px; border-radius: 10px; display: flex; align-items: center; }
        .drok-avatar { width: 32px; height: 32px; background: #0d6efd; color: white; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 900; }
        .drok-role-tag { font-size: 9px; color: #0d6efd; font-weight: 800; text-transform: uppercase; }

        .drok-link { display: flex; align-items: center; padding: 12px 16px; color: #777; text-decoration: none; border-radius: 10px; margin-bottom: 4px; font-size: 0.9rem; transition: 0.2s; }
        .drok-link:hover { color: #fff; background: #0a0a0a; }
        .drok-link.active { color: #fff; background: #0d6efd; font-weight: 600; }

        /* BOTÓN LOGOUT */
        .drok-logout-solid {
          width: 100%; padding: 12px; background: #dc3545; color: white;
          border: none; border-radius: 10px; font-size: 0.85rem; font-weight: 700;
        }

        /* HEADER */
        .drok-header { 
          height: 65px; 
          background: #fff; 
          border-bottom: 1px solid #eee;
          flex-shrink: 0;
        }
        .header-title { color: #000; }
        .drok-burger { background: none; border: none; font-size: 2rem; color: #000; display: flex; align-items: center; }

        /* MÓVIL FIXES */
        @media (max-width: 768px) {
          .drok-header { background: #000 !important; border-bottom: 1px solid #111; }
          .header-title { color: #fff !important; }
          .drok-burger { color: #fff !important; } /* AHORA SE VE BLANCO EN MÓVIL */

          .drok-sidebar { position: fixed; left: 0; transform: translateX(-100%); }
          .drok-sidebar.mobile-on { transform: translateX(0); }
          .drok-blur-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 1050; }
        }

        .container-fluid { width: 100% !important; }
      `}</style>
    </div>
  );
};

export default Dashboard;
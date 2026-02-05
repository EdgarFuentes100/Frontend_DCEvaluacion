import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../auth/AuthProvider";

const PagePruebas = () => {
    const { user, logout } = useAuthContext();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    const pruebas = [
        {
            id: 1,
            titulo: "Mecanografía",
            descripcion: "Evalúa la velocidad y precisión al escribir con una prueba cronometrada.",
            ruta: "/mecanografia",
            icono: "bi-keyboard",
            tiempo: "5 min"
        },
        {
            id: 2,
            titulo: "Excel",
            descripcion: "Evalúa el manejo de fórmulas, tablas dinámicas y análisis de datos.",
            ruta: "/excel",
            icono: "bi-file-earmark-spreadsheet",
            tiempo: "25 min"
        },
        {
            id: 3,
            titulo: "Psicológica",
            descripcion: "Evalúa razonamiento lógico, personalidad y habilidades cognitivas.",
            ruta: "/pruebas/psicologica",
            icono: "bi-person-badge",
            tiempo: "30 min"
        }
    ];

    return (
        <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "#f2f3f5" }}>
            
            {/* NAVBAR */}
            <nav className="navbar navbar-dark bg-dark shadow-sm">
                <div className="container-fluid px-4">
                    <div className="navbar-brand d-flex align-items-center">
                        <i className="bi bi-clipboard-check fs-4 me-2"></i>
                        <span className="fw-bold">DROK</span>
                        <span className="ms-2 text-secondary small">Sistema de Evaluación</span>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                        {user && (
                            <div className="text-end text-white d-none d-md-block">
                                <small className="text-secondary">Usuario</small>
                                <div className="fw-semibold">
                                    {user.nombreCompleto || user.email}
                                </div>
                            </div>
                        )}
                        <button
                            className="btn btn-outline-light btn-sm"
                            onClick={handleLogout}
                        >
                            <i className="bi bi-box-arrow-right me-1"></i>
                            Salir
                        </button>
                    </div>
                </div>
            </nav>

            {/* CONTENIDO */}
            <main className="container-fluid px-4 py-5 flex-grow-1">

                {/* HEADER */}
                <div className="mb-5">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        <h1 className="h4 fw-bold text-dark mb-2">
                            Pruebas Disponibles
                        </h1>
                        <p className="text-muted mb-0">
                            Seleccione la evaluación asignada. Cada prueba mide competencias específicas.
                        </p>
                    </div>
                </div>

                {/* TARJETAS */}
                <div className="row g-4">
                    {pruebas.map(prueba => (
                        <div key={prueba.id} className="col-lg-4 col-md-6">
                            <div className="card h-100 border-0 shadow-sm rounded-4">
                                <div className="card-body p-4 d-flex flex-column">

                                    <div className="d-flex align-items-center mb-3">
                                        <div className="bg-dark bg-opacity-10 rounded-3 p-3 me-3">
                                            <i className={`bi ${prueba.icono} fs-3 text-dark`}></i>
                                        </div>
                                        <div>
                                            <h5 className="fw-bold mb-1">{prueba.titulo}</h5>
                                            <span className="badge bg-dark bg-opacity-10 text-dark">
                                                <i className="bi bi-clock me-1"></i>
                                                {prueba.tiempo}
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-muted flex-grow-1">
                                        {prueba.descripcion}
                                    </p>

                                    <button
                                        className="btn btn-dark w-100 py-2 fw-semibold mt-3"
                                        onClick={() => navigate(prueba.ruta)}
                                    >
                                        <i className="bi bi-play-circle me-2"></i>
                                        Iniciar Prueba
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* INSTRUCCIONES */}
                <div className="mt-5">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        <h5 className="fw-bold mb-4">
                            <i className="bi bi-info-circle me-2 text-dark"></i>
                            Recomendaciones
                        </h5>

                        <div className="row text-center">
                            <div className="col-md-3 col-6 mb-3">
                                <i className="bi bi-wifi fs-4 text-dark"></i>
                                <p className="small mt-2 mb-0">Internet estable</p>
                            </div>
                            <div className="col-md-3 col-6 mb-3">
                                <i className="bi bi-browser-chrome fs-4 text-dark"></i>
                                <p className="small mt-2 mb-0">Chrome recomendado</p>
                            </div>
                            <div className="col-md-3 col-6 mb-3">
                                <i className="bi bi-save fs-4 text-dark"></i>
                                <p className="small mt-2 mb-0">Guardado automático</p>
                            </div>
                            <div className="col-md-3 col-6 mb-3">
                                <i className="bi bi-x-circle fs-4 text-dark"></i>
                                <p className="small mt-2 mb-0">No recargar</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* FOOTER */}
            <footer className="bg-dark text-secondary py-3 mt-auto">
                <div className="container-fluid px-4 d-flex justify-content-between small">
                    <span>
                        <i className="bi bi-shield-lock me-1"></i>
                        Sistema seguro
                    </span>
                    <span>© 2024 DROK</span>
                </div>
            </footer>
        </div>
    );
};

export default PagePruebas;

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
            descripcion: "Evalúa la velocidad y precisión al escribir con una prueba cronometrada de 5 minutos.",
            ruta: "/mecanografia",
            color: "primary",
            icono: "bi-keyboard",
            tiempo: "5 min"
        },
        {
            id: 2,
            titulo: "Excel",
            descripcion: "Prueba práctica que evalúa fórmulas, gráficos, tablas dinámicas y manejo de datos.",
            ruta: "/Excel",
            color: "success",
            icono: "bi-file-earmark-spreadsheet",
            tiempo: "25 min"
        },
        {
            id: 3,
            titulo: "Psicológica",
            descripcion: "Evaluación de personalidad, razonamiento lógico y habilidades cognitivas.",
            ruta: "/pruebas/psicologica",
            color: "warning",
            icono: "bi-person-badge",
            tiempo: "30 min"
        }
    ];

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            {/* Navbar negro */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow">
                <div className="container-fluid px-4">
                    <div className="navbar-brand d-flex align-items-center">
                        <i className="bi bi-clipboard-check text-white fs-4 me-2"></i>
                        <span className="fw-bold">Sistema de Evaluación</span>
                    </div>
                    
                    <div className="d-flex align-items-center">
                        {user && (
                            <div className="text-white me-3 d-none d-md-block">
                                <small>Bienvenido:</small>
                                <div className="fw-semibold">{user.name || user.email}</div>
                            </div>
                        )}
                        <button 
                            className="btn btn-outline-light btn-sm"
                            onClick={handleLogout}
                        >
                            <i className="bi bi-box-arrow-right me-2"></i> 
                            Salir
                        </button>
                    </div>
                </div>
            </nav>

            {/* Contenido principal */}
            <main className="container-fluid px-4 py-4 flex-grow-1">
                {/* Título principal */}
                <div className="row mb-5">
                    <div className="col-12">
                        <div className="bg-white rounded shadow-sm p-4">
                            <h1 className="h3 fw-bold text-dark mb-3">Pruebas Disponibles</h1>
                            <p className="text-muted mb-0">
                                Seleccione una de las siguientes pruebas para evaluar sus competencias profesionales. 
                                Cada prueba está diseñada para medir habilidades específicas requeridas.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tarjetas de pruebas */}
                <div className="row g-4">
                    {pruebas.map((prueba) => (
                        <div className="col-xl-4 col-md-6 col-12" key={prueba.id}>
                            <div className="card h-100 border-0 shadow-sm">
                                <div className="card-body p-4 d-flex flex-column">
                                    {/* Encabezado de tarjeta */}
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div className="d-flex align-items-center">
                                            <div className={`bg-${prueba.color} bg-opacity-10 p-3 rounded-3 me-3`}>
                                                <i className={`bi ${prueba.icono} fs-3 text-${prueba.color}`}></i>
                                            </div>
                                            <div>
                                                <h3 className="h5 fw-bold mb-1">{prueba.titulo}</h3>
                                                <span className={`badge bg-${prueba.color} bg-opacity-25 text-${prueba.color}`}>
                                                    <i className="bi bi-clock me-1"></i>
                                                    {prueba.tiempo}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Descripción */}
                                    <p className="card-text text-muted mb-4 flex-grow-1">
                                        {prueba.descripcion}
                                    </p>
                                    
                                    {/* Botón */}
                                    <div className="mt-auto">
                                        <button
                                            className={`btn btn-${prueba.color} w-100 py-3 fw-semibold`}
                                            onClick={() => navigate(prueba.ruta)}
                                        >
                                            <i className="bi bi-play-circle me-2"></i>
                                            Iniciar Prueba
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Instrucciones */}
                <div className="row mt-5">
                    <div className="col-12">
                        <div className="bg-white rounded shadow-sm p-4">
                            <h4 className="fw-bold mb-4 text-dark">
                                <i className="bi bi-exclamation-circle text-warning me-2"></i>
                                Instrucciones Importantes
                            </h4>
                            <div className="row">
                                <div className="col-md-3 col-6 mb-3">
                                    <div className="text-center">
                                        <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-2">
                                            <i className="bi bi-wifi text-primary fs-4"></i>
                                        </div>
                                        <h6 className="fw-bold">Conexión</h6>
                                        <p className="text-muted small mb-0">Internet estable</p>
                                    </div>
                                </div>
                                <div className="col-md-3 col-6 mb-3">
                                    <div className="text-center">
                                        <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex p-3 mb-2">
                                            <i className="bi bi-browser-chrome text-success fs-4"></i>
                                        </div>
                                        <h6 className="fw-bold">Navegador</h6>
                                        <p className="text-muted small mb-0">Chrome recomendado</p>
                                    </div>
                                </div>
                                <div className="col-md-3 col-6 mb-3">
                                    <div className="text-center">
                                        <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex p-3 mb-2">
                                            <i className="bi bi-save text-info fs-4"></i>
                                        </div>
                                        <h6 className="fw-bold">Guardado</h6>
                                        <p className="text-muted small mb-0">Automático</p>
                                    </div>
                                </div>
                                <div className="col-md-3 col-6 mb-3">
                                    <div className="text-center">
                                        <div className="bg-danger bg-opacity-10 rounded-circle d-inline-flex p-3 mb-2">
                                            <i className="bi bi-x-circle text-danger fs-4"></i>
                                        </div>
                                        <h6 className="fw-bold">Precaución</h6>
                                        <p className="text-muted small mb-0">No recargar</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer siempre abajo */}
            <footer className="bg-dark text-white mt-auto py-3">
                <div className="container-fluid px-4">
                    <div className="row align-items-center">
                        <div className="col-md-6">
                            <p className="mb-0 small">
                                <i className="bi bi-shield-lock me-2"></i>
                                Sistema seguro y confidencial
                            </p>
                        </div>
                        <div className="col-md-6 text-md-end">
                            <p className="mb-0 small">
                                <i className="bi bi-c-circle me-1"></i>
                                2024 Sistema de Evaluación. Todos los derechos reservados.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PagePruebas;
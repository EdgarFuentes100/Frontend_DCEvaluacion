import { useNavigate } from "react-router-dom";
import { useState } from "react";
import LoadingScreen from "./LoadingScreen";

const Header = ({ user, logout, showLogout = true }) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = () => {
        setIsLoading(true);

        setTimeout(() => {
            logout?.();
            navigate("/login", { replace: true });
        }, 1000); // tiempo de animación
    };

    return (
        <>
            <nav className="navbar navbar-dark bg-black shadow-lg py-3 px-4 mx-3 mt-3 rounded-4">
                <div className="container-fluid">
                    <h2 
                        className="m-0 fw-900 text-white tracking-tighter" 
                        style={{ cursor: 'pointer', fontWeight: 900, letterSpacing: '-2px' }} 
                        onClick={() => navigate('/pruebas')}
                    >
                        DROK<span className="text-primary">.</span>
                    </h2>
                    
                    <div className="d-flex align-items-center gap-3">
                        {user && (
                            <div className="text-end text-white d-none d-md-block me-2">
                                <div className="fw-bold small">
                                    {user.nombreCompleto || user.email}
                                </div>
                                <div 
                                    className="text-primary" 
                                    style={{ fontSize: '10px', fontWeight: 800 }}
                                >
                                    CANDIDATO
                                </div>
                            </div>
                        )}

                        {showLogout && (
                            <button 
                                className="btn btn-danger fw-bold rounded-3 px-4 shadow-sm" 
                                onClick={handleLogout}
                            >
                                SALIR
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Pantalla de carga */}
            {isLoading && <LoadingScreen text="Cerrando sesión..." />}
        </>
    );
};

export default Header;

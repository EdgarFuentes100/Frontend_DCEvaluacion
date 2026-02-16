import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../auth/AuthProvider";
import { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const PagePruebas = () => {
    const { user, logout } = useAuthContext();
    const navigate = useNavigate();

    const [showModal, setShowModal] = useState(false);
    const [pruebaSeleccionada, setPruebaSeleccionada] = useState(null);

    const pruebas = [
        {
            id: 1,
            titulo: "Mecanografía",
            descripcion: "Evalúa tu velocidad y precisión al escribir.",
            ruta: "/mecanografia",
            imagen: "https://tse3.mm.bing.net/th/id/OIP.WjYu28sITBbcHYFAEMHs3QHaEO?rs=1&pid=ImgDetMain&o=7&rm=3",
            color: "#3b82f6"
        },
        {
            id: 2,
            titulo: "Análisis en Excel",
            descripcion: "Demuestra tus habilidades con fórmulas y datos.",
            ruta: "/excel",
            imagen: "https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&q=80&w=400",
            color: "#10b981"
        },
        {
            id: 3,
            titulo: "Perfil Psicológico",
            descripcion: "Test de aptitudes y personalidad.",
            ruta: "/pruebas/psicologica",
            imagen: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=400",
            color: "#8b5cf6"
        }
    ];

    const abrirModal = (prueba) => {
        setPruebaSeleccionada(prueba);
        setShowModal(true);
    };

    const confirmarInicio = () => {
        if (pruebaSeleccionada) {
            navigate(pruebaSeleccionada.ruta);
        }
    };

    return (
        <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "#f1f3f5" }}>
            
            <Header user={user} logout={logout} />

            <main className="container-fluid px-lg-5 px-3 py-4 flex-grow-1">
                <div className="mb-5 ms-2">
                    <div className="d-inline-block border-start border-primary border-4 ps-3">
                        <h5 className="fw-bold text-dark m-0" style={{ letterSpacing: '1px' }}>
                            CENTRO DE EVALUACIÓN
                        </h5>
                    </div>
                </div>

                <div className="row g-4 justify-content-center">
                    {pruebas.map(prueba => (
                        <div key={prueba.id} className="col-12 col-md-6 col-lg-4">
                            <div 
                                className="card h-100 border-0 shadow-lg rounded-5 overflow-hidden"
                                style={{ cursor: 'pointer', transition: '0.3s' }}
                                onClick={() => abrirModal(prueba)}
                            >
                                <div style={{ height: '8px', background: prueba.color }}></div>
                                <img 
                                    src={prueba.imagen} 
                                    alt={prueba.titulo} 
                                    className="w-100 object-fit-cover" 
                                    style={{ height: '180px' }} 
                                />
                                <div className="card-body p-4 text-center">
                                    <h3 className="fw-bold mb-3">{prueba.titulo}</h3>
                                    <p className="text-muted small mb-4">{prueba.descripcion}</p>
                                    <button className="btn btn-dark w-100 py-3 rounded-4 fw-bold">
                                        COMENZAR
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* MODAL DE CONFIRMACIÓN */}
            {showModal && pruebaSeleccionada && (
                <div 
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                    style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}
                >
                    <div className="bg-white p-4 rounded-4 shadow-lg text-center" style={{ width: "400px" }}>
                        <h4 className="fw-bold mb-3">
                            Confirmar Inicio
                        </h4>

                        <p className="mb-3">
                            Estás a punto de iniciar:
                        </p>

                        <h5 className="fw-bold text-primary mb-4">
                            {pruebaSeleccionada.titulo}
                        </h5>

                        <p className="text-muted small mb-4">
                            Una vez iniciada la prueba no podrás regresar.
                        </p>

                        <div className="d-flex gap-3">
                            <button 
                                className="btn btn-secondary w-50 rounded-3"
                                onClick={() => setShowModal(false)}
                            >
                                Cancelar
                            </button>

                            <button 
                                className="btn btn-success w-50 rounded-3 fw-bold"
                                onClick={confirmarInicio}
                            >
                                Sí, iniciar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />

            <style>{`
                .rounded-5 { border-radius: 24px !important; }
                .card:hover { transform: translateY(-8px); }
            `}</style>
        </div>
    );
};

export default PagePruebas;

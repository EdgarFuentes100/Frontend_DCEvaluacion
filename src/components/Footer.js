const Footer = () => {
    return (
        <footer className="mt-auto mx-3 mb-3">
            <div className="bg-white rounded-4 p-4 shadow-sm d-flex justify-content-between align-items-center border border-light">
                <p className="m-0 small text-muted fw-bold">© 2026 DROK HR SYSTEMS</p>
                <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-success-subtle text-success border border-success-subtle d-none d-sm-inline-block">
                        SISTEMA SEGURO
                    </span>
                    <i className="bi bi-shield-fill-check text-success fs-4"></i>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
import { useEffect, useState, useCallback } from "react";
import { useFetch } from "../../api/useFetch";
import { ModelUsuario } from "./ModelUsuario";

const useUsuarios = () => {
  const { getFetch, postFetch, putFetch } = useFetch();

  const [usuarios, setUsuarios] = useState([]);
  const [showSubModal, setShowSubModal] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [operacion, setOperacion] = useState(1); // 1 = crear | 2 = editar
  const [errores, setErrores] = useState({});

  /* ===== LISTAR ===== */
  const listarUsuarios = useCallback(async () => {
    const res = await getFetch("usuarios/listar");
    if (res.ok) setUsuarios(res.datos);
  }, [getFetch]);

  useEffect(() => {
    listarUsuarios();
  }, [listarUsuarios]);

  /* ===== ABRIR MODAL ===== */
  const openSubModal = (op, usuario = ModelUsuario()) => {
    setOperacion(op);
    setUsuarioSeleccionado(
      op === 2
        ? usuario
        : {
            ...ModelUsuario(),
            duracionPinMin: 60 // valor por defecto
          }
    );
    setErrores({});
    setShowSubModal(true);
  };

  const closeSubModal = () => {
    setShowSubModal(false);
    setUsuarioSeleccionado(null);
  };

  /* ===== HANDLE CHANGE (minutos como número) ===== */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setUsuarioSeleccionado((prev) => ({
      ...prev,
      [name]: name === "duracionPinMin" ? Number(value) : value
    }));
  };

  /* ===== VALIDAR Y GUARDAR ===== */
  const handleContinue = () => {
    const err = {};

    if (!usuarioSeleccionado.nombreCompleto) err.nombreCompleto = true;
    if (!usuarioSeleccionado.dui) err.dui = true;
    if (!usuarioSeleccionado.idRol) err.idRol = true;

    if (
      !usuarioSeleccionado.duracionPinMin ||
      usuarioSeleccionado.duracionPinMin <= 0
    ) {
      err.duracionPinMin = true;
    }

    if (operacion === 1 && !usuarioSeleccionado.pinCode) {
      err.pinCode = true;
    }

    setErrores(err);
    if (Object.keys(err).length > 0) return;

    if (operacion === 1) crearUsuario();
    else editarUsuario();

    closeSubModal();
  };

  /* ===== CREAR ===== */
  const crearUsuario = async () => {
    console.log("CREAR:", usuarioSeleccionado);
    const res = await postFetch("usuarios", usuarioSeleccionado);
    if (res.ok) listarUsuarios();
  };

  /* ===== EDITAR ===== */
  const editarUsuario = async () => {
    console.log("EDITAR:", usuarioSeleccionado);
    const res = await putFetch(
      `usuarios/${usuarioSeleccionado.idUsuario}`,
      usuarioSeleccionado
    );
    if (res.ok) listarUsuarios();
  };

  return {
    usuarios,
    showSubModal,
    openSubModal,
    closeSubModal,
    handleContinue,
    handleChange,
    usuarioSeleccionado,
    operacion,
    errores
  };
};

export { useUsuarios };

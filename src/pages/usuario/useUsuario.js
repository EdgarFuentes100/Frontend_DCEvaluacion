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
            duracionPinMin: 60
          }
    );
    setErrores({});
    setShowSubModal(true);
  };

  const closeSubModal = () => {
    setShowSubModal(false);
    setUsuarioSeleccionado(null);
  };

  /* ===== HANDLE CHANGE ===== */
  const handleChange = (e) => {
    let { name, value } = e.target;

    // ===== FORMATEO DUI =====
    if (name === "dui") {
      // eliminar todo lo que no sea número
      value = value.replace(/\D/g, "");

      // máximo 9 dígitos
      if (value.length > 9) return;

      // agregar guion automático
      if (value.length > 8) {
        value = value.slice(0, 8) + "-" + value.slice(8);
      }
    }

    // duración como número
    if (name === "duracionPinMin") {
      value = Number(value);
    }

    setUsuarioSeleccionado((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  /* ===== VALIDAR Y GUARDAR ===== */
  const handleContinue = () => {
    const err = {};

    const duiRegex = /^\d{8}-\d{1}$/;
    const nombreRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/;

    // Nombre obligatorio y solo letras
    if (
      !usuarioSeleccionado.nombreCompleto ||
      !nombreRegex.test(usuarioSeleccionado.nombreCompleto)
    ) {
      err.nombreCompleto = true;
    }

    // DUI obligatorio y formato correcto
    if (
      !usuarioSeleccionado.dui ||
      !duiRegex.test(usuarioSeleccionado.dui)
    ) {
      err.dui = true;
    }

    // Rol obligatorio
    if (!usuarioSeleccionado.idRol) {
      err.idRol = true;
    }

    // Duración válida
    if (
      !usuarioSeleccionado.duracionPinMin ||
      usuarioSeleccionado.duracionPinMin <= 0
    ) {
      err.duracionPinMin = true;
    }

    // PIN obligatorio al crear
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

import { useEffect, useState } from "react";
import { useFetch } from "../../api/useFetch";
import { ModelUsuario } from "./ModelUsuario";

const useUsuarios = () => {
  const { getFetch, postFetch, putFetch} = useFetch();

  const [usuarios, setUsuarios] = useState([]);
  const [showSubModal, setShowSubModal] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [operacion, setOperacion] = useState(1);
  const [errores, setErrores] = useState({});

  useEffect(() => {
    listarUsuarios();
  }, []);

  const listarUsuarios = async () => {
    const res = await getFetch("usuarios/listar");
    if (res.ok) setUsuarios(res.datos);
  };

  const openSubModal = (op, usuario = ModelUsuario()) => {
    setOperacion(op);
    setUsuarioSeleccionado(op === 2 ? usuario : ModelUsuario());
    setErrores({});
    setShowSubModal(true);
  };

  const closeSubModal = () => {
    setShowSubModal(false);
    setUsuarioSeleccionado(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUsuarioSeleccionado(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContinue = () => {
    const err = {};

    if (!usuarioSeleccionado.nombreCompleto) err.nombreCompleto = true;
    if (!usuarioSeleccionado.dui) err.dui = true;
    if (!usuarioSeleccionado.idRol) err.idRol = true;

    // 🔐 PIN obligatorio SOLO al crear
    if (operacion === 1 && !usuarioSeleccionado.pinCode) {
      err.pinCode = true;
    }

    setErrores(err);
    if (Object.keys(err).length > 0) return;

    if (operacion === 1) crearUsuario();
    else editarUsuario();

    closeSubModal();
  };

  const crearUsuario = async () => {
    const res = await postFetch("usuarios", usuarioSeleccionado);
    if (res.ok) listarUsuarios();
  };

  const editarUsuario = async () => {
    const res = await putFetch(`usuarios/${usuarioSeleccionado.idUsuario}`,usuarioSeleccionado);
    console.log(usuarioSeleccionado, usuarioSeleccionado.idUsuario );
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

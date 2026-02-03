function ModelUsuario(
  idUsuario = 0,
  idPersona = 0,
  nombreCompleto = "",
  dui = "",
  idRol = 0,
  rol = "",
  pinCode = "",
  duracionPinMin = 5,
  activo = 1
) {
  return {
    idUsuario,
    idPersona,
    nombreCompleto,
    dui,
    idRol,
    rol,
    pinCode,
    duracionPinMin,
    activo
  };
}

export { ModelUsuario };

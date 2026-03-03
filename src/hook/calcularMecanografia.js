export function calcularMecanografia({
  textoUsuario,
  textoBase,
  tiempoSegundos
}) {
  const caracteresTotales = textoUsuario.length;

  if (caracteresTotales === 0 || tiempoSegundos <= 0) {
    return {
      ppm: 0,
      precision: 0,
      errores: 0,
      caracteresCorrectos: 0,
    };
  }

  let errores = 0;
  for (let i = 0; i < caracteresTotales; i++) {
    if (textoUsuario[i] !== textoBase[i]) errores++;
  }

  const caracteresCorrectos = caracteresTotales - errores;

  // Fórmula ISO / Profesional
  const ppm =
    Math.round(((caracteresCorrectos * 60) / (5 * tiempoSegundos)));

  const precision =
    Math.round((caracteresCorrectos / caracteresTotales) * 100);

  return {
    ppm,
    precision,
    errores,
    caracteresCorrectos,
  };
}
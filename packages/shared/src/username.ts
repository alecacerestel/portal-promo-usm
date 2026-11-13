/** "José Ignacio" → "jose", "De la Fuente" → "delafuente", "Muñoz" → "munoz" */
function normalizar(texto: string, soloPrimeraPalabra: boolean): string {
  const base = texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
  const palabras = base.split(/\s+/);
  return (soloPrimeraPalabra ? palabras[0] : palabras.join('')).replace(/[^a-z]/g, '');
}

/**
 * Nombres de usuario a probar, en orden de preferencia, para una persona nueva:
 *
 *   1. nombre.apellido            juan.perez
 *   2. + inicial 2º apellido      juan.perez.g    (si tiene segundo apellido)
 *   3. + número                   juan.perez2, juan.perez3, …
 *
 * Quien crea la cuenta toma el primero que no esté ocupado.
 */
export function* candidatosUsername(
  nombres: string,
  apellidoPaterno: string,
  apellidoMaterno?: string | null,
): Generator<string> {
  const base = `${normalizar(nombres, true)}.${normalizar(apellidoPaterno, false)}`;
  yield base;

  const inicialMaterno = apellidoMaterno ? normalizar(apellidoMaterno, false)[0] : undefined;
  if (inicialMaterno) yield `${base}.${inicialMaterno}`;

  for (let n = 2; ; n++) yield `${base}${n}`;
}

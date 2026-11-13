/** RUT chileno separado en cuerpo (solo dígitos, sin puntos) y dígito verificador (0-9 o K). */
export interface Rut {
  cuerpo: string;
  dv: string;
}

/** Calcula el dígito verificador con el algoritmo módulo 11. */
export function calcularDv(cuerpo: string): string {
  let suma = 0;
  let multiplicador = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  const resto = 11 - (suma % 11);
  if (resto === 11) return '0';
  if (resto === 10) return 'K';
  return String(resto);
}

/**
 * Interpreta un RUT escrito de cualquier forma ("20.371.582-k", "20371582K", "20371582-K").
 * Devuelve null si el formato o el dígito verificador no son válidos.
 */
export function parsearRut(texto: string): Rut | null {
  const limpio = texto.replace(/[.\s-]/g, '').toUpperCase();
  const match = /^(\d{7,8})([\dK])$/.exec(limpio);
  if (!match) return null;
  const [, cuerpo, dv] = match;
  return calcularDv(cuerpo) === dv ? { cuerpo, dv } : null;
}

/** "20371582", "K" → "20.371.582-K" */
export function formatearRut({ cuerpo, dv }: Rut): string {
  return `${cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`;
}

/** Clave temporal de una cuenta nueva: los 6 dígitos anteriores al dígito verificador. */
export function claveTemporal(cuerpo: string): string {
  return cuerpo.slice(-6);
}

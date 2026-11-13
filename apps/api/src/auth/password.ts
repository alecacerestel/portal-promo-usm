import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from 'node:crypto';

// Parámetros scrypt: N=2^15, r=8, p=1 (~32 MB por hash)
const N = 2 ** 15;
const R = 8;
const P = 1;
const LARGO = 64;

function derivar(password: string, salt: Buffer, opciones: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, LARGO, { ...opciones, maxmem: 128 * N * R * 2 }, (err, key) =>
      err ? reject(err) : resolve(key),
    );
  });
}

/** Devuelve "scrypt$N$r$p$salt$hash" (salt y hash en base64). */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await derivar(password, salt, { N, r: R, p: P });
  return ['scrypt', N, R, P, salt.toString('base64'), hash.toString('base64')].join('$');
}

export async function verificarPassword(password: string, guardado: string): Promise<boolean> {
  const [algoritmo, n, r, p, salt, hash] = guardado.split('$');
  if (algoritmo !== 'scrypt' || !salt || !hash) return false;
  const esperado = Buffer.from(hash, 'base64');
  const obtenido = await derivar(password, Buffer.from(salt, 'base64'), {
    N: Number(n),
    r: Number(r),
    p: Number(p),
  });
  return obtenido.length === esperado.length && timingSafeEqual(obtenido, esperado);
}

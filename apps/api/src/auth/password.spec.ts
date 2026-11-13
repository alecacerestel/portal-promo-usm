import { hashPassword, verificarPassword } from './password.js';

describe('password', () => {
  it('verifica la contraseña correcta y rechaza las demás', async () => {
    const hash = await hashPassword('promo-segura-2026');
    expect(hash.startsWith('scrypt$')).toBe(true);
    await expect(verificarPassword('promo-segura-2026', hash)).resolves.toBe(true);
    await expect(verificarPassword('otra-clave', hash)).resolves.toBe(false);
  });

  it('genera un hash distinto cada vez (salt aleatorio)', async () => {
    expect(await hashPassword('igual')).not.toBe(await hashPassword('igual'));
  });

  it('rechaza hashes con formato desconocido', async () => {
    await expect(verificarPassword('x', 'md5$abc')).resolves.toBe(false);
  });
});

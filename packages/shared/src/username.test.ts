import { describe, expect, it } from 'vitest';
import { candidatosUsername } from './username.js';

function primeros(n: number, gen: Generator<string>): string[] {
  return Array.from({ length: n }, () => gen.next().value as string);
}

describe('candidatosUsername', () => {
  it('usa primer nombre y apellido paterno, sin tildes ni ñ', () => {
    expect(candidatosUsername('José Ignacio', 'Muñoz').next().value).toBe('jose.munoz');
  });

  it('junta apellidos compuestos', () => {
    expect(candidatosUsername('Ana', 'De la Fuente').next().value).toBe('ana.delafuente');
  });

  it('si está ocupado, prueba con la inicial del segundo apellido y luego números', () => {
    expect(primeros(4, candidatosUsername('Juan', 'Pérez', 'González'))).toEqual([
      'juan.perez',
      'juan.perez.g',
      'juan.perez2',
      'juan.perez3',
    ]);
  });

  it('sin segundo apellido pasa directo a números', () => {
    expect(primeros(2, candidatosUsername('Juan', 'Pérez'))).toEqual(['juan.perez', 'juan.perez2']);
  });
});

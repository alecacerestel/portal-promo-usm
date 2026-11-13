import { describe, expect, it } from 'vitest';
import { calcularDv, claveTemporal, formatearRut, parsearRut } from './rut.js';

describe('rut', () => {
  it('calcula el dígito verificador, incluidos K y 0', () => {
    expect(calcularDv('11111111')).toBe('1');
    expect(calcularDv('12345678')).toBe('5');
    expect(calcularDv('10000013')).toBe('K');
    expect(calcularDv('10000004')).toBe('0');
  });

  it('acepta el RUT escrito de distintas formas', () => {
    const esperado = { cuerpo: '12345678', dv: '5' };
    expect(parsearRut('12.345.678-5')).toEqual(esperado);
    expect(parsearRut('123456785')).toEqual(esperado);
    expect(parsearRut(' 12345678-5 ')).toEqual(esperado);
    expect(parsearRut('10000013-k')).toEqual({ cuerpo: '10000013', dv: 'K' });
  });

  it('rechaza dígito verificador incorrecto o formato inválido', () => {
    expect(parsearRut('12.345.678-9')).toBeNull();
    expect(parsearRut('abc')).toBeNull();
    expect(parsearRut('123-4')).toBeNull();
  });

  it('formatea con puntos y guion', () => {
    expect(formatearRut({ cuerpo: '12345678', dv: '5' })).toBe('12.345.678-5');
    expect(formatearRut({ cuerpo: '9876543', dv: '3' })).toBe('9.876.543-3');
  });

  it('la clave temporal son los 6 dígitos antes del verificador', () => {
    expect(claveTemporal('20371582')).toBe('371582');
    expect(claveTemporal('9876543')).toBe('876543');
  });
});

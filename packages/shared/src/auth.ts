import { z } from 'zod';
import { ESTADOS_STAFF, ROLES } from './roles.js';
import { parsearRut } from './rut.js';

export const PASSWORD_MIN = 8;

export const loginSchema = z.object({
  /** nombre.apellido o RUT */
  usuario: z.string().trim().min(1, 'Ingresa tu usuario o RUT'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const cambiarPasswordSchema = z
  .object({
    actual: z.string().min(1, 'Ingresa tu contraseña actual'),
    nueva: z.string().min(PASSWORD_MIN, `Mínimo ${PASSWORD_MIN} caracteres`),
  })
  .refine((d) => d.actual !== d.nueva, {
    message: 'La nueva contraseña debe ser distinta a la actual',
    path: ['nueva'],
  });
export type CambiarPasswordInput = z.infer<typeof cambiarPasswordSchema>;

export const crearUsuarioSchema = z.object({
  rut: z
    .string()
    .trim()
    .refine((v) => parsearRut(v) !== null, 'RUT inválido'),
  nombres: z.string().trim().min(1, 'Requerido'),
  apellidoPaterno: z.string().trim().min(1, 'Requerido'),
  apellidoMaterno: z.string().trim().optional(),
  email: z.email('Correo inválido').optional(),
  rol: z.enum(ROLES).default('STAFF'),
});
export type CrearUsuarioInput = z.input<typeof crearUsuarioSchema>;

/** Cambios a un usuario existente: solo se envían los campos que cambian. */
export const editarUsuarioSchema = z
  .object({
    nombres: z.string().trim().min(1, 'Requerido'),
    apellidoPaterno: z.string().trim().min(1, 'Requerido'),
    /** null o "" lo borra */
    apellidoMaterno: z.string().trim().nullable(),
    /** null o "" lo borra */
    email: z.union([z.email('Correo inválido'), z.literal(''), z.null()]),
    rol: z.enum(ROLES),
    estado: z.enum(ESTADOS_STAFF),
    activo: z.boolean(),
  })
  .partial()
  .refine((d) => Object.keys(d).length > 0, 'No hay cambios');
export type EditarUsuarioInput = z.input<typeof editarUsuarioSchema>;

/** Respuesta al resetear la clave de alguien: vuelve a la temporal. */
export interface ClaveReseteada {
  username: string;
  claveTemporal: string;
}

/** Datos de la sesión que la API entrega al frontend. */
export interface UsuarioSesion {
  id: string;
  username: string;
  nombres: string;
  apellidoPaterno: string;
  rol: (typeof ROLES)[number];
  debeCambiarPassword: boolean;
}

/** Respuesta al crear un usuario: el admin debe comunicarle estos datos a la persona. */
export interface UsuarioCreado {
  id: string;
  username: string;
  claveTemporal: string;
}

import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import type { Rol } from '@portal/shared';
import type { Usuario } from '../generated/prisma/client.js';

export const ES_PUBLICA = 'esPublica';
export const ROLES_PERMITIDOS = 'rolesPermitidos';
export const PERMITE_CAMBIO_PENDIENTE = 'permiteCambioPendiente';

/** La ruta no requiere sesión. */
export const Publica = () => SetMetadata(ES_PUBLICA, true);

/** Solo estos roles pueden usar la ruta. Sin este decorador basta con tener sesión. */
export const Roles = (...roles: Rol[]) => SetMetadata(ROLES_PERMITIDOS, roles);

/** La ruta se puede usar aunque el usuario aún no cambie su clave temporal. */
export const PermiteCambioPendiente = () => SetMetadata(PERMITE_CAMBIO_PENDIENTE, true);

/** Inyecta el usuario de la sesión actual. */
export const UsuarioActual = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): Usuario => ctx.switchToHttp().getRequest().usuario,
);

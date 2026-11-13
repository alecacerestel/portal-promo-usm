/** Roles del portal, de mayor a menor nivel de permisos. */
export const ROLES = ['ADMIN', 'COORDINADOR', 'APOYO_EVENTO', 'STAFF', 'POSTULANTE'] as const;
export type Rol = (typeof ROLES)[number];

/** Estado de un miembro del staff. GRADUADO lo hace aparecer en el Muro de Leyendas. */
export const ESTADOS_STAFF = ['ACTIVO', 'CONGELADO', 'INTERCAMBIO', 'GRADUADO'] as const;
export type EstadoStaff = (typeof ESTADOS_STAFF)[number];

# Roadmap — Portal Staff Promoción USM

> Proyecto estudiantil **no oficial**. Reimplementación moderna del sistema del Equipo de Promoción
> (difusion.usm.cl/equipo.php, Symfony 1.x) con todas sus funcionalidades actuales, más mejoras.

Leyenda: `[ ]` pendiente · `[~]` en progreso · `[x]` listo · ❓ falta info (requiere cuenta admin o capturas)

---

## Fase 0 — Fundaciones del proyecto

### Repo y buenas prácticas
- [ ] Repo público en GitHub, licencia (MIT), README con aviso "proyecto no oficial"
- [ ] Ramas: `main` (estable) · `develop` (integración) · `feature/*` · `fix/*` · `chore/*`
- [ ] Protección de ramas: PR obligatorio a `main`/`develop`, CI en verde para mergear
- [ ] Conventional Commits (`feat:`, `fix:`, `chore:`…) + commitlint + husky
- [ ] Templates de Issue y Pull Request, `CONTRIBUTING.md` (para cuando se sume más gente)
- [ ] GitHub Projects (tablero Kanban) con las tareas de este roadmap como Issues
- [ ] `.env.example` — **nunca** subir credenciales, datos reales ni dumps de BD
- [ ] Datos de prueba ficticios (seed con nombres/RUT inventados)

### Monorepo
- [ ] pnpm workspaces + Turborepo
- [ ] `apps/web` — Next.js + TypeScript + Tailwind + shadcn/ui
- [ ] `apps/api` — NestJS + Prisma + PostgreSQL
- [ ] `packages/shared` — tipos y validaciones Zod compartidas
- [ ] `packages/ui` — componentes y tokens de diseño USM
- [ ] ESLint + Prettier + TypeScript estricto en todo el monorepo
- [ ] Vitest (unit) + Playwright (e2e)

### Docker
- [ ] `docker-compose.yml`: postgres, api, web, minio (archivos), mailpit (correos de prueba)
- [ ] Un solo comando para levantar todo: `docker compose up`
- [ ] Hot reload en desarrollo

### CI (GitHub Actions)
- [ ] Lint + typecheck + tests + build en cada PR
- [ ] Build de imágenes Docker en `main`

---

## Fase 1 — Paridad: replicar TODO lo que existe hoy

### Autenticación y roles
- [x] Login con usuario `nombre.apellido` o RUT + contraseña
- [x] Admin/coordinador crea usuarios a partir de RUT + nombre (usuario generado automático)
- [x] Nombres repetidos: `juan.perez` → `juan.perez.g` → `juan.perez2`…
- [x] Contraseña inicial temporal + **cambio obligatorio en el primer login**
      (el esquema actual "6 dígitos del RUT" es adivinable; se mantiene solo como clave temporal)
- [x] Hash de contraseñas (scrypt), sesión en cookie httpOnly, límite de intentos de login
- [x] Cambiar contraseña
- [ ] Recuperar contraseña por correo
- [ ] Admin puede resetear la clave de alguien (vuelve a la temporal)
- [ ] Editar / desactivar usuarios, cambiar rol y estado
- [ ] Leer la sesión en el servidor con `use cache: private` para navegación instantánea
- [~] Roles (RBAC):
  - [x] **Admin** — todo
  - [x] **Coordinador** — crea apoyo de evento, staff y postulantes (¿por sede? ❓)
  - [ ] **Apoyo de evento** — permisos temporales solo para un evento (Puertas Abiertas, Día Cero…)
  - [ ] **Staff (promo)** — sus datos, calendario, material, rendiciones
  - [ ] **Postulante** — (flujo de reclutamiento queda para después, ver Fase 3)
- [~] Estado del staff: activo · congelado · en intercambio · graduado (en BD, falta pantalla)

### Notificaciones (inicio)
- [ ] Listado de notificaciones del usuario ❓ (contenido real no visible con cuenta postulante)

### Mis Datos
- [ ] **Mi perfil**: nombres, apellidos, RUT+DV, sexo, fecha de nacimiento, email, teléfono, celular,
      región/comuna, colegio de origen, sede, carrera, año de ingreso, dirección académica,
      banco, tipo y número de cuenta, foto, video, motivación
- [ ] **Disponibilidad horaria**: grilla bloques USM (1-2, 3-4…) × Lunes–Domingo, estado por bloque
- [ ] **Mis ingresos**: hojas traspasadas × monto por hoja, actividades sin pago, total

### Calendarización
- [ ] Vista mensual de **eventos** con filtros (mes/año, región, comuna, sede, tipo, nivel, estado, staff)
- [ ] Vista mensual de **actividades**
- [ ] Vista semanal ❓
- [ ] Resumen de fichas ❓
- [ ] Asignación de staff a eventos ❓

### Material
- [ ] **Foro** (categorías → temas → mensajes): ej. "Información Transversal", "Historia USM", "Becas y Premios"
- [ ] **Documentos**: listado con filtro por categoría, subir documento, CRUD de categorías
- [ ] **Noticias**: listado, crear/editar, CRUD de secciones ❓

### Inventario ❓
- [ ] Estado del inventario
- [ ] Préstamos (quién tiene qué, fecha de devolución)
- [ ] CRUD categorías / subcategorías / ítems

### Staff (admin/coordinador) ❓
- [ ] Listado de staff
- [ ] Cuadro de disponibilidad de todo el staff
- [ ] Planilla de pago
- [ ] Histórico de pagos

### Eventos ❓
- [ ] **Ensayo PSU/PAES**: crear evento, listado de eventos, listado de facsímiles
- [ ] **Talleres**: crear, listado, registrar ingreso, inscribir alumno, acreditación
- [ ] **Seminarios**: crear, listado

### Contacto ❓
- [ ] Crear contacto
- [ ] Registro de llamado
- [ ] Listado de preguntas por proceso (año)

### Puertas Abiertas
- [ ] Registrar asistentes: sede → portería (select anidado), RUT+DV o **código de barras**
- [ ] Asistentes por ruta
- [ ] Hora real de la ruta
- [ ] Estadísticas por sede: Casa Central (Valpo), Vitacura, San Joaquín, Concepción, Viña

### Call Centers ❓
- [ ] Campañas: Fidelización, Postulación, Matrícula, Matrícula Género, Matrícula BEA
- [ ] Por campaña: resumen de llamadas por staff y resumen de interés
- [ ] Locaciones: listado y creación

### Registrados ❓
- [ ] Listado de registrados (estudiantes interesados)
- [ ] Puntajes PSU/PAES
- [ ] Validar registrados

### Presupuestos
- [ ] Ingresar gastos
- [ ] Saldo de cuentas presupuestarias por proceso (año)
- [ ] Listado de gastos
- [ ] **Recuperación / Vales (rendiciones)**
- [ ] Proveedores

### Transversal
- [ ] Filtro por **proceso** (año de admisión) en todos los módulos
- [ ] Exportar listados a Excel/CSV
- [ ] Bitácora de auditoría (quién cambió qué)

---

## Fase 2 — Mejoras

### Rendiciones automáticas (reemplazo del Excel)
- [ ] Desde el teléfono: foto de la boleta → monto, fecha, proveedor, evento asociado (ej. "Feria Machalí")
- [ ] Lectura automática de la boleta (OCR) para prellenar los campos
- [ ] Estados: borrador → enviada → aprobada/rechazada → reembolsada
- [ ] Generar el Excel/PDF en el formato que pide hoy la U
- [ ] Coordinador revisa y aprueba desde el portal

### Móvil y sin conexión
- [ ] PWA instalable (ícono en el celular)
- [ ] Diseño mobile-first en todas las vistas
- [ ] Modo offline para registrar asistentes en Puertas Abiertas/ferias → sincroniza al volver la señal
- [ ] Escaneo de códigos de barra/QR con la cámara

### Inicio personalizado ("Mi semana")
- [ ] Actividades de la semana del usuario
- [ ] 🎂 Cumpleaños de la semana
- [ ] Cuenta regresiva: "faltan X días para Día Cero / Puertas Abiertas / PAES"
- [ ] Personalización: foto, tema claro/oscuro, preferencias de notificación

### Guía del Promo
- [ ] Material por tipo de actividad: charla, feria, viaje, Puertas Abiertas, Día Cero
- [ ] Checklists ("qué llevar a una feria"), links, presentaciones

### Muro de Leyendas ❤️
- [ ] Al pasar a estado **graduado**, el promo aparece en el muro
- [ ] El propio promo controla sus datos: foto, generación, año de ingreso/egreso, LinkedIn,
      contacto (cada dato con opción de mostrar/ocultar)
- [ ] Otros promos escriben anécdotas en su muro (con moderación del coordinador)
- [ ] Reacciones

### CRM estilo HubSpot
- [ ] Ficha única del estudiante interesado con timeline (eventos donde asistió, llamados, interés)
- [ ] Pipeline: interesado → registrado → postulante → matriculado
- [ ] Unificar Registrados + Call Centers + Contacto + Puertas Abiertas sobre ese modelo

### Diseño
- [ ] Tokens de color sacados de usm.cl / manual de marca USM
- [ ] Transiciones entre páginas (Framer Motion / View Transitions) al estilo usm.cl
- [ ] Accesibilidad (contraste, teclado, lectores de pantalla)

---

## Fase 3 — Más adelante
- [ ] Reclutamiento: postulación a promo → entrevista → aceptación (flujo dentro del portal)
- [ ] Migración de datos desde el sistema actual (si se consigue acceso admin)
- [ ] Notificaciones por correo / push
- [ ] Login con cuenta institucional @usm.cl (si la U lo permite)

## Deployment (por definir)
- [ ] Averiguar con la DTI USM si hay servidores/VM disponibles para el proyecto
- [ ] Alternativa externa (Railway, Fly.io, VPS) mientras tanto
- [ ] Dominio, HTTPS, respaldos automáticos de la BD
- [ ] Ambientes: `staging` (develop) y `production` (main)

---

## Pendientes de información
- [ ] Capturas o acceso admin de las secciones marcadas ❓
- [ ] Formato del Excel de rendición actual
- [ ] Manual de marca / colores oficiales USM
- [ ] ¿Coordinadores por sede o globales?

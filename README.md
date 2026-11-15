# Portal Staff Promoción USM

Portal web para el Equipo de Promoción de la Universidad Técnica Federico Santa María:
calendario de eventos, disponibilidad, material, inventario, Puertas Abiertas, call centers,
rendiciones y más. Funciona en el celular y fuera de la red de la universidad.

> **Proyecto estudiantil no oficial.** No está afiliado ni respaldado por la USM.
> Este repositorio no contiene datos reales: solo datos de prueba ficticios.

El plan completo está en [ROADMAP.md](ROADMAP.md).

## Stack

| Parte      | Tecnología                               |
| ---------- | ---------------------------------------- |
| Monorepo   | pnpm workspaces + Turborepo              |
| Frontend   | Next.js, React, TypeScript, Tailwind CSS |
| Backend    | NestJS, Prisma, PostgreSQL               |
| Compartido | `packages/shared` (tipos y constantes)   |
| Infra      | Docker Compose, GitHub Actions           |

```
apps/
  web/        Frontend (Next.js)            → http://localhost:3000
  api/        Backend (NestJS + Prisma)     → http://localhost:4000
packages/
  shared/     Tipos y constantes compartidos
```

## Requisitos

- Node.js 26 (`fnm use` toma la versión de `.nvmrc`)
- pnpm 10 (`npm i -g pnpm@10`)
- Docker Desktop

## Primeros pasos

```bash
cp .env.example .env        # variables de entorno locales
pnpm install
pnpm db:up                  # Postgres en Docker
pnpm --filter @portal/api db:migrate
pnpm --filter @portal/api db:seed    # crea el primer admin
pnpm dev                    # web + api con recarga automática
```

Abre http://localhost:3000 y entra con usuario `admin.promo` y clave temporal `111111`
(datos ficticios de desarrollo). Te pedirá cambiarla en el primer ingreso.

### Cuentas de usuario

- El admin (o un coordinador) crea la cuenta con RUT y nombre desde **Usuarios**.
- El usuario se genera como `nombre.apellido`. Si ya existe, se prueba `nombre.apellido.<inicial 2º apellido>`
  y luego `nombre.apellido2`, `nombre.apellido3`…
- La clave temporal son los 6 dígitos antes del verificador del RUT. Se debe cambiar en el primer ingreso.
- Se puede entrar con el usuario o con el RUT.

Para levantar todo dentro de Docker (sin Node local):

```bash
docker compose --profile app up --build
```

## Comandos

| Comando                                | Qué hace                             |
| -------------------------------------- | ------------------------------------ |
| `pnpm dev`                             | Levanta web y api en modo desarrollo |
| `pnpm build`                           | Compila todo                         |
| `pnpm lint` / `pnpm typecheck`         | Revisa estilo y tipos                |
| `pnpm test`                            | Corre los tests                      |
| `pnpm --filter @portal/api db:migrate` | Crea/aplica migraciones de la BD     |
| `pnpm --filter @portal/api db:studio`  | Abre Prisma Studio para ver la BD    |

## Cómo contribuir

Ramas:

- `main`: versión estable. Solo recibe merges desde `develop`.
- `develop`: integración. Aquí llegan los PR.
- `feature/<algo>`, `fix/<algo>`, `chore/<algo>`: tu trabajo, creada desde `develop`.

Flujo:

1. Toma un issue del tablero y crea tu rama: `git switch develop && git switch -c feature/disponibilidad-horaria`
2. Commits con [Conventional Commits](https://www.conventionalcommits.org/es/): `feat: agrega grilla de disponibilidad`
3. Abre un PR hacia `develop`. El CI debe quedar en verde.

**Nunca** subas credenciales, archivos `.env`, respaldos de base de datos ni datos personales reales.

## Licencia

[MIT](LICENSE)

# Se construye desde la raíz del monorepo: docker build -f apps/api/Dockerfile .
FROM node:26-alpine
RUN npm i -g pnpm@10.34.9
WORKDIR /repo

COPY . .
RUN pnpm install --frozen-lockfile --filter @portal/api...
RUN pnpm --filter @portal/api... build

WORKDIR /repo/apps/api
EXPOSE 4000
# Aplica las migraciones pendientes y arranca la API
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node dist/main.js"]

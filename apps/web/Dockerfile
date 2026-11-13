# Se construye desde la raíz del monorepo: docker build -f apps/web/Dockerfile .
FROM node:26-alpine
RUN npm i -g pnpm@10.34.9
WORKDIR /repo

# Next fija los rewrites (/api/* → API) al compilar, por eso la URL va como build arg
ARG API_URL
ENV API_URL=$API_URL
ENV NEXT_TELEMETRY_DISABLED=1

COPY . .
RUN pnpm install --frozen-lockfile --filter @portal/web...
RUN pnpm --filter @portal/web... build

WORKDIR /repo/apps/web
EXPOSE 3000
CMD ["pnpm", "start"]

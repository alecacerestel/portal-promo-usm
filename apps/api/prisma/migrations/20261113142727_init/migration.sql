-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'COORDINADOR', 'APOYO_EVENTO', 'STAFF', 'POSTULANTE');

-- CreateEnum
CREATE TYPE "EstadoStaff" AS ENUM ('ACTIVO', 'CONGELADO', 'INTERCAMBIO', 'GRADUADO');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "rut" TEXT NOT NULL,
    "dv" CHAR(1) NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidoPaterno" TEXT NOT NULL,
    "apellidoMaterno" TEXT,
    "email" TEXT,
    "passwordHash" TEXT NOT NULL,
    "debeCambiarPassword" BOOLEAN NOT NULL DEFAULT true,
    "rol" "Rol" NOT NULL DEFAULT 'STAFF',
    "estado" "EstadoStaff" NOT NULL DEFAULT 'ACTIVO',
    "fechaNacimiento" DATE,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_username_key" ON "Usuario"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_rut_key" ON "Usuario"("rut");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

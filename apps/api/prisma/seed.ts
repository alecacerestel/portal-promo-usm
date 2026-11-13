// Crea el primer administrador para poder entrar al portal.
// Uso: pnpm --filter @portal/api db:seed
import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { claveTemporal, parsearRut } from '@portal/shared';
import { hashPassword } from '../src/auth/password.js';
import { PrismaClient } from '../src/generated/prisma/client.js';

config({ path: '../../.env' });

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

// RUT ficticio por defecto; en producción se define SEED_ADMIN_RUT con el real
const rut = parsearRut(process.env.SEED_ADMIN_RUT ?? '11.111.111-1');
if (!rut) throw new Error('SEED_ADMIN_RUT inválido');

const clave = claveTemporal(rut.cuerpo);
const admin = await prisma.usuario.upsert({
  where: { rut: rut.cuerpo },
  update: {},
  create: {
    username: 'admin.promo',
    rut: rut.cuerpo,
    dv: rut.dv,
    nombres: 'Admin',
    apellidoPaterno: 'Promo',
    rol: 'ADMIN',
    passwordHash: await hashPassword(clave),
  },
});

console.log(`Admin listo → usuario: ${admin.username} · clave temporal: ${clave}`);
await prisma.$disconnect();

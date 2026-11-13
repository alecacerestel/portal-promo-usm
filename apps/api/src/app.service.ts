import { Injectable } from '@nestjs/common';
import { ROLES } from '@portal/shared';
import { PrismaService } from './prisma/prisma.service.js';

export interface Health {
  status: 'ok' | 'error';
  database: 'ok' | 'error';
  roles: readonly string[];
}

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async health(): Promise<Health> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', database: 'ok', roles: ROLES };
    } catch {
      return { status: 'error', database: 'error', roles: ROLES };
    }
  }
}

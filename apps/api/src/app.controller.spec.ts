import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaService } from './prisma/prisma.service.js';

describe('AppController', () => {
  let appController: AppController;
  const prisma = { $queryRaw: vi.fn() };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('reporta ok cuando la base de datos responde', async () => {
    prisma.$queryRaw.mockResolvedValueOnce([1]);
    await expect(appController.health()).resolves.toMatchObject({ status: 'ok', database: 'ok' });
  });

  it('reporta error cuando la base de datos no responde', async () => {
    prisma.$queryRaw.mockRejectedValueOnce(new Error('sin conexión'));
    await expect(appController.health()).resolves.toMatchObject({ status: 'error' });
  });
});

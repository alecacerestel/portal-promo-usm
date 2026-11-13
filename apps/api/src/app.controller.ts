import { Controller, Get } from '@nestjs/common';
import { AppService, type Health } from './app.service.js';
import { Publica } from './auth/decorators.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Publica()
  @Get('health')
  health(): Promise<Health> {
    return this.appService.health();
  }
}

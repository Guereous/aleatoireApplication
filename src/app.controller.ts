import { Body, Controller, Get, Post, BadRequestException } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('api/time')
  getTime(): { nowIso: string } {
    return { nowIso: new Date().toISOString() };
  }

  @Post('api/random')
  getRandom(@Body() body: { min: number; max: number; count: number }): { numbers: number[] } {
    const min = Number(body?.min);
    const max = Number(body?.max);
    const count = Number(body?.count);

    if (!Number.isFinite(min) || !Number.isFinite(max) || !Number.isFinite(count)) {
      throw new BadRequestException('Paramètres invalides');
    }
    if (!Number.isInteger(min) || !Number.isInteger(max) || !Number.isInteger(count)) {
      throw new BadRequestException('Les valeurs doivent être des entiers');
    }
    if (min > max) {
      throw new BadRequestException('min doit être ≤ max');
    }
    if (count < 1) {
      throw new BadRequestException('count doit être ≥ 1');
    }
    const rangeSize = max - min + 1;
    if (count > rangeSize) {
      throw new BadRequestException(`count (${count}) dépasse la taille de plage (${rangeSize})`);
    }

    const unique = new Set<number>();
    while (unique.size < count) {
      const n = Math.floor(Math.random() * (max - min + 1)) + min;
      unique.add(n);
    }
    return { numbers: Array.from(unique.values()) };
  }
}

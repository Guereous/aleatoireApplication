import { Body, Controller, Get, Post, BadRequestException } from '@nestjs/common';
import { AppService } from './app.service';
import { RandomService } from './random.service';
import { SessionService } from './session.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly randomService: RandomService,
    private readonly sessionService: SessionService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('api/time')
  getTime(): { nowIso: string } {
    return { nowIso: new Date().toISOString() };
  }

  @Post('api/random')
  getRandom(
    @Body()
    body: {
      min: number;
      max: number;
      count: number;
      sort?: 'asc' | 'desc' | 'none';
      noDuplicates?: boolean;
      persist?: boolean;
      sessionId?: string;
    },
  ): { numbers: number[]; persistedId?: string; sessionId: string } {
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

    // Gestion des sessions
    let sessionId = body?.sessionId;
    if (!sessionId) {
      sessionId = this.sessionService.createSession();
    } else {
      // Vérifier que la session existe
      const session = this.sessionService.getSession(sessionId);
      if (!session) {
        throw new BadRequestException('Session invalide');
      }
    }

    const noDuplicates = Boolean(body?.noDuplicates);
    let numbers: number[] = [];
    
    if (noDuplicates) {
      // Récupérer les numéros déjà tirés dans cette session
      const alreadyDrawn = this.sessionService.getDrawnNumbers(sessionId);
      const unique = new Set<number>();
      
      // Ajouter les numéros déjà tirés pour éviter les doublons
      alreadyDrawn.forEach(n => unique.add(n));
      
      while (unique.size < alreadyDrawn.size + count) {
        const n = Math.floor(Math.random() * (max - min + 1)) + min;
        unique.add(n);
      }
      
      // Extraire seulement les nouveaux numéros
      const newNumbers = Array.from(unique).filter(n => !alreadyDrawn.has(n));
      numbers = newNumbers.slice(0, count);
    } else {
      for (let i = 0; i < count; i++) {
        const n = Math.floor(Math.random() * (max - min + 1)) + min;
        numbers.push(n);
      }
    }
    const sortOpt = (body?.sort ?? 'none') as 'asc' | 'desc' | 'none';
    if (sortOpt === 'asc') {
      numbers = numbers.sort((a, b) => a - b);
    } else if (sortOpt === 'desc') {
      numbers = numbers.sort((a, b) => b - a);
    }
    // Ajouter les nouveaux numéros à la session
    this.sessionService.addDrawnNumbers(sessionId, numbers);

    let persistedId: string | undefined = undefined;
    if (body?.persist) {
      persistedId = this.randomService.persistDraw({
        params: { min, max, count, sort: sortOpt, noDuplicates },
        results: numbers,
      });
    }
    return { numbers, persistedId, sessionId };
  }
}

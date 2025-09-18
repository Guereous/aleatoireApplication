import { Body, Controller, Get, Post, BadRequestException, UseGuards, Request } from '@nestjs/common';
import { AppService } from './app.service';
import { RandomService } from './random.service';
import { SessionService } from './session.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

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

  @Get('api/sessions')
  @UseGuards(JwtAuthGuard)
  getSessions(@Request() req: any): { sessions: Array<{ id: string; name: string; createdAt: string; drawnCount: number }> } {
    const userId = req.user.id;
    const sessions = this.sessionService.getSessionsByUser(userId);
    return {
      sessions: sessions.map(session => ({
        id: session.id,
        name: session.name,
        createdAt: session.createdAt.toISOString(),
        drawnCount: session.drawnNumbers.size,
      }))
    };
  }

  @Post('api/random')
  @UseGuards(JwtAuthGuard)
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
      sessionName?: string;
    },
    @Request() req: any,
  ): { numbers: number[]; persistedId?: string; sessionId: string } {
    const userId = req.user.id;
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

    const noDuplicates = Boolean(body?.noDuplicates);
    const rangeSize = max - min + 1;
    if (noDuplicates && count > rangeSize) {
      throw new BadRequestException(`count (${count}) dépasse la taille de plage (${rangeSize})`);
    }

    // Gestion des sessions
    let sessionId = body?.sessionId;
    if (!sessionId) {
      // Chercher par nom si fourni, sinon créer une nouvelle session
      if (body?.sessionName) {
        const existingSession = this.sessionService.findSessionByName(body.sessionName);
        if (existingSession && existingSession.userId === userId) {
          sessionId = existingSession.id;
        } else {
          sessionId = this.sessionService.createSession(body.sessionName, userId);
        }
      } else {
        sessionId = this.sessionService.createSession(undefined, userId);
      }
    } else {
      // Vérifier que la session existe et appartient à l'utilisateur
      const session = this.sessionService.getSession(sessionId);
      if (!session || session.userId !== userId) {
        throw new BadRequestException('Session invalide');
      }
    }
    let numbers: number[] = [];
    
    if (noDuplicates) {
      // Récupérer les numéros déjà tirés dans cette session
      const alreadyDrawn = this.sessionService.getDrawnNumbers(sessionId);
      const rangeSize = max - min + 1;
      const availableNumbers = rangeSize - alreadyDrawn.size;
      
      // Vérifier s'il reste assez de numéros disponibles
      if (availableNumbers < count) {
        throw new BadRequestException(
          `Plus assez de numéros disponibles. Il reste ${availableNumbers} numéros dans la plage [${min}-${max}], mais vous demandez ${count} numéros.`
        );
      }
      
      const unique = new Set<number>();
      
      // Ajouter les numéros déjà tirés pour éviter les doublons
      alreadyDrawn.forEach(n => unique.add(n));
      
      // Générer les nouveaux numéros avec une limite de sécurité
      let attempts = 0;
      const maxAttempts = rangeSize * 10; // Limite de sécurité
      
      while (unique.size < alreadyDrawn.size + count && attempts < maxAttempts) {
        const n = Math.floor(Math.random() * (max - min + 1)) + min;
        unique.add(n);
        attempts++;
      }
      
      if (attempts >= maxAttempts) {
        throw new BadRequestException('Impossible de générer les numéros demandés. Veuillez réessayer.');
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

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RandomService } from './random.service';
import { SessionService } from './session.service';

describe('AppController', () => {
  let appController: AppController;
  let sessionService: SessionService;
  let randomService: RandomService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, RandomService, SessionService],
    }).compile();

    appController = app.get<AppController>(AppController);
    sessionService = app.get<SessionService>(SessionService);
    randomService = app.get<RandomService>(RandomService);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('getTime', () => {
    it('should return current time in ISO format', () => {
      const result = appController.getTime();
      expect(result).toHaveProperty('nowIso');
      expect(typeof result.nowIso).toBe('string');
      expect(new Date(result.nowIso)).toBeInstanceOf(Date);
    });
  });

  describe('getSessions', () => {
    it('should return empty sessions array when no sessions', () => {
      const result = appController.getSessions();
      expect(result).toHaveProperty('sessions');
      expect(result.sessions).toEqual([]);
    });

    it('should return sessions with correct format', () => {
      const sessionId = sessionService.createSession('Test Session');
      sessionService.addDrawnNumbers(sessionId, [1, 2, 3]);

      const result = appController.getSessions();
      expect(result.sessions).toHaveLength(1);
      expect(result.sessions[0]).toMatchObject({
        id: sessionId,
        name: 'Test Session',
        drawnCount: 3,
      });
      expect(result.sessions[0].createdAt).toBeDefined();
    });
  });

  describe('getRandom', () => {
    it('should create new session when no sessionId provided', () => {
      const body = {
        min: 1,
        max: 10,
        count: 3,
        noDuplicates: true,
      };

      const result = appController.getRandom(body);
      
      expect(result).toHaveProperty('numbers');
      expect(result).toHaveProperty('sessionId');
      expect(result.numbers).toHaveLength(3);
      expect(result.sessionId).toMatch(/^session_\d+_[a-z0-9]+$/);
    });

    it('should use existing session when sessionId provided', () => {
      const sessionId = sessionService.createSession('Test');
      const body = {
        min: 1,
        max: 10,
        count: 2,
        sessionId,
        noDuplicates: true,
      };

      const result = appController.getRandom(body);
      
      expect(result.sessionId).toBe(sessionId);
      expect(result.numbers).toHaveLength(2);
    });

    it('should create session by name when sessionName provided', () => {
      const body = {
        min: 1,
        max: 10,
        count: 2,
        sessionName: 'Named Session',
        noDuplicates: true,
      };

      const result = appController.getRandom(body);
      
      expect(result.sessionId).toBeDefined();
      const session = sessionService.getSession(result.sessionId);
      expect(session?.name).toBe('Named Session');
    });

    it('should reuse existing session by name', () => {
      const existingSessionId = sessionService.createSession('Existing Session');
      const body = {
        min: 1,
        max: 10,
        count: 2,
        sessionName: 'Existing Session',
        noDuplicates: true,
      };

      const result = appController.getRandom(body);
      
      expect(result.sessionId).toBe(existingSessionId);
    });

    it('should throw error for invalid sessionId', () => {
      const body = {
        min: 1,
        max: 10,
        count: 2,
        sessionId: 'invalid-session',
        noDuplicates: true,
      };

      expect(() => appController.getRandom(body)).toThrow(BadRequestException);
    });

    it('should throw error for invalid parameters', () => {
      const body = {
        min: 'invalid' as any,
        max: 10,
        count: 2,
        noDuplicates: true,
      };

      expect(() => appController.getRandom(body)).toThrow(BadRequestException);
    });

    it('should throw error when min > max', () => {
      const body = {
        min: 10,
        max: 5,
        count: 2,
        noDuplicates: true,
      };

      expect(() => appController.getRandom(body)).toThrow(BadRequestException);
    });

    it('should throw error when count < 1', () => {
      const body = {
        min: 1,
        max: 10,
        count: 0,
        noDuplicates: true,
      };

      expect(() => appController.getRandom(body)).toThrow(BadRequestException);
    });

    it('should throw error when count exceeds range with noDuplicates', () => {
      const body = {
        min: 1,
        max: 5,
        count: 10,
        noDuplicates: true,
      };

      expect(() => appController.getRandom(body)).toThrow(BadRequestException);
    });

    it('should handle sorting correctly', () => {
      const body = {
        min: 1,
        max: 10,
        count: 5,
        sort: 'asc' as const,
        noDuplicates: true,
      };

      const result = appController.getRandom(body);
      
      expect(result.numbers).toHaveLength(5);
      const sorted = [...result.numbers].sort((a, b) => a - b);
      expect(result.numbers).toEqual(sorted);
    });

    it('should handle desc sorting correctly', () => {
      const body = {
        min: 1,
        max: 10,
        count: 5,
        sort: 'desc' as const,
        noDuplicates: true,
      };

      const result = appController.getRandom(body);
      
      expect(result.numbers).toHaveLength(5);
      const sorted = [...result.numbers].sort((a, b) => b - a);
      expect(result.numbers).toEqual(sorted);
    });

    it('should allow duplicates when noDuplicates is false', () => {
      const body = {
        min: 1,
        max: 3,
        count: 10,
        noDuplicates: false,
      };

      const result = appController.getRandom(body);
      
      expect(result.numbers).toHaveLength(10);
      // Should allow duplicates, so we can have more numbers than the range
    });

    it('should call persistDraw when persist is true', () => {
      const persistSpy = jest.spyOn(randomService, 'persistDraw');
      
      const body = {
        min: 1,
        max: 10,
        count: 2,
        persist: true,
        noDuplicates: true,
      };

      const result = appController.getRandom(body);
      
      expect(persistSpy).toHaveBeenCalledWith({
        params: {
          min: 1,
          max: 10,
          count: 2,
          sort: 'none',
          noDuplicates: true,
        },
        results: result.numbers,
      });
      
      expect(result).toHaveProperty('persistedId');
    });
  });
});

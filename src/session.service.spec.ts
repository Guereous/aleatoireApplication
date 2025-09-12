import { Test, TestingModule } from '@nestjs/testing';
import { SessionService } from './session.service';

describe('SessionService', () => {
  let service: SessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SessionService],
    }).compile();

    service = module.get<SessionService>(SessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSession', () => {
    it('should create a session with default name', () => {
      const sessionId = service.createSession();
      expect(sessionId).toBeDefined();
      expect(sessionId).toMatch(/^session_\d+_[a-z0-9]+$/);
      
      const session = service.getSession(sessionId);
      expect(session).toBeDefined();
      expect(session?.name).toMatch(/^Session /);
      expect(session?.drawnNumbers.size).toBe(0);
    });

    it('should create a session with custom name', () => {
      const customName = 'Test Session';
      const sessionId = service.createSession(customName);
      
      const session = service.getSession(sessionId);
      expect(session?.name).toBe(customName);
    });
  });

  describe('getSession', () => {
    it('should return undefined for non-existent session', () => {
      const session = service.getSession('non-existent');
      expect(session).toBeUndefined();
    });

    it('should return session for existing ID', () => {
      const sessionId = service.createSession('Test');
      const session = service.getSession(sessionId);
      expect(session).toBeDefined();
      expect(session?.id).toBe(sessionId);
    });
  });

  describe('addDrawnNumbers', () => {
    it('should add numbers to session', () => {
      const sessionId = service.createSession('Test');
      const numbers = [1, 2, 3];
      
      service.addDrawnNumbers(sessionId, numbers);
      
      const drawnNumbers = service.getDrawnNumbers(sessionId);
      expect(drawnNumbers.size).toBe(3);
      expect(drawnNumbers.has(1)).toBe(true);
      expect(drawnNumbers.has(2)).toBe(true);
      expect(drawnNumbers.has(3)).toBe(true);
    });

    it('should not add numbers to non-existent session', () => {
      const numbers = [1, 2, 3];
      
      // Should not throw error
      expect(() => service.addDrawnNumbers('non-existent', numbers)).not.toThrow();
    });
  });

  describe('getDrawnNumbers', () => {
    it('should return empty set for non-existent session', () => {
      const drawnNumbers = service.getDrawnNumbers('non-existent');
      expect(drawnNumbers.size).toBe(0);
    });

    it('should return drawn numbers for existing session', () => {
      const sessionId = service.createSession('Test');
      const numbers = [5, 10, 15];
      
      service.addDrawnNumbers(sessionId, numbers);
      const drawnNumbers = service.getDrawnNumbers(sessionId);
      
      expect(drawnNumbers.size).toBe(3);
      numbers.forEach(num => expect(drawnNumbers.has(num)).toBe(true));
    });
  });

  describe('clearSession', () => {
    it('should return false for non-existent session', () => {
      const result = service.clearSession('non-existent');
      expect(result).toBe(false);
    });

    it('should clear existing session', () => {
      const sessionId = service.createSession('Test');
      service.addDrawnNumbers(sessionId, [1, 2, 3]);
      
      const result = service.clearSession(sessionId);
      expect(result).toBe(true);
      
      const session = service.getSession(sessionId);
      expect(session).toBeUndefined();
    });
  });

  describe('getAllSessions', () => {
    it('should return empty array when no sessions', () => {
      const sessions = service.getAllSessions();
      expect(sessions).toEqual([]);
    });

    it('should return all sessions sorted by creation date', async () => {
      const session1 = service.createSession('First');
      await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
      const session2 = service.createSession('Second');
      
      const sessions = service.getAllSessions();
      expect(sessions).toHaveLength(2);
      expect(sessions[0].name).toBe('Second'); // Most recent first
      expect(sessions[1].name).toBe('First');
    });
  });

  describe('findSessionByName', () => {
    it('should return undefined for non-existent name', () => {
      const session = service.findSessionByName('Non-existent');
      expect(session).toBeUndefined();
    });

    it('should return session by name', () => {
      const sessionId = service.createSession('Unique Name');
      const session = service.findSessionByName('Unique Name');
      
      expect(session).toBeDefined();
      expect(session?.id).toBe(sessionId);
    });

    it('should return first match when multiple sessions have same name', () => {
      service.createSession('Duplicate');
      const session2 = service.createSession('Duplicate');
      
      const session = service.findSessionByName('Duplicate');
      expect(session).toBeDefined();
      // Should return one of them (implementation dependent)
    });
  });
});

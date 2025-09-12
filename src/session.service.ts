import { Injectable } from '@nestjs/common';

type SessionData = {
  id: string;
  name: string;
  drawnNumbers: Set<number>;
  createdAt: Date;
}

@Injectable()
export class SessionService {
  private sessions = new Map<string, SessionData>();

  createSession(name?: string): string {
    const id = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const sessionName = name || `Session ${new Date().toLocaleString()}`;
    this.sessions.set(id, {
      id,
      name: sessionName,
      drawnNumbers: new Set(),
      createdAt: new Date(),
    });
    return id;
  }

  getSession(sessionId: string): SessionData | undefined {
    return this.sessions.get(sessionId);
  }

  addDrawnNumbers(sessionId: string, numbers: number[]): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      numbers.forEach(n => session.drawnNumbers.add(n));
    }
  }

  getDrawnNumbers(sessionId: string): Set<number> {
    const session = this.sessions.get(sessionId);
    return session ? session.drawnNumbers : new Set();
  }

  clearSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  getAllSessions(): SessionData[] {
    return Array.from(this.sessions.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  findSessionByName(name: string): SessionData | undefined {
    return Array.from(this.sessions.values()).find(session => session.name === name);
  }
}

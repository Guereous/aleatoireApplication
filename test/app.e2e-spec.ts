import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableCors({
      origin: ['http://localhost:5173'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Basic endpoints', () => {
    it('/ (GET)', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });

    it('/api/time (GET)', () => {
      return request(app.getHttpServer())
        .get('/api/time')
        .expect(200)
        .expect((res: any) => {
          expect(res.body).toHaveProperty('nowIso');
          expect(typeof res.body.nowIso).toBe('string');
          expect(new Date(res.body.nowIso)).toBeInstanceOf(Date);
        });
    });

    it('/api/sessions (GET)', () => {
      return request(app.getHttpServer())
        .get('/api/sessions')
        .expect(200)
        .expect((res: any) => {
          expect(res.body).toHaveProperty('sessions');
          expect(Array.isArray(res.body.sessions)).toBe(true);
        });
    });
  });

  describe('Random number generation', () => {
    it('/api/random (POST) - basic generation', () => {
      return request(app.getHttpServer())
        .post('/api/random')
        .send({
          min: 1,
          max: 10,
          count: 3,
          noDuplicates: true,
        })
        .expect(201)
        .expect((res: any) => {
          expect(res.body).toHaveProperty('numbers');
          expect(res.body).toHaveProperty('sessionId');
          expect(Array.isArray(res.body.numbers)).toBe(true);
          expect(res.body.numbers).toHaveLength(3);
          expect(res.body.sessionId).toMatch(/^session_\d+_[a-z0-9]+$/);
        });
    });

    it('/api/random (POST) - with sorting', () => {
      return request(app.getHttpServer())
        .post('/api/random')
        .send({
          min: 1,
          max: 10,
          count: 5,
          sort: 'asc',
          noDuplicates: true,
        })
        .expect(201)
        .expect((res: any) => {
          expect(res.body.numbers).toHaveLength(5);
          const sorted = [...res.body.numbers].sort((a: number, b: number) => a - b);
          expect(res.body.numbers).toEqual(sorted);
        });
    });

    it('/api/random (POST) - with session name', () => {
      return request(app.getHttpServer())
        .post('/api/random')
        .send({
          min: 1,
          max: 10,
          count: 2,
          sessionName: 'Test Session',
          noDuplicates: true,
        })
        .expect(201)
        .expect((res: any) => {
          expect(res.body.sessionId).toBeDefined();
        });
    });

    it('/api/random (POST) - with persistence', () => {
      return request(app.getHttpServer())
        .post('/api/random')
        .send({
          min: 1,
          max: 10,
          count: 2,
          persist: true,
          noDuplicates: true,
        })
        .expect(201)
        .expect((res: any) => {
          expect(res.body).toHaveProperty('persistedId');
          expect(typeof res.body.persistedId).toBe('string');
        });
    });

    it('/api/random (POST) - allow duplicates', () => {
      return request(app.getHttpServer())
        .post('/api/random')
        .send({
          min: 1,
          max: 3,
          count: 10,
          noDuplicates: false,
        })
        .expect(201)
        .expect((res: any) => {
          expect(res.body.numbers).toHaveLength(10);
          // Should allow duplicates
        });
    });
  });

  describe('Error handling', () => {
    it('/api/random (POST) - invalid parameters', () => {
      return request(app.getHttpServer())
        .post('/api/random')
        .send({
          min: 'invalid',
          max: 10,
          count: 2,
        })
        .expect(400);
    });

    it('/api/random (POST) - min > max', () => {
      return request(app.getHttpServer())
        .post('/api/random')
        .send({
          min: 10,
          max: 5,
          count: 2,
          noDuplicates: true,
        })
        .expect(400);
    });

    it('/api/random (POST) - count < 1', () => {
      return request(app.getHttpServer())
        .post('/api/random')
        .send({
          min: 1,
          max: 10,
          count: 0,
          noDuplicates: true,
        })
        .expect(400);
    });

    it('/api/random (POST) - count exceeds range with noDuplicates', () => {
      return request(app.getHttpServer())
        .post('/api/random')
        .send({
          min: 1,
          max: 5,
          count: 10,
          noDuplicates: true,
        })
        .expect(400);
    });

    it('/api/random (POST) - invalid sessionId', () => {
      return request(app.getHttpServer())
        .post('/api/random')
        .send({
          min: 1,
          max: 10,
          count: 2,
          sessionId: 'invalid-session',
          noDuplicates: true,
        })
        .expect(400);
    });
  });

  describe('Session management', () => {
    it('should create and reuse sessions', async () => {
      // Create first session
      const firstResponse = await request(app.getHttpServer())
        .post('/api/random')
        .send({
          min: 1,
          max: 10,
          count: 2,
          sessionName: 'E2E Test Session',
          noDuplicates: true,
        })
        .expect(201);

      const sessionId = firstResponse.body.sessionId;

      // Use existing session
      const secondResponse = await request(app.getHttpServer())
        .post('/api/random')
        .send({
          min: 1,
          max: 10,
          count: 2,
          sessionId,
          noDuplicates: true,
        })
        .expect(201);

      expect(secondResponse.body.sessionId).toBe(sessionId);

      // Check sessions list
      const sessionsResponse = await request(app.getHttpServer())
        .get('/api/sessions')
        .expect(200);

      expect(sessionsResponse.body.sessions).toHaveLength(1);
      expect(sessionsResponse.body.sessions[0].name).toBe('E2E Test Session');
    });
  });
});

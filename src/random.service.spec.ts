import { Test, TestingModule } from '@nestjs/testing';
import { RandomService } from './random.service';

describe('RandomService', () => {
  let service: RandomService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RandomService],
    }).compile();

    service = module.get<RandomService>(RandomService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('persistDraw', () => {
    it('should return a valid ID', () => {
      const input = {
        params: {
          min: 1,
          max: 10,
          count: 5,
          sort: 'asc' as const,
          noDuplicates: true,
        },
        results: [1, 3, 5, 7, 9],
      };

      const id = service.persistDraw(input);
      
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('should return different IDs for different calls', () => {
      const input1 = {
        params: {
          min: 1,
          max: 10,
          count: 3,
          sort: 'none' as const,
          noDuplicates: false,
        },
        results: [1, 2, 3],
      };

      const input2 = {
        params: {
          min: 5,
          max: 15,
          count: 2,
          sort: 'desc' as const,
          noDuplicates: true,
        },
        results: [15, 10],
      };

      const id1 = service.persistDraw(input1);
      const id2 = service.persistDraw(input2);
      
      expect(id1).not.toBe(id2);
    });

    it('should handle different parameter combinations', () => {
      const testCases = [
        {
          params: { min: 1, max: 100, count: 1, sort: 'asc' as const, noDuplicates: true },
          results: [42],
        },
        {
          params: { min: 0, max: 0, count: 1, sort: 'none' as const, noDuplicates: false },
          results: [0],
        },
        {
          params: { min: -10, max: 10, count: 5, sort: 'desc' as const, noDuplicates: true },
          results: [10, 5, 0, -5, -10],
        },
      ];

      testCases.forEach((testCase, index) => {
        const id = service.persistDraw(testCase);
        expect(id).toBeDefined();
        expect(typeof id).toBe('string');
      });
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from './cache.service';
import Redis from 'ioredis';

describe('CacheService', () => {
  let service: CacheService;
  let redisClient: Redis;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: 'REDIS_CLIENT',
          useValue: {
            set: jest.fn(),
            get: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
    redisClient = module.get<Redis>('REDIS_CLIENT');
  });

  describe('setCache', () => {
    it('should set a cache value with an expiration time', async () => {
      const key = 'testKey';
      const value = 'testValue';
      const ttl = 3600;

      await service.setCache(key, value, ttl);

      expect(redisClient.set).toHaveBeenCalledWith(key, value, 'EX', ttl);
    });
  });

  describe('getCache', () => {
    it('should retrieve a cache value', async () => {
      const key = 'testKey';
      const value = 'testValue';

      jest.spyOn(redisClient, 'get').mockResolvedValue(value);

      const result = await service.getCache(key);

      expect(result).toBe(value);
      expect(redisClient.get).toHaveBeenCalledWith(key);
    });

    it('should return null if no cache value is found', async () => {
      const key = 'testKey';

      jest.spyOn(redisClient, 'get').mockResolvedValue(null);

      const result = await service.getCache(key);

      expect(result).toBeNull();
      expect(redisClient.get).toHaveBeenCalledWith(key);
    });
  });

  describe('deleteCache', () => {
    it('should delete a cache value', async () => {
      const key = 'testKey';

      await service.deleteCache(key);

      expect(redisClient.del).toHaveBeenCalledWith(key);
    });
  });
});

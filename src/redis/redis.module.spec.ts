import { Test, TestingModule } from '@nestjs/testing';
import Redis from 'ioredis';
import { RedisModule } from './redis.module';

describe('RedisModule', () => {
  let redisClient: Redis;
  let mockOn: jest.Mock;
  let mockErrorCallback: (err: any) => void;

  beforeEach(async () => {
    mockOn = jest.fn((event: string, callback: (err: any) => void) => {
      if (event === 'error') {
        mockErrorCallback = callback;
      }
    });

    const module: TestingModule = await Test.createTestingModule({
      imports: [RedisModule],
    })
      .overrideProvider('REDIS_CLIENT')
      .useValue({
        on: mockOn,
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
        status: 'ready',
        disconnect: jest.fn(),
      })
      .compile();

    redisClient = module.get<Redis>('REDIS_CLIENT');
  });

  it('should be defined', () => {
    expect(redisClient).toBeDefined();
  });

  it('should have a status of "ready"', () => {
    expect(redisClient.status).toBe('ready');
  });

  it('should set up an error event listener', () => {
    expect(mockOn).toHaveBeenCalledWith('error', expect.any(Function));
  });

  it('should handle the error event by throwing a Redis connection error', () => {
    const error = new Error('Test error');

    const consoleLogSpy = jest
      .spyOn(console, 'log')
      .mockImplementation(() => {});

    expect(() => {
      if (mockErrorCallback) {
        mockErrorCallback(error);
      } else {
        throw new Error('Error callback was not captured.');
      }
    }).toThrow('Redis connection error');

    consoleLogSpy.mockRestore();
  });

  afterAll(() => {
    redisClient.disconnect();
  });
});

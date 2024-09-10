import { Test, TestingModule } from '@nestjs/testing';
import { ItemsController } from './redis.controller';
import { CacheService } from './cache.service';

describe('ItemsController', () => {
  let controller: ItemsController;
  let cacheService: CacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemsController],
      providers: [
        {
          provide: CacheService,
          useValue: {
            getCache: jest.fn(),
            setCache: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ItemsController>(ItemsController);
    cacheService = module.get<CacheService>(CacheService);
  });

  describe('getItem', () => {
    it('should return a cached item', async () => {
      const id = '1';
      const cachedItem = 'Cached Item 1';

      jest.spyOn(cacheService, 'getCache').mockResolvedValue(cachedItem);

      const result = await controller.getItem(id);

      expect(result).toBe(`Cached: ${cachedItem}`);
      expect(cacheService.getCache).toHaveBeenCalledWith(id);
      expect(cacheService.setCache).not.toHaveBeenCalled();
    });

    it('should fetch an item from DB and cache it', async () => {
      const id = '1';
      const fetchedItem = `Item ${id} from DB`;

      jest.spyOn(cacheService, 'getCache').mockResolvedValue(null);
      jest.spyOn(cacheService, 'setCache').mockResolvedValue(undefined);

      const result = await controller.getItem(id);

      expect(result).toBe(fetchedItem);
      expect(cacheService.getCache).toHaveBeenCalledWith(id);
      expect(cacheService.setCache).toHaveBeenCalledWith(id, fetchedItem, 3600);
    });
  });
});

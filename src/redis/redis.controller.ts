import { Controller, Get, Param } from '@nestjs/common';
import { CacheService } from './cache.service';

@Controller('items')
export class ItemsController {
  constructor(private readonly cacheService: CacheService) {}

  @Get(':id')
  async getItem(@Param('id') id: string): Promise<string> {
    const cachedItem = await this.cacheService.getCache(id);
    if (cachedItem) {
      return `Cached: ${cachedItem}`;
    }

    const fetchedItem = `Item ${id} from DB`;
    await this.cacheService.setCache(id, fetchedItem, 3600);
    return fetchedItem;
  }
}

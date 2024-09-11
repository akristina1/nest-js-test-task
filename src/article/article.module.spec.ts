import { Test, TestingModule } from '@nestjs/testing';
import { ArticleModule } from './article.module';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { User } from '../user/entities/user.entity';
import { DataSource } from 'typeorm';

describe('ArticleModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [ArticleModule],
    })

      .overrideProvider(getRepositoryToken(Article))
      .useValue({
        find: jest.fn().mockResolvedValue([]),
        save: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockResolvedValue({}),
        findOne: jest.fn().mockResolvedValue(null),
      })

      .overrideProvider(getRepositoryToken(User))
      .useValue({
        findOne: jest
          .fn()
          .mockResolvedValue({ id: 1, first_name: 'John', last_name: 'Doe' }),
      })

      .overrideProvider(DataSource)
      .useValue({
        getRepository: jest.fn().mockReturnValue({
          find: jest.fn().mockResolvedValue([]),
          save: jest.fn().mockResolvedValue({}),
        }),
        createQueryRunner: jest.fn().mockReturnThis(),
        connect: jest.fn(),
        query: jest.fn(),
        transaction: jest.fn(),
      })
      .compile();
  });

  it('should compile the module', async () => {
    expect(module).toBeDefined();
  });

  it('should provide ArticleService', () => {
    const articleService = module.get<ArticleService>(ArticleService);
    expect(articleService).toBeDefined();
  });

  it('should provide ArticleController', () => {
    const articleController = module.get<ArticleController>(ArticleController);
    expect(articleController).toBeDefined();
  });
});

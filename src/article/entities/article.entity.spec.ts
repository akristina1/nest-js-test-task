import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Article } from './article.entity';
import { User } from '../../user/entities/user.entity';
import { ArticleService } from '../article.service';

const articleRepoMock = {
  findOne: jest.fn(),
  save: jest.fn(),
};

const userRepoMock = {
  findOne: jest.fn(),
};

describe('ArticleService', () => {
  let articleService: ArticleService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ArticleService,
        {
          provide: getRepositoryToken(Article),
          useValue: articleRepoMock,
        },
        {
          provide: getRepositoryToken(User),
          useValue: userRepoMock,
        },
      ],
    }).compile();

    articleService = moduleRef.get<ArticleService>(ArticleService);
  });

  it('should be defined', () => {
    expect(articleService).toBeDefined();
  });

  it('should return an article by ID', async () => {
    const article = new Article();
    article.id = 1;
    article.title = 'Test Article';
    articleRepoMock.findOne.mockResolvedValue(article);

    const result = await articleService.findOne(1);
    expect(result).toEqual(article);
    expect(articleRepoMock.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
  });
});

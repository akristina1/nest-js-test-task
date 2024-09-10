import { Test, TestingModule } from '@nestjs/testing';
import { ArticleService } from './article.service';
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { BadRequestException } from '@nestjs/common';
import Helpers from '../utils/helpers';

describe('ArticleService', () => {
  let service: ArticleService;
  let articleRepository: Repository<Article>;

  const mockArticle = {
    id: 1,
    title: 'Test Article',
    description: 'Test Description',
    user_id: 1,
    created_at: new Date(),
  } as Article;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleService,
        {
          provide: getRepositoryToken(Article),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ArticleService>(ArticleService);
    articleRepository = module.get<Repository<Article>>(
      getRepositoryToken(Article),
    );
  });

  describe('create', () => {
    it('should create and save an article', async () => {
      jest.spyOn(articleRepository, 'create').mockReturnValue(mockArticle);
      jest.spyOn(articleRepository, 'save').mockResolvedValue(mockArticle);

      const result = await service.create(
        { title: 'Test Article', description: 'Test Description' },
        mockArticle.user_id,
      );

      expect(result).toEqual(mockArticle);
      expect(articleRepository.create).toHaveBeenCalledWith({
        title: 'Test Article',
        description: 'Test Description',
        user_id: mockArticle.user_id,
      });
      expect(articleRepository.save).toHaveBeenCalledWith(mockArticle);
    });
  });

  describe('findAll', () => {
    it('should throw BadRequestException if invalid end_date is provided', async () => {
      const invalidEndDate = 'invalid-end-date';

      jest.spyOn(Helpers, 'isValidDate').mockReturnValueOnce(false);

      await expect(
        service.findAll({
          start_date: '2024-09-09T00:00:00.000Z',
          end_date: invalidEndDate,
          page: 1,
          limit: 10,
          user_id: 1,
        }),
      ).rejects.toThrow(BadRequestException);

      try {
        await service.findAll({
          start_date: '2024-09-09T00:00:00.000Z',
          end_date: invalidEndDate,
          page: 1,
          limit: 10,
          user_id: 1,
        });
      } catch (e) {
        expect(e.message).toBe('Invalid end_date format');
      }
    });

    it('should find all articles with pagination, date filters, and user_id', async () => {
      const data = [
        { id: 1, title: 'Article 1', description: 'Test' },
      ] as Article[];
      const total = 1;
      const start_date = '2024-09-09T00:00:00.000Z';
      const end_date = '2024-09-10T23:59:59.999Z';
      const user_id = 1;
      const result = { data, total, page: 1, limit: 10 };

      jest.spyOn(Helpers, 'isValidDate').mockReturnValue(true);

      const mockQueryBuilder: any = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([data, total]),
      };

      jest
        .spyOn(articleRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder);

      const response = await service.findAll({
        page: 1,
        limit: 10,
        start_date,
        end_date,
        user_id,
      });

      expect(response).toEqual(result);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({
        created_at: Between(start_date, end_date),
        user_id: user_id,
      });
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
    });

    it('should apply MoreThanOrEqual for start_date', async () => {
      const startDate = '2024-09-09T00:00:00.000Z';

      jest
        .spyOn(articleRepository, 'findAndCount')
        .mockResolvedValueOnce([[], 0]);

      await service.findAll({
        start_date: startDate,
        page: 1,
        limit: 10,
        user_id: 1,
      });

      expect(articleRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          created_at: MoreThanOrEqual(startDate),
          user_id: 1,
        },
        skip: 0,
        take: 10,
      });
    });

    it('should apply LessThanOrEqual for end_date', async () => {
      const endDate = '2024-09-09T00:00:00.000Z';

      jest
        .spyOn(articleRepository, 'findAndCount')
        .mockResolvedValueOnce([[], 0]);

      await service.findAll({
        end_date: endDate,
        page: 1,
        limit: 10,
        user_id: 1,
      });

      expect(articleRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          created_at: LessThanOrEqual(endDate),
          user_id: 1,
        },
        skip: 0,
        take: 10,
      });
    });

    it('should apply Between for start_date and end_date', async () => {
      const startDate = '2024-09-01T00:00:00.000Z';
      const endDate = '2024-09-09T00:00:00.000Z';

      jest
        .spyOn(articleRepository, 'findAndCount')
        .mockResolvedValueOnce([[], 0]);

      await service.findAll({
        start_date: startDate,
        end_date: endDate,
        page: 1,
        limit: 10,
        user_id: 1,
      });

      expect(articleRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          created_at: Between(startDate, endDate),
          user_id: 1,
        },
        skip: 0,
        take: 10,
      });
    });
  });

  describe('findOne', () => {
    it('should return a single article by id', async () => {
      const mockQueryBuilder: any = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockArticle),
      };
      jest
        .spyOn(articleRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder);

      const result = await service.findOne(1);
      expect(result).toEqual(mockArticle);
    });

    it('should return undefined if article not found', async () => {
      const mockQueryBuilder: any = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(undefined),
      };
      jest
        .spyOn(articleRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder);

      const result = await service.findOne(999);
      expect(result).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update an article and return the updated article', async () => {
      const updateArticleDto = {
        title: 'Updated Title',
        description: 'Updated Description',
      };
      const updatedArticle = { ...mockArticle, ...updateArticleDto };

      jest.spyOn(articleRepository, 'update').mockResolvedValue({} as any);
      jest.spyOn(service, 'findOne').mockResolvedValue(updatedArticle);

      const result = await service.update(1, updateArticleDto);
      expect(result).toEqual(updatedArticle);
      expect(articleRepository.update).toHaveBeenCalledWith(
        1,
        updateArticleDto,
      );
    });
  });

  describe('remove', () => {
    it('should delete an article by id', async () => {
      const deleteResult = { affected: 1 } as any;
      jest.spyOn(articleRepository, 'delete').mockResolvedValue(deleteResult);

      const result = await service.remove(1);
      expect(result).toEqual(deleteResult);
      expect(articleRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should return 0 affected rows if article not found', async () => {
      const deleteResult = { affected: 0 } as any;
      jest.spyOn(articleRepository, 'delete').mockResolvedValue(deleteResult);

      const result = await service.remove(999);
      expect(result).toEqual(deleteResult);
    });
  });
});

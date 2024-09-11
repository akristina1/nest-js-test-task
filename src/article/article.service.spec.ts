import { Test, TestingModule } from '@nestjs/testing';
import { ArticleService } from './article.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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

    // Other tests omitted for brevity
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

    it('should throw NotFoundException if article not found', async () => {
      const mockQueryBuilder: any = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(undefined),
      };
      jest
        .spyOn(articleRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should throw BadRequestException if article to update is not found', async () => {
      const updateArticleDto = {
        title: 'Updated Title',
        description: 'Updated Description',
      };
      const user_id = 1;

      jest.spyOn(articleRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.update(mockArticle.id, updateArticleDto, user_id),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw UnauthorizedException if user is not authorized to update the article', async () => {
      const updateArticleDto = {
        title: 'Updated Title',
        description: 'Updated Description',
      };
      const unauthorizedUserId = 999;

      jest.spyOn(articleRepository, 'findOne').mockResolvedValue({
        ...mockArticle,
        user_id: 2, // Different user ID
      });

      await expect(
        service.update(mockArticle.id, updateArticleDto, unauthorizedUserId),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should update an article and return the updated article', async () => {
      const updateArticleDto = {
        title: 'Updated Title',
        description: 'Updated Description',
      };
      const user_id = 1;
      const updatedArticle = { ...mockArticle, ...updateArticleDto };

      jest.spyOn(articleRepository, 'findOne').mockResolvedValue(mockArticle);
      jest
        .spyOn(articleRepository, 'update')
        .mockResolvedValue({ affected: 1 } as any);
      jest.spyOn(service, 'findOne').mockResolvedValue(updatedArticle);

      const result = await service.update(
        mockArticle.id,
        updateArticleDto,
        user_id,
      );
      expect(result).toEqual(updatedArticle);
    });

    it('should return the article if no update data is provided', async () => {
      const updateArticleDto = {};
      const user_id = 1;

      jest.spyOn(articleRepository, 'findOne').mockResolvedValue(mockArticle);

      const result = await service.update(
        mockArticle.id,
        updateArticleDto,
        user_id,
      );
      expect(result).toEqual(mockArticle);
    });
  });

  describe('remove', () => {
    it('should remove an article by id', async () => {
      jest.spyOn(articleRepository, 'findOne').mockResolvedValue(mockArticle);
      jest
        .spyOn(articleRepository, 'delete')
        .mockResolvedValue({ affected: 1 } as any);

      const result = await service.remove(mockArticle.id, mockArticle.user_id);
      expect(result).toBe(true);
      expect(articleRepository.delete).toHaveBeenCalledWith(mockArticle.id);
    });

    it('should throw BadRequestException if article to remove is not found', async () => {
      jest.spyOn(articleRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.remove(mockArticle.id, mockArticle.user_id),
      ).rejects.toThrow(BadRequestException);

      try {
        await service.remove(mockArticle.id, mockArticle.user_id);
      } catch (e) {
        expect(e.message).toBe('Article not found');
      }
    });

    it('should throw UnauthorizedException if user is not authorized to delete the article', async () => {
      jest.spyOn(articleRepository, 'findOne').mockResolvedValue({
        ...mockArticle,
        user_id: 2,
      });

      await expect(
        service.remove(mockArticle.id, mockArticle.user_id),
      ).rejects.toThrow(UnauthorizedException);

      try {
        await service.remove(mockArticle.id, mockArticle.user_id);
      } catch (e) {
        expect(e.message).toBe('You are not authorized to delete this article');
      }
    });

    it('should return false if delete result has no affected rows', async () => {
      jest.spyOn(articleRepository, 'findOne').mockResolvedValue(mockArticle);
      jest
        .spyOn(articleRepository, 'delete')
        .mockResolvedValue({ affected: 0 } as any);

      const result = await service.remove(mockArticle.id, mockArticle.user_id);
      expect(result).toBe(false);
    });
  });
});

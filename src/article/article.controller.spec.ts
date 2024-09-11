import { Test, TestingModule } from '@nestjs/testing';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { JwtService } from '@nestjs/jwt';
import { UpdateArticleDto } from './dto/update-article.dto';
import { GetArticlesParamsDto } from './dto/get-articles-params.dto';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';

describe('ArticleController', () => {
  let controller: ArticleController;
  let service: ArticleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticleController],
      providers: [
        {
          provide: ArticleService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'token'),
            verify: jest.fn(() => ({ userId: 1 })),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ArticleController>(ArticleController);
    service = module.get<ArticleService>(ArticleService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const userId = 1;

    it('should create a new article', async () => {
      const createArticleDto: CreateArticleDto = {
        title: 'Test',
        description: 'Test description',
      };
      const request = { userId };
      const result = {
        id: 1,
        ...createArticleDto,
        user_id: userId,
        created_at: new Date(),
        updated_at: new Date(),
        user: {
          id: userId,
          first_name: 'Test',
          last_name: 'Test',
          email: 'test@test.com',
          password: 'password',
          created_at: new Date(),
          updated_at: new Date(),
          role: 'user',
        },
      };

      jest.spyOn(service, 'create').mockResolvedValue(result);

      expect(await controller.create(createArticleDto, request)).toEqual(
        result,
      );
      expect(service.create).toHaveBeenCalledWith(createArticleDto, userId);
    });

    it('should throw a validation error if createArticleDto is invalid', async () => {
      const invalidArticleDto: CreateArticleDto = {
        title: '',
        description: '',
      };

      jest
        .spyOn(service, 'create')
        .mockRejectedValue(new Error('Validation failed'));

      await expect(
        controller.create(invalidArticleDto, { userId }),
      ).rejects.toThrow('Validation failed');
    });
  });

  describe('findAll', () => {
    it('should return a list of articles', async () => {
      const queryParams: GetArticlesParamsDto = {
        page: 1,
        limit: 10,
        start_date: '',
        user_id: 1,
        end_date: '',
      };
      const result = { data: [], total: 0, page: 1, limit: 10 };

      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      expect(await controller.findAll(queryParams)).toEqual(result);
      expect(service.findAll).toHaveBeenCalledWith(queryParams);
    });

    it('should throw an error if invalid query params are passed', async () => {
      const invalidQueryParams = { page: -1 } as GetArticlesParamsDto;

      jest
        .spyOn(service, 'findAll')
        .mockRejectedValue(new Error('Invalid query parameters'));

      await expect(controller.findAll(invalidQueryParams)).rejects.toThrow(
        'Invalid query parameters',
      );
    });
  });

  describe('findOne', () => {
    it('should return a single article by id', async () => {
      const id = '1';
      const result = {
        id: 1,
        title: 'Test',
        description: 'Test description',
        user_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
        user: {
          id: 1,
          first_name: 'Test',
          last_name: 'Test',
          email: 'test@test.com',
          password: 'password',
          created_at: new Date(),
          updated_at: new Date(),
          role: 'user',
        },
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(result);

      expect(await controller.findOne(id)).toEqual(result);
      expect(service.findOne).toHaveBeenCalledWith(+id);
    });

    it('should throw a NotFoundException if article does not exist', async () => {
      const id = '1';

      jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(new NotFoundException('Article not found'));

      await expect(controller.findOne(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an article by id', async () => {
      const id = '1';
      const updateArticleDto: UpdateArticleDto = {
        title: 'Updated Test',
        description: 'Updated description',
      };
      const result = {
        id: 1,
        title: 'Updated Test',
        description: 'Updated description',
        user_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
        user: {
          id: 1,
          first_name: 'Test',
          last_name: 'Test',
          email: 'test@test.com',
          password: 'password',
          created_at: new Date(),
          updated_at: new Date(),
          role: 'user',
        },
      };

      jest.spyOn(service, 'update').mockResolvedValue(result);

      expect(
        await controller.update(id, updateArticleDto, { userId: 1 }),
      ).toEqual(result);
      expect(service.update).toHaveBeenCalledWith(+id, updateArticleDto, 1);
    });

    it('should throw a NotFoundException if article to update is not found', async () => {
      const id = '1';
      const updateArticleDto: UpdateArticleDto = {
        title: 'Updated Test',
        description: 'Updated description',
      };

      jest
        .spyOn(service, 'update')
        .mockRejectedValue(new NotFoundException('Article not found'));

      await expect(
        controller.update(id, updateArticleDto, { userId: 1 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw an UnauthorizedException if user is not authorized to update the article', async () => {
      const id = '1';
      const updateArticleDto: UpdateArticleDto = {
        title: 'Updated Test',
        description: 'Updated description',
      };

      jest
        .spyOn(service, 'update')
        .mockRejectedValue(new UnauthorizedException('Unauthorized'));

      await expect(
        controller.update(id, updateArticleDto, { userId: 2 }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('remove', () => {
    it('should remove an article by id', async () => {
      const id = '1';
      const result = true;

      jest.spyOn(service, 'remove').mockResolvedValue(result);

      expect(await controller.remove(id, { userId: 1 })).toEqual(result);
      expect(service.remove).toHaveBeenCalledWith(+id, 1);
    });

    it('should throw a BadRequestException if article to delete is not found', async () => {
      const id = '1';

      jest
        .spyOn(service, 'remove')
        .mockRejectedValue(new BadRequestException('Article not found'));

      await expect(controller.remove(id, { userId: 1 })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw an UnauthorizedException if user is not authorized to delete the article', async () => {
      const id = '1';

      jest
        .spyOn(service, 'remove')
        .mockRejectedValue(new UnauthorizedException('Unauthorized'));

      await expect(controller.remove(id, { userId: 2 })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});

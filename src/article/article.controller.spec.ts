import { Test, TestingModule } from '@nestjs/testing';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { GetArticlesParamsDto } from './dto/get-articles-params.dto';
import { NotFoundException } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmTestConfig } from '../config/typeormTestConfig';
import { Article } from './entities/article.entity';

describe('ArticleController', () => {
  let controller: ArticleController;
  let service: ArticleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        TypeOrmModule.forRoot(typeOrmTestConfig),
        TypeOrmModule.forFeature([Article]),
      ],
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
      ],
    }).compile();

    controller = module.get<ArticleController>(ArticleController);
    service = module.get<ArticleService>(ArticleService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new article', async () => {
      const createArticleDto: CreateArticleDto = {
        title: 'Test',
        description: 'Test description',
      };
      const userId = 1;
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
        controller.create(invalidArticleDto, { userId: 1 }),
      ).rejects.toThrow();
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

      await expect(controller.findAll(invalidQueryParams)).rejects.toThrow();
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

      jest.spyOn(service, 'findOne').mockResolvedValue(null);

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

      jest.spyOn(service, 'update').mockResolvedValue(result);

      expect(await controller.update(id, updateArticleDto, 1)).toEqual(result);
      expect(service.update).toHaveBeenCalledWith(+id, updateArticleDto);
    });

    it('should throw a NotFoundException if article to update is not found', async () => {
      const id = '1';
      const updateArticleDto: UpdateArticleDto = {
        title: 'Updated Test',
        description: 'Updated description',
      };

      jest.spyOn(service, 'update').mockResolvedValue(null);

      await expect(controller.update(id, updateArticleDto, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove an article by id', async () => {
      const id = '1';
      const result = { affected: 1, raw: [] };

      jest.spyOn(service, 'remove').mockResolvedValue(result);

      expect(await controller.remove(id, 1)).toEqual(result);
      expect(service.remove).toHaveBeenCalledWith(+id);
    });

    it('should throw a NotFoundException if article to delete is not found', async () => {
      const id = '1';

      jest.spyOn(service, 'remove').mockResolvedValue({ affected: 0, raw: [] });

      await expect(controller.remove(id, 1)).rejects.toThrow(NotFoundException);
    });
  });
});

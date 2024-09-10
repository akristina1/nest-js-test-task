import { BadRequestException, Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  DeleteResult,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
} from 'typeorm';
import { Article } from './entities/article.entity';
import Helpers from '../utils/helpers';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
  ) {}

  async create(
    createArticleDto: CreateArticleDto,
    user_id: number,
  ): Promise<Article> {
    const { title, description } = createArticleDto;

    const article = this.articleRepository.create({
      title,
      description,
      user_id,
    });
    return await this.articleRepository.save(article);
  }

  async findAll({
    page = 1,
    limit = 10,
    start_date = '',
    end_date = '',
    user_id = 0,
  }): Promise<{ data: Article[]; total: number; page: number; limit: number }> {
    if (start_date && !Helpers.isValidDate(start_date)) {
      throw new BadRequestException('Invalid start_date format');
    }
    if (end_date && !Helpers.isValidDate(end_date)) {
      throw new BadRequestException('Invalid end_date format');
    }

    const where = {};

    if (start_date && end_date) {
      where['created_at'] = Between(start_date, end_date);
    } else if (start_date) {
      where['created_at'] = MoreThanOrEqual(start_date);
    } else if (end_date) {
      where['created_at'] = LessThanOrEqual(end_date);
    }

    if (user_id) where['user_id'] = user_id;

    const [data, total] = await this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.user', 'user') // Join user relation
      .select([
        'article.id',
        'article.title',
        'article.description',
        'article.user_id',
        'article.created_at',
        'user.id',
        'user.first_name',
        'user.last_name',
        'user.email',
      ])
      .where(where)
      .take(limit)
      .skip((page - 1) * limit)
      .getManyAndCount();

    return { data, total, page: +page, limit: +limit };
  }

  async findOne(id: number): Promise<Article> {
    return await this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.user', 'user')
      .select([
        'article.id',
        'article.title',
        'article.description',
        'article.created_at',
        'user.id',
        'user.first_name',
        'user.last_name',
        'user.email',
      ])
      .where('article.id = :id', { id })
      .getOne();
  }

  async update(
    id: number,
    updateArticleDto: UpdateArticleDto,
  ): Promise<Article> {
    const { title, description } = updateArticleDto;

    const updateData: UpdateArticleDto = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;

    if (!_.isEmpty(updateData)) {
      await this.articleRepository.update(id, updateData);
      return this.findOne(id);
    }
  }

  async remove(id: number): Promise<DeleteResult> {
    return await this.articleRepository.delete(id);
  }
}

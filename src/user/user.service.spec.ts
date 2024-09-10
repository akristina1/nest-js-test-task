import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { GetUserDto } from './dto/get-user.dto';
import { plainToClass } from 'class-transformer';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('findById', () => {
    it('should return a user if found', async () => {
      const user = { id: 1, first_name: 'John', last_name: 'Doe' } as User;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      const result = await service.findById(1);

      expect(result).toEqual(
        plainToClass(GetUserDto, user, { excludeExtraneousValues: true }),
      );
    });

    it('should throw NotFoundException if no user is found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);

      await expect(service.findById(1)).rejects.toThrow(NotFoundException);
    });
  });
});

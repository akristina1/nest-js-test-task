import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { UserModule } from './user.module';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('UserModule', () => {
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UserModule],
    })
      .overrideProvider(getRepositoryToken(User))
      .useClass(Repository)
      .compile();

    userService = module.get<UserService>(UserService);
  });

  it('should compile the module and inject UserService', () => {
    expect(userService).toBeDefined();
  });
});

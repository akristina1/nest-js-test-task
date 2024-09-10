import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';

describe('AppModule', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn(() => ({})),
      })

      .overrideProvider(getRepositoryToken(User))
      .useValue({
        find: jest.fn().mockResolvedValue([]),
        save: jest.fn().mockResolvedValue({}),
      })
      .compile();

    appController = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
  });

  it('should compile the AppModule', () => {
    expect(appController).toBeDefined();
    expect(appService).toBeDefined();
  });

  it('should have AppController and AppService', () => {
    expect(appController).toBeInstanceOf(AppController);
    expect(appService).toBeInstanceOf(AppService);
  });
});

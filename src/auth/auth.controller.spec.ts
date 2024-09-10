import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInUserDto } from './dto/sign-in-user.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signIn: jest.fn(),
            signUp: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signIn', () => {
    it('should sign in a user and return access token', async () => {
      const signInDto: SignInUserDto = {
        email: 'test@gmail.com',
        password: 'testpassword',
      };
      const result = {
        accessToken: 'test-access-token',
        user: {
          id: 1,
          first_name: 'wdwdwd',
          last_name: 'dwdwwd',
          email: 'test@gmail.com',
          password: 'testpassword',
        },
      };

      jest.spyOn(service, 'signIn').mockResolvedValue(result);

      expect(await controller.signIn(signInDto)).toEqual(result);
      expect(service.signIn).toHaveBeenCalledWith(signInDto);
    });
  });

  describe('signUp', () => {
    it('should sign up a new user and return access token', async () => {
      const signUpDto: SignUpDto = {
        first_name: 'Test',
        last_name: 'Test',
        password: 'testpassword',
        email: 'test@example.com',
      };
      const result = {
        accessToken: 'test-access-token',
        user: {
          id: 1,
          first_name: 'Test',
          last_name: 'Test',
          email: 'test@example.com',
          password: 'testpassword',
        },
      };

      jest.spyOn(service, 'signUp').mockResolvedValue(result);

      expect(await controller.signUp(signUpDto)).toEqual(result);
      expect(service.signUp).toHaveBeenCalledWith(signUpDto);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, BadRequestException } from '@nestjs/common';
import Helpers from '../utils/helpers';
import { SignInUserDto } from './dto/sign-in-user.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { plainToClass } from 'class-transformer';
import { GetUserDto } from '../user/dto/get-user.dto';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('signUp', () => {
    it('should sign up a user and return access token', async () => {
      const signUpDto: SignUpDto = {
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        password: 'password',
      };

      const hashedPassword = 'hashed-password';
      const newUser = { id: 1, ...signUpDto, password: hashedPassword };
      const accessToken = 'test-access-token';

      jest.spyOn(Helpers, 'hashPassword').mockReturnValue(hashedPassword);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(userRepository, 'create').mockReturnValue(newUser as any);
      jest.spyOn(userRepository, 'save').mockResolvedValue(newUser as any);
      jest.spyOn(jwtService, 'sign').mockReturnValue(accessToken);

      const result = await service.signUp(signUpDto);

      expect(result).toEqual({
        user: plainToClass(GetUserDto, newUser, {
          excludeExtraneousValues: true,
        }),
        accessToken,
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: signUpDto.email },
      });
      expect(userRepository.create).toHaveBeenCalledWith({
        ...signUpDto,
        password: hashedPassword,
      });
      expect(userRepository.save).toHaveBeenCalledWith(newUser);
      expect(jwtService.sign).toHaveBeenCalledWith({ id: newUser.id });
    });

    it('should throw ConflictException if email is already in use', async () => {
      const signUpDto: SignUpDto = {
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        password: 'password',
      };

      const existingUser = { id: 1, ...signUpDto };

      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(existingUser as any);

      await expect(service.signUp(signUpDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('signIn', () => {
    it('should sign in a user and return access token', async () => {
      const signInDto: SignInUserDto = {
        email: 'test@example.com',
        password: 'password',
      };

      const hashedPassword = 'hashed-password';
      const user = { id: 1, email: signInDto.email, password: hashedPassword };
      const accessToken = 'test-access-token';

      jest.spyOn(Helpers, 'hashPassword').mockReturnValue(hashedPassword);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user as any);
      jest.spyOn(jwtService, 'sign').mockReturnValue(accessToken);

      const result = await service.signIn(signInDto);

      expect(result).toEqual({
        user: plainToClass(GetUserDto, user, { excludeExtraneousValues: true }),
        accessToken,
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: signInDto.email, password: hashedPassword },
      });
      expect(jwtService.sign).toHaveBeenCalledWith({ id: user.id });
    });

    it('should throw BadRequestException if user is not found', async () => {
      const signInDto: SignInUserDto = {
        email: 'test@example.com',
        password: 'password',
      };

      const hashedPassword = 'hashed-password';

      jest.spyOn(Helpers, 'hashPassword').mockReturnValue(hashedPassword);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.signIn(signInDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});

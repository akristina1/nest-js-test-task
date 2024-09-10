import {
  ConflictException,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { plainToClass } from 'class-transformer';
import { User } from '../user/entities/user.entity';
import Helpers from '../utils/helpers';
import { GetUserDto } from '../user/dto/get-user.dto';
import { SignInUserDto } from './dto/sign-in-user.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(createUserDto: SignUpDto) {
    const { first_name, last_name, email, password } = createUserDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    const hashPassword = Helpers.hashPassword(password);
    const newUser = this.userRepository.create({
      first_name,
      last_name,
      email,
      password: hashPassword,
    });

    await this.userRepository.save(newUser);

    const accessToken = this.jwtService.sign({ id: newUser.id });
    return {
      user: plainToClass(GetUserDto, newUser, {
        excludeExtraneousValues: true,
      }),
      accessToken,
    };
  }

  async signIn(createUserDto: SignInUserDto) {
    const { email, password } = createUserDto;

    const hashPassword = Helpers.hashPassword(password);
    const user = await this.userRepository.findOne({
      where: { email, password: hashPassword },
    });
    if (!user) {
      throw new BadRequestException('Invalid Email or Password');
    }

    const accessToken = this.jwtService.sign({ id: user.id });

    return {
      user: plainToClass(GetUserDto, user, { excludeExtraneousValues: true }),
      accessToken,
    };
  }
}

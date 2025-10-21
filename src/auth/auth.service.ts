import { Repository } from 'typeorm';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { handleExceptions } from '../commons/exceptions/handle-exceptions.common';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...rest } = createUserDto;

      const user = this.userRepository.create({ ...rest, password: bcrypt.hashSync(password, 10) });
      const userSaved = await this.userRepository.save( user );

      const { password: _, ...userWithoutPassword } = userSaved;

      return userWithoutPassword;
    } catch (error) {
      this.logger.error(error);
      return handleExceptions(error);
    }
  }

  async signIn(loginUserDto: LoginUserDto) {

    const { email, password } = loginUserDto;

    const user = await this.userRepository.findOne({ 
      where: { email }, 
      select: { id: true, email: true, password: true, roles: true }
    });

    if ( !user ) throw new UnauthorizedException('Credentials are not valid (email)');

    if ( !bcrypt.compareSync(password, user.password) ) throw new UnauthorizedException('Credentials are not valid (password)');

    const { password: _, ...userWithoutPassword } = user;
    const tokens = await this.getTokens(user);

    return { ...userWithoutPassword, ...tokens };
  }

  async logout(user: User) {
    const userFound = await this.userRepository.findOneBy({ id: user.id });
    if (userFound) {
      userFound.refreshToken = null;
      await this.userRepository.save(userFound);
    }
    return { message: 'Logout successful' };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, { secret: process.env.JWT_REFRESH_SECRET });
      const user = await this.userRepository.findOne({ where: { id: payload.id }, select: ['id', 'refreshToken', 'roles'] });

      if (!user) throw new UnauthorizedException('User not found');
      if (!user.refreshToken) throw new UnauthorizedException('No refresh token found for user');

      const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!refreshTokenMatches) throw new UnauthorizedException('Invalid refresh token');

      const tokens = await this.getTokens(user);
      return { ...tokens };

    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private async getTokens(user: User) {
    const payload: JwtPayload = { id: user.id };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      }),
    ]);

    await this.userRepository.update(user.id, {
      refreshToken: await bcrypt.hash(refreshToken, 10),
    });

    return {
      accessToken,
      refreshToken,
    };
  }
  
  async checkAuthStatus(user: User) {
    const { password: _, ...userWithoutPassword } = user;
    const tokens = await this.getTokens(user);

    return { ...userWithoutPassword, ...tokens };
  }
}

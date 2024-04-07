import { Injectable, UnauthorizedException } from '@nestjs/common';
import { compareSync } from 'bcrypt';
import { UsersService } from 'src/modules/user/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid user or password');
    }

    const validPassword = compareSync(password, user.password);

    if (!validPassword) {
      throw new UnauthorizedException('Invalid user or password');
    }

    const payload = { email: user.email, sub: user.id, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}

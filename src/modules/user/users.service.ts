import { HttpException, Injectable } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { PrismaService } from 'src/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { password, email } = createUserDto;

    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (user) {
      throw new HttpException('User already exists', 400);
    }

    createUserDto.password = await bcrypt.hash(password, 10);

    return this.prismaService.user.create({
      data: {
        ...createUserDto,
      },
    });
  }

  async findAll() {
    return await this.prismaService.user.findMany();
  }

  async findOne(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
      include: {
        tasks: true,
      },
    });

    if (!user) {
      throw new HttpException('User not found', 404);
    }

    return user;
  }

  async findByEmail(email: string) {
    return await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
  }

  async getUserIdFromToken(req: any) {
    const token = req.headers.authorization.split(' ')[1];

    const decoded = this.jwtService.decode(token);

    return decoded['sub'];
  }

  async updateUser(id: string, updpateUserDto: UpdateUserDto, req: any) {
    const { name, email, password } = updpateUserDto;

    const userId = await this.getUserIdFromToken(req);

    if (userId !== id) {
      throw new HttpException('Unauthorized', 401);
    }

    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new HttpException('User not found', 404);
    }

    if (email && email !== user.email) {
      const emailExists = await this.prismaService.user.findUnique({
        where: {
          email,
        },
      });
      if (emailExists) {
        throw new HttpException('Email already exists', 400);
      }
    }

    return await this.prismaService.user.update({
      where: {
        id,
      },
      data: {
        name: name ? name : user.name,
        email: email ? email : user.email,
        password: password ? await bcrypt.hash(password, 10) : user.password,
      },
    });
  }

  async remove(id: string, req: any) {
    const userId = await this.getUserIdFromToken(req);

    if (userId === id) {
      throw new HttpException('Unauthorized', 401);
    }

    const user = this.prismaService.user.delete({
      where: {
        id,
      },
    });

    if (!user) {
      throw new HttpException('User not found', 404);
    }

    return user;
  }
}

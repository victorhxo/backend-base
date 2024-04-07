import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './task.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TaskService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async getUserIdFromToken(req: any) {
    const token = req.headers.authorization.split(' ')[1];

    const decoded = await this.jwtService.decode(token);

    return decoded['sub'];
  }

  async create(createTaskDto: CreateTaskDto, req: any) {
    const { userId } = createTaskDto;

    const id = await this.getUserIdFromToken(req);

    if (id !== userId) {
      throw new HttpException('Unauthorized', 401);
    }

    const userExists = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!userExists) {
      throw new HttpException('User not found', 401);
    }

    return this.prismaService.task.create({
      data: {
        ...createTaskDto,
      },
    });
  }

  async findAll() {
    return await this.prismaService.task.findMany();
  }

  async findOne(id: string) {
    const task = await this.prismaService.task.findUnique({
      where: {
        id,
      },
    });

    if (!task) {
      throw new HttpException('Task not found', 404);
    }

    return task;
  }

  async updateTask(id: string, updateTaskDto: UpdateTaskDto, req: any) {
    const task = await this.prismaService.task.findUnique({
      where: {
        id,
      },
    });

    if (!task) {
      throw new HttpException('Task not found', 404);
    }

    const userId = await this.getUserIdFromToken(req);

    if (userId !== task.userId) {
      throw new HttpException('Unauthorized', 401);
    }

    return this.prismaService.task.update({
      where: {
        id,
      },
      data: {
        ...updateTaskDto,
      },
    });
  }

  async remove(id: string, req: any) {
    const task = await this.prismaService.task.findUnique({
      where: {
        id,
      },
    });

    if (!task) {
      throw new HttpException('Task not found', 404);
    }

    const userId = await this.getUserIdFromToken(req);

    if (userId !== task.userId) {
      throw new HttpException('Unauthorized', 401);
    }

    return this.prismaService.task.delete({
      where: {
        id,
      },
    });
  }
}

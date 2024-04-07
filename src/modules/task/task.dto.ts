import { IsIn, IsNotEmpty, IsOptional } from 'class-validator';

export enum TaskStatus {
  OPEN = 'OPEN',
  DONE = 'DONE',
}

export class CreateTaskDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  userId: string;
}

export class UpdateTaskDto {
  @IsOptional()
  title: string;

  @IsOptional()
  @IsIn([TaskStatus.OPEN, TaskStatus.DONE])
  status: TaskStatus;
}

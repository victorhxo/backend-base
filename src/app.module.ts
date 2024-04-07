import { Module } from '@nestjs/common';
import { UsersModule } from './modules/user/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { GuardsModule } from './modules/auth/guards/guards.module';
import { TaskModule } from './modules/task/task.module';

@Module({
  imports: [UsersModule, AuthModule, GuardsModule, TaskModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

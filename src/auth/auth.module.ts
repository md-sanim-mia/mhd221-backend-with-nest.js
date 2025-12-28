import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UtilsModule } from 'src/utils/utils.module';
import { PrismaModule } from 'src/prisma.module';

@Module({
   imports: [UtilsModule, PrismaModule], 
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}

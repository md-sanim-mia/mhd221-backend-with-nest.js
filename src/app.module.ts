import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UtilsService } from './utils/utils.service';
import { UtilsModule } from './utils/utils.module';

@Module({
   imports: [ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }), AuthModule, UtilsModule],
  controllers: [AppController],
  providers: [AppService, UtilsService],
})
export class AppModule {}

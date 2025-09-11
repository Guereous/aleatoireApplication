import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RandomService } from './random.service';
import { SessionService } from './session.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, RandomService, SessionService],
})
export class AppModule {}

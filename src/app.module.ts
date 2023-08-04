import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatsController } from './cats/cats.controller';
import { MicroserviceModule } from './microservice/microservice.module';

@Module({
  imports: [MicroserviceModule],
  controllers: [AppController, CatsController],
  providers: [AppService],
})
export class AppModule {}

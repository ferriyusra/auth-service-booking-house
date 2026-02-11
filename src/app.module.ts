import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RepositoryModule } from './repositories/repository.module';

@Module({
  imports: [RepositoryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

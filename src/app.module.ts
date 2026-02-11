import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RepositoryModule } from './repositories/repository.module';
import { UtilModule } from './utils/util.module';

@Module({
  imports: [RepositoryModule, UtilModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

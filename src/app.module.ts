import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RepositoryModule } from './repositories/repository.module';
import { UtilModule } from './utils/util.module';
import { ConfigModule } from './config/config.module';
import { ConfigService } from '@nestjs/config';
import { getSecretValue } from './config/configuration.config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import path from 'path';

@Module({
  imports: [
    RepositoryModule,
    UtilModule,
    ConfigModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: getSecretValue(configService).rate_limit_time || 60,
          limit: getSecretValue(configService).rate_limit_max || 10,
        },
      ],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: getSecretValue(configService).db_dialect as any,
        host: getSecretValue(configService).db_host,
        port: getSecretValue(configService).db_port,
        username: getSecretValue(configService).db_username,
        password: getSecretValue(configService).db_password,
        database: getSecretValue(configService).db_name,
        entities: [path.join(__dirname, `../../entities/*.entities{.ts,.js}`)],
        ssl: { rejectUnauthorized: false },
        synchronize: true,
        migrationsRun: true,
        connectTimeout: getSecretValue(configService).db_connection_timeout,
        acquireTimeout: getSecretValue(configService).db_acquire_timeout,
        poolSize: getSecretValue(configService).db_pool_size,
      })
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

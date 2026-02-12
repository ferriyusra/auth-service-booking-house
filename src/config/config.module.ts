import { Module } from '@nestjs/common';
import { ConfigModule as ConfigModuleAlias } from '@nestjs/config';
import configurationConfig from './configuration.config';

@Module({
  imports: [
    ConfigModuleAlias.forRoot({
      isGlobal: true,
      load: [configurationConfig],
    })
  ]
})
export class ConfigModule { }

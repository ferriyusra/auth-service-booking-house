/* eslint-disable @typescript-eslint/await-thenable */
import 'reflect-metadata';
import dotenv from 'dotenv';
import { AwsUtil } from '../../utils/aws.utils';
import { envConstant } from 'src/constants/env.constant';
import * as fs from 'node:fs';
import { DataSource } from 'typeorm';
import path from 'node:path';
import { SeederExecutor } from 'typeorm-extension';
dotenv.config();

let jsonValue: any = {};
(async () => {
  if (process.env.NODE_ENV !== envConstant.LOCAL) {
    const awsSecretManager: AwsUtil = new AwsUtil();
    jsonValue = await awsSecretManager.getParameterStoreValue();
  } else {
    const config: string = fs.readFileSync('config.json', 'utf-8');
    jsonValue = JSON.parse(config);
  }

  const dataSource = new DataSource({
    type: jsonValue.db_dialect as any,
    host: jsonValue.db_host,
    port: +jsonValue.db_port,
    username: jsonValue.db_username,
    password: jsonValue.db_password,
    database: jsonValue.db_name,
    entities: [path.join(__dirname, `../../entities/*.entities{.ts,.js}`)],
    ssl: { rejectUnauthorized: false },
    synchronize: true,
    migrationsRun: true,
    connectTimeout: +jsonValue.db_connection_timeout,
    acquireTimeout: +jsonValue.db_acquire_timeout,
    poolSize: +jsonValue.db_pool_size,
  });

  await dataSource.initialize();

  const executor = new SeederExecutor(dataSource);
  await executor.execute({
    seeds: ['src/database/seeds/**/*{.ts,.js'],
  });
  console.log('Seeding completed.');

  await dataSource.destroy();
})();

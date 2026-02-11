import * as fs from 'node:fs';

export interface IAWSConfig {
  rate_limit_time: number;
  rate_limit_max: number;
  timeout: number;
  max_redirects: number;
  db_dialect: string;
  db_host: string;
  db_port: number;
  db_username: string;
  db_password: string;
  db_database: string;
  db_name: string;
  db_connect_timeout: number;
  db_acquire_timeout: number;
  db_max_retry: number;
  db_pool_size: number;
}

export interface IAWSS3Config {
  body: string | Buffer | Blob | fs.ReadStream;
  key: string;
  contentType: string;
}

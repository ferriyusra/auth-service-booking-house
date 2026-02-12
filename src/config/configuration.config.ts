import { envConstant } from "../constants/env.constant";
import { IAWSConfig } from "../interfaces/aws.interface";
import { AwsUtil } from "../utils/aws.utils";
import fs from 'node:fs'
import { ConfigService } from '@nestjs/config';

let jsonValue: any = {};

export default async (): Promise<IAWSConfig> => {
  if (process.env.NODE_ENV !== envConstant.LOCAL) {
    const awsSecretManager: AwsUtil = new AwsUtil();
    const result = jsonValue = await awsSecretManager.getParameterStoreValue();
    jsonValue = result
    return result;
  } else {
    const config: string = fs.readFileSync('config.json', 'utf-8');
    const result: IAWSConfig = JSON.parse(config) as IAWSConfig;
    jsonValue = result
    return result;
  }
}

export const getSecretValue = (configService: ConfigService) => {
  const env = JSON.parse(JSON.stringify(jsonValue));
  const result: Partial<IAWSConfig> = {};

  Object.keys(env).forEach((key: string) => {
    const dataType = typeof env[key];
    result[key] = configService.get<typeof dataType>(key)
  });

  return result;
}
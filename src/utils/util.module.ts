import { Module } from '@nestjs/common';
import { AwsUtil } from './aws.utils';

@Module({
  providers: [AwsUtil],
  exports: [AwsUtil],
})
export class UtilModule {}

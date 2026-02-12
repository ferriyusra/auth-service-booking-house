/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';

// import { IAWSConfig } from 'src/interface/aws.interface';
import { IAWSConfig } from '../interface/aws.interface';
import { awsConstant } from '../constants/aws.constant';

@Injectable()
export class AwsUtil {
  private readonly logger: Logger = new Logger(AwsUtil.name);
  private readonly s3Client: S3Client;
  private readonly ssmClient: SSMClient;

  constructor() {
    const params: any = {
      region: awsConstant.REGION_AWS,
      credentials: {
        accessKeyId: awsConstant.ACCESS_KEY_AWS,
        secretAccessKey: awsConstant.SECRET_ACCESS_KEY_AWS,
      },
    };

    this.s3Client = new S3Client(params);
    this.ssmClient = new SSMClient(params);
  }

  private getUrlS3(key: string): string {
    return `https://s3.${awsConstant.REGION_AWS}.amazonaws.com/${awsConstant.BUCKET_NAME_AWS}/${encodeURIComponent(key)}`;
  }

  public async uploadFileToS3(params: {
    key: string;
    body: Buffer | Uint8Array | Blob | string;
    contentType: string;
  }): Promise<{ url: string }> {
    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: awsConstant.BUCKET_NAME_AWS,
          Key: params.key,
          Body: params.body,
          ContentType: params.contentType,
        }),
      );

      return {
        url: this.getUrlS3(params.key),
      };
    } catch (error) {
      this.logger.error('Error upload file to S3', error);
      throw error;
    }
  }

  public async getParameterStoreValue(): Promise<IAWSConfig> {
    try {
      const parameterNames = awsConstant.PARAMETER_STORE_NAMES;
      const splitParameterNames = parameterNames
        ? parameterNames.split(',').map((name) => name.trim()).filter(Boolean)
        : [];
      let result: IAWSConfig = {} as IAWSConfig;
      for (const item of splitParameterNames) {
        const response: any = await this.ssmClient.send(
          new GetParameterCommand({
            Name: item,
            WithDecryption: true,
          }),
        );
        const dataName: IAWSConfig = JSON.parse(response.Parameter.Value);
        result = {
          ...result,
          ...dataName,
        };
      }
      return result;
    } catch (error) {
      this.logger.error('Error fetching parameter store values', error);
      throw error;
    }
  }
}

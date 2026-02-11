export const awsConstant = {
  ACCESS_KEY_AWS: process.env.AWS_ACCESS_KEY || '',
  SECRET_ACCES_KEY_AWS: process.env.SECRET_ACCESS_KEY_AWS || '',
  REGION_AWS: process.env.AWS_REGION || 'ap-southeast-1',
  BUCKET_NAME_AWS: process.env.BUCKET_NAME_AWS || '',
  PARAMETER_STORE_NAMES: process.env.PARAMETER_STORE_NAMES,
};

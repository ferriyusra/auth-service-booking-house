import { SetMetadata } from '@nestjs/common';

export const RESPONSE_MESSSAGE = 'response.message';
export const RESPONSE_OPTS = 'response.opts';

export type ResponseOpts = {
  code?: number;
  message?: string;
  liftToken?: boolean;
};

export const ResponseMessage = (message: string) =>
  SetMetadata(RESPONSE_MESSSAGE, message);

export const ResponseOptions = (opts?: ResponseOpts) =>
  SetMetadata(RESPONSE_OPTS, opts);

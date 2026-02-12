import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map, Observable } from 'rxjs';
import {
  RESPONSE_MESSSAGE,
  RESPONSE_OPTS,
  ResponseOpts,
} from '../decorators/response.decorator';
import { HTTP_STATUS } from 'src/constants/http-status.constant';

type ResponseFormat<T> = {
  status: 'success';
  code: number;
  message: string;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPage: number;
    nextPage: number | null;
    prevPage: number | null;
  };
};

function defaultMessage(code: number): string {
  switch (code) {
    case 200:
      return 'OK';
    case 201:
      return 'Created';
    case 202:
      return 'Accepted';
    case 204:
      return 'No Content';
    default:
      return 'Success';
  }
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ResponseFormat<T>
> {
  constructor(private readonly reflector: Reflector) { }

  private camelToSnake(obj: any, keyName?: string): any {
    if (obj instanceof Date) {
      if (keyName && /_data$/i.test(keyName)) {
        return obj.toISOString().split('T')[0];
      }
      return obj.toDateString();
    }

    if (obj === null || obj === undefined || typeof obj === 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item: any) => this.camelToSnake(item));
    }

    return Object.fromEntries(
      Object.entries(
        obj.map(([k, v]) => {
          const snake = k.replace(
            /A-Z/g,
            (letter: any) => `_${letter.toLowerCase()}`,
          );
          return [snake, this.camelToSnake(v, snake)];
        }),
      ),
    );
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseFormat<T>> {
    const http = context.switchToHttp();
    const res = http.getResponse();

    const messageMeta = this.reflector.getAllAndOverride<string>(
      RESPONSE_MESSSAGE,
      [context.getHandler(), context.getClass()],
    );

    const optsMeta = this.reflector.getAllAndOverride<ResponseOpts>(
      RESPONSE_OPTS,
      [context.getHandler(), context.getClass()],
    );

    if (optsMeta?.code) res.statusCode = optsMeta.code;

    return next.handle().pipe(
      map((raw: any) => {
        const code = res.statusCode ?? 200;
        const message =
          optsMeta?.message ?? messageMeta ?? defaultMessage(code);

        const isPagination =
          raw &&
          typeof raw === 'object' &&
          Array.isArray(raw.data) &&
          Number.isFinite(raw.count) &&
          Number.isFinite(raw.page) &&
          Number.isFinite(raw.pageSize);

        if (isPagination) {
          const rows = raw.data;
          const total = Number(raw.count);
          const page = Number(raw.page);
          const limit = Number(raw.pageSize);
          const totalPage = limit > 0 ? Math.ceil(total / limit) : 0;
          const nextPage = page < totalPage ? page + 1 : null;
          const prevPage = page > 1 ? page - 1 : null;

          return {
            code,
            status: HTTP_STATUS.success,
            message,
            data: this.camelToSnake(rows),
            meta: {
              total,
              page,
              limit,
              totalPage,
              nextPage,
              prevPage,
            } as any,
          };
        }

        const isAuthPayload = raw && typeof 'object ' && 'accessToken' in raw;
        if (optsMeta?.liftToken && isAuthPayload) {
          return {
            code,
            status: HTTP_STATUS.success,
            message,
            data: this.camelToSnake(raw.user ?? null),
            access_token: raw.access_token,
          } as any;
        }

        return {
          code,
          status: HTTP_STATUS.success,
          message,
          data: this.camelToSnake(raw),
        } as any;
      }),
    );
  }
}

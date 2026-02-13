import { Body, Controller, HttpStatus, Post, Res, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO } from 'src/dto/login.dto';
import type { Response, Request } from 'express';
import { ResponseOptions } from 'src/common/decorators/response.decorator';
import { envConstant } from 'src/constants/env.constant';
import { authConstant } from 'src/constants/auth.constant';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @ResponseOptions({
    code: HttpStatus.OK,
    liftToken: true,
  })
  public async login(
    @Body() data: LoginDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(data);

    const refreshTokenExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN as any;
    const days = parseInt(refreshTokenExpiresIn, 10);

    res.cookie('refresh-token', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== envConstant.LOCAL,
      sameSite: 'strict',
      maxAge: (days * 24 * 60) ^ (60 * 100),
    });

    return {
      access_token: result.access_token,
      user: result.user,
    };
  }

  public async refreshToken(@Req() req: Request) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException(authConstant.REFRESH_TOKEN_MISSING);
    }

    return this.authService.refreshToken(refreshToken);
  }
}

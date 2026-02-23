import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO } from '../../dto/login.dto';
import type { Response, Request } from 'express';
import { ResponseOptions } from '../../common/decorators/response.decorator';
import { envConstant } from '../../constants/env.constant';
import { authConstant } from '../../constants/auth.constant';
import { FileInterceptor } from '@nestjs/platform-express';
import { RegisterDTO } from '../../dto/register.dto';
import { JwtGuard } from './guards/jwt.guard';

@Controller('auth')
export class AuthController {
  // eslint-disable-next-line prettier/prettier
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

  @Post('register')
  @UseInterceptors(FileInterceptor('photo'))
  public async register(
    @Body() data: RegisterDTO,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.authService.register(data, file);
  }

  @Get('/:uuid')
  @ResponseOptions({ code: HttpStatus.OK })
  @UseGuards(JwtGuard)
  public async getByUuid(@Param('uuid') uuid: string) {
    return this.authService.getByUuid(uuid);
  }

  @Get('/without-token/:uuid')
  @ResponseOptions({ code: HttpStatus.OK })
  public async getByUuidWithoutToken(@Param('uuid') uuid: string) {
    return this.authService.getByUuid(uuid);
  }

  @Get('/admin')
  @ResponseOptions({ code: HttpStatus.OK })
  @UseGuards(JwtGuard)
  public async getAdmin() {
    return this.authService.getAdmin();
  }
}

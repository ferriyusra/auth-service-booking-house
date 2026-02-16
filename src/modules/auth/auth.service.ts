import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { authConstant } from 'src/constants/auth.constant';
import { Role, User } from '../../entities/user.entity';
import { IAuthUserPayload } from '../../interfaces/auth.interface';
import { UserRepository } from '../../repositories/user.repository';
import { AwsUtil } from '../../utils/aws.utils';
import { StringValue } from 'ms';
import { LoginDTO } from '../../dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { RegisterDTO } from 'src/dto/register.dto';

@Injectable()
export class AuthService {
  private readonly logger: Logger = new Logger(AuthService.name);

  constructor(
    private readonly repository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly awsUtil: AwsUtil,
  ) {}

  private buildAuthPayload(user: Partial<User>): IAuthUserPayload {
    return {
      uuid: user.uuid as string,
      name: user.name as string,
      email: user.email as string,
      role: user.role as string,
      phone_number: user.phone_number as string,
      photo: user.photo as string,
    };
  }

  private async assertUnqieEmailAndPhone(
    email?: string,
    phoneNumber?: string,
    uuid?: string,
  ) {
    if (email) {
      const emailUsed = uuid
        ? await this.repository.existEmailForOtherUser(email, uuid)
        : await this.repository.findByEmail(email);

      if (emailUsed) {
        throw new BadRequestException(authConstant.EMAIL_ALREADY_EXISTS);
      }
    }

    if (phoneNumber) {
      const phoneNumberUsed = uuid
        ? await this.repository.existPhoneNumberForOtherUser(phoneNumber, uuid)
        : await this.repository.findByPhoneNumber(phoneNumber);

      if (phoneNumberUsed) {
        throw new BadRequestException(authConstant.PHONE_ALREADY_EXISTS);
      }
    }
  }

  private async signAccessToken(user: User, payload: IAuthUserPayload) {
    return this.jwtService.signAsync(
      {
        sub: user.uuid,
        data: payload,
      },
      {
        expiresIn: (process.env.JWT_EXPIRES_IN ?? '15') as StringValue,
      },
    );
  }

  private async signRefreshToken(user: User, payload: IAuthUserPayload) {
    return this.jwtService.signAsync(
      {
        sub: user.uuid,
        data: payload,
      },
      {
        expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ?? '7d') as StringValue,
      },
    );
  }

  public async login(data: LoginDTO): Promise<{
    access_token: string;
    refresh_token: string;
    user: IAuthUserPayload;
  }> {
    try {
      const user = await this.repository.findByEmail(data.email);
      if (!user) {
        throw new BadRequestException(authConstant.NOT_FOUND);
      }
      const ok = await bcrypt.compare(data.password, user.password);
      if (!ok) {
        throw new UnauthorizedException(authConstant.INVALID_PASSWORD);
      }

      const payload = this.buildAuthPayload(user);
      const accessToken = await this.signAccessToken(user, payload);
      const refreshToken = await this.signRefreshToken(user, payload);
      const refreshTokenExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN as any;
      const days = parseInt(refreshTokenExpiresIn, 10);
      await this.repository.update(user.uuid, {
        refresh_token: refreshToken,
        refresh_token_expired_at: new Date(
          Date.now() + days * 24 * 60 * 60 * 1000,
        ),
      });

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: payload,
      };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(authConstant.SOMETHING_WENT_WRONG);
    }
  }

  public async refreshToken(refreshToken: string): Promise<{
    access_token: string;
    user: IAuthUserPayload;
  }> {
    try {
      const user = await this.repository.findByRefreshToken(refreshToken);
      if (!user) {
        throw new UnauthorizedException(authConstant.INVALID_REFRESH_TOKEN);
      }

      if (user.refresh_token_expired_at < new Date()) {
        throw new UnauthorizedException(authConstant.REFRESH_TOKEN_EXPIRED);
      }

      const payload = this.buildAuthPayload(user);
      const accessToken = await this.signAccessToken(user, payload);

      return {
        access_token: accessToken,
        user: payload,
      };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(authConstant.SOMETHING_WENT_WRONG);
    }
  }

  public async register(
    data: RegisterDTO,
    file?: Express.Multer.File,
  ): Promise<IAuthUserPayload> {
    try {
      await this.assertUnqieEmailAndPhone(data.email, data.phone_number);
      let photo: string = '';

      if (file) {
        const uploadImage = await this.awsUtil.uploadFileToS3({
          key: `users/${randomUUID()}-${file.originalname}`,
          body: file.buffer,
          contentType: file.mimetype,
        });

        photo = uploadImage.url;
      }

      const result = await this.repository.create({
        uuid: randomUUID(),
        name: data.name,
        email: data.email,
        phone_number: data.phone_number,
        password: await bcrypt.hash(data.password, 10),
        photo: photo,
        role: Role.BOARDER,
      });

      return this.buildAuthPayload(result);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(authConstant.SOMETHING_WENT_WRONG);
    }
  }

  public async getByUuid(uuid: string): Promise<any> {
    try {
      const user = await this.repository.findByUuid(uuid);
      if (!user) {
        throw new BadRequestException(authConstant.NOT_FOUND);
      }
      return this.buildAuthPayload(user);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(authConstant.SOMETHING_WENT_WRONG);
    }
  }

  public async getAdmin(): Promise<any> {
    try {
      const admin = await this.repository.findAdmin();
      if (!admin) {
        throw new BadRequestException(authConstant.NOT_FOUND);
      }
      return this.buildAuthPayload(admin);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(authConstant.SOMETHING_WENT_WRONG);
    }
  }
}

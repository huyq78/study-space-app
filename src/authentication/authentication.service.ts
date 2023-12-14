import {
  BadGatewayException,
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from 'src/modules/jwt/jwt.service';
import { LoginDTO } from 'src/shared/dto/request/authentication/login.request';
import { LoginResponse } from 'src/shared/dto/response/authentication/login.response';
import { compare, genSalt, hash } from 'bcrypt';
import { Collection, MongoClient, ObjectId } from 'mongodb';
import { InjectClient, InjectCollection } from 'src/modules/mongodb';
import { NormalCollection } from 'src/shared/constants/mongo.collection';
import { UserModel } from 'src/shared/models/users.model';
import { UserLoginModel } from 'src/shared/models/user-login.model';
import { ConfigService } from '@nestjs/config';
import { JwtConfiguration } from 'src/shared/configuration/configuration';
import { CreateNewPasswordDTO } from 'src/shared/dto/request/authentication/create-new-password.request';
import { AuthTokenInfo } from 'src/modules/jwt/interfaces';
import { CreateNewPasswordResponse } from 'src/shared/dto/response/authentication/create-new-password.response';
import { isType } from 'src/shared/utils/is-type.utils';
import { RefreshTokenDTO } from 'src/shared/dto/request/authentication/refresh-token.request';
import { RefreshTokenResponse } from 'src/shared/dto/response/authentication/refresh-token.response';

@Injectable()
export class AuthenticationService {
  private readonly logger: Logger = new Logger(AuthenticationService.name);
  constructor(
    private readonly cfg: ConfigService,
    private readonly jwtService: JwtService,
    @InjectCollection(NormalCollection.USERS)
    private readonly userCollection: Collection,
    @InjectCollection(NormalCollection.USER_LOGIN)
    private readonly userLoginCollection: Collection,
    @InjectClient()
    private readonly client: MongoClient,
  ) {}

  public async signToken(
    payload: Record<string, unknown>,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const accessToken = await this.signAccessToken(payload);
      const refreshToken = await this.signRefreshToken(payload);
      return { accessToken, refreshToken };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  public async signAccessToken(
    payload: Record<string, unknown>,
  ): Promise<string> {
    try {
      const jwt = this.cfg.getOrThrow<JwtConfiguration>('jwt');
      const token = await this.jwtService.generateToken(
        payload,
        jwt.jwtLifetimeAccessToken,
      );
      return token;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  public async signRefreshToken(
    payload: Record<string, unknown>,
  ): Promise<string> {
    try {
      const jwt = this.cfg.getOrThrow<JwtConfiguration>('jwt');
      const token = await this.jwtService.generateToken(
        payload,
        jwt.jwtLifetimeRefreshToken,
      );
      return token;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  public async refreshToken({
    token,
  }: RefreshTokenDTO): Promise<RefreshTokenResponse> {
    const session = this.client.startSession();
    try {
      session.startTransaction();
      const userLogin: UserLoginModel = (await this.userLoginCollection.findOne(
        {
          token,
        },
      )) as UserLoginModel;

      if (!userLogin) {
        throw new BadRequestException('refresh-token-not-found');
      }

      const decodeToken = await this.jwtService.decodeToken(token);
      if (isType<AuthTokenInfo>(decodeToken) && decodeToken.userId) {
        const user = await this.userCollection.findOne({
          _id: new ObjectId(decodeToken.userId),
        });
        const accessToken = await this.signAccessToken({
          userId: user._id,
          status: user.is_active,
        });
        return { accessToken };
      }
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  public async login(loginDto: LoginDTO): Promise<LoginResponse> {
    const session = this.client.startSession();

    try {
      session.startTransaction();

      const response = new LoginResponse();

      let user: UserModel = await this.getUser({ email: loginDto.email });

      console.log(user);
      if (!user) {
        this.logger.error('User not found');
        throw new NotFoundException('user-not-found');
      }

      if (!user.isActive) {
        throw new BadRequestException('account-is-not-active');
      }
      const rawPassword = `${user.salt}.${loginDto.password}`;

      const isPasswordCorrect = await compare(rawPassword, user.hash);

      if (!isPasswordCorrect) {
        this.logger.error("Invalid user' password");
        throw new BadRequestException('invalid-password');
      }

      const jwt = this.cfg.getOrThrow<JwtConfiguration>('jwt');
      const payload = {
        userId: user._id,
        status: user.isActive,
      };

      const { accessToken, refreshToken } = await this.signToken(payload);

      const userLogin = new UserLoginModel();
      userLogin._id = new ObjectId();
      userLogin.userId = user._id;
      userLogin.token = refreshToken; //save refresh token
      const currentDate = new Date();
      userLogin.ttl = new Date(
        currentDate.getTime() + jwt.jwtLifetimeRefreshToken * 1000,
      );

      response.token = accessToken;
      response.refreshToken = refreshToken;

      await this.userLoginCollection.insertOne(userLogin, { session });

      response.id = user._id.toString();
      response.email = user.email;
      response.role = user.role;

      await session.commitTransaction();
      return response;
    } catch (error) {
      this.logger.error(error);
      await session.abortTransaction();
      throw new BadRequestException(error);
    } finally {
      await session.endSession();
    }
  }

  public async logout(token: string): Promise<boolean> {
    const session = this.client.startSession();

    try {
      session.startTransaction();

      if (!token) {
        throw new BadGatewayException();
      }

      const userLogin: UserLoginModel = (await this.userLoginCollection.findOne(
        {
          token,
        },
      )) as UserLoginModel;

      if (!userLogin) {
        throw new BadRequestException('Token not found');
      }

      const user: UserModel = await this.getUser({ _id: userLogin.userId });

      if (!user) {
        this.logger.error('User not found');
        throw new NotFoundException('User not found');
      }

      const userLoginResult = await this.userLoginCollection.deleteOne(
        { token },
        { session },
      );

      await session.commitTransaction();
      return userLoginResult.acknowledged && userLoginResult.deletedCount > 0;
    } catch (error) {
      this.logger.error(error);
      await session.abortTransaction();
      throw new BadRequestException(error);
    } finally {
      await session.endSession();
    }
  }

  public isExpiredToken(date: Date): boolean {
    if (new Date(date).getTime() > new Date().getTime()) return false;
    return true;
  }

  public async createNewPassword(
    createNewPasswordDTO: CreateNewPasswordDTO,
  ): Promise<CreateNewPasswordResponse> {
    const session = this.client.startSession();

    try {
      session.startTransaction();

      const { token, newPassword } = createNewPasswordDTO;
      let user: UserModel;
      let tobe_updated = {};
      const decodeToken: AuthTokenInfo = (await this.jwtService.decodeToken(
        token,
      )) as AuthTokenInfo;

      if (!decodeToken || this.isExpiredToken(decodeToken.expiredAt)) {
        throw new BadRequestException('Expired token');
      }

      user = await this.getUser({ _id: new ObjectId(decodeToken.userId) });

      if (!user) {
        this.logger.error('User not found');
        throw new NotFoundException('User not found');
      }

      const newSalt = await genSalt(10);
      const newHash = await hash(`${newSalt}.${newPassword}`, newSalt);

      tobe_updated['salt'] = newSalt;
      tobe_updated['hash'] = newHash;

      const updateUserResult = await this.userCollection.updateOne(
        { _id: user._id },
        { $set: tobe_updated },
        { session },
      );

      await this.userLoginCollection.deleteMany(
        {
          user_id: user._id,
        },
        { session },
      );

      let msg: string;
      if (updateUserResult.acknowledged && updateUserResult.modifiedCount > 0) {
        msg = 'reset-new-password-success';
        await session.commitTransaction();
      } else msg = 'reset-new-password-fail';
      return { msg };
    } catch (error) {
      this.logger.error(error);
      await session.abortTransaction();
      throw new BadRequestException(error);
    } finally {
      await session.endSession();
    }
  }

  async getUser(filter: any): Promise<UserModel> {
    const user = (
      await this.userCollection
        .aggregate([
          {
            $match: filter,
          },
        ])
        .toArray()
    )[0] as UserModel;
    return user;
  }
}

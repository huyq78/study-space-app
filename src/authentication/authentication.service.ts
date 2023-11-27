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
import { UserModel } from 'src/shared/model/users.model';
import { UserLoginModel } from 'src/shared/model/user-login.model';
import { ConfigService } from '@nestjs/config';
import { AppConfiguration, JwtConfiguration, MailerConfiguration } from 'src/shared/configuration/configuration';
import { CreateNewPasswordDTO } from 'src/shared/dto/request/authentication/createNewPassword.request';
import { ForgotPasswordDTO } from 'src/shared/dto/request/authentication/forgotPassword.request';
import { AuthTokenInfo } from 'src/modules/jwt/interfaces';
import { TargetModelConstant } from 'src/shared/model/user-tenant.model';
import { TenantModel } from 'src/shared/model/tenants.model';
import { EmailService } from 'src/modules/email-service/email.service';
import { SendMailOptions } from 'src/modules/email-service/interfaces';
import { ForgotPasswordResponse } from 'src/shared/dto/response/authentication/forgotPassword.response';
import { CreateNewPasswordResponse } from 'src/shared/dto/response/authentication/createNewPassword.response';
import { CREATE_USER_DEFAULT } from 'src/shared/constants/system-management.constants';
import { ActivityLogService } from 'src/modules/activity-log/activity-log.service';
import { CreateActivityLog } from 'src/modules/activity-log/interfaces';
import { ActivityLogType, EntityType } from 'src/shared/constants/activity-log.constants';
import { isType } from 'src/shared/utils/is-type.utils';
import { RefreshTokenDTO } from 'src/shared/dto/request/authentication/refreshToken.request';
import { RefreshTokenResponse } from 'src/shared/dto/response/authentication/refreshToken.response';

@Injectable()
export class AuthenticationService {
  private readonly logger: Logger = new Logger(AuthenticationService.name);
  constructor(
    private readonly cfg: ConfigService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly activityLogService: ActivityLogService,
    @InjectCollection(NormalCollection.USERS)
    private readonly userCollection: Collection,
    @InjectCollection(NormalCollection.USER_ROLES)
    private readonly userRoleCollection: Collection,
    @InjectCollection(NormalCollection.TENANTS)
    private readonly tenantCollection: Collection,
    @InjectCollection(NormalCollection.USER_LOGIN)
    private readonly userLoginCollection: Collection,
    @InjectClient()
    private readonly client: MongoClient,
  ) {

  }

  public async signToken(payload: Record<string, unknown>): Promise<{ accessToken: string, refreshToken: string }> {
    try {
      const accessToken = await this.signAccessToken(payload);
      const refreshToken = await this.signRefreshToken(payload);
      return { accessToken, refreshToken };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  public async signAccessToken(payload: Record<string, unknown>): Promise<string> {
    try {
      const jwt = this.cfg.getOrThrow<JwtConfiguration>('jwt');
      const token = await this.jwtService.generateToken(payload, jwt.jwtLifetimeAccessToken);
      return token;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  public async signRefreshToken(payload: Record<string, unknown>): Promise<string> {
    try {
      const jwt = this.cfg.getOrThrow<JwtConfiguration>('jwt');
      const token = await this.jwtService.generateToken(payload, jwt.jwtLifetimeRefreshToken);
      return token;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  public async refreshToken({ token }: RefreshTokenDTO): Promise<RefreshTokenResponse> {
    const session = this.client.startSession();
    try {
      session.startTransaction();
      const userLogin: UserLoginModel = await this.userLoginCollection.findOne({
        token
      }) as UserLoginModel;

      if (!userLogin) {
        throw new BadRequestException('refresh-token-not-found');
      }

      if (!userLogin || userLogin.ttl.getTime() <= new Date().getTime()) {
        const user: UserModel = await this.getUser({ _id: userLogin.userId });
        //activity log
        const createActivityLog: CreateActivityLog = {
          actionBy: {
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            avatar: user.avatar,
            is_active: user.is_active,
            role: user.role,
          },
          actionType: ActivityLogType.LOGGED_OUT,
        }
        await this.activityLogService.create(createActivityLog, session);
        throw new BadRequestException('expired-token');
      }

      const decodeToken = await this.jwtService.decodeToken(token);
      if (isType<AuthTokenInfo>(decodeToken) && decodeToken.userId) {
        const user = await this.userCollection.findOne({
          _id: new ObjectId(decodeToken.userId)
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
      const db = this.client.db(this.cfg.getOrThrow('database').dbName);
      session.startTransaction();

      const response = new LoginResponse();

      let user: UserModel = await this.getUser({ email: loginDto.email });

      if (!user) {
        this.logger.error('User not found');
        throw new NotFoundException('user-not-found');
      }

      if (!user.is_active || user.is_first_login || !user.salt || !user.hash) {
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
        status: user.is_active
      };

      const { accessToken, refreshToken } = await this.signToken(payload);

      const userLogin = new UserLoginModel();
      userLogin._id = new ObjectId();
      userLogin.userId = user._id;
      userLogin.token = refreshToken; //save refresh token
      const currentDate = new Date();
      userLogin.ttl = new Date(currentDate.getTime() + jwt.jwtLifetimeRefreshToken * 1000);

      response.token = accessToken;
      response.refreshToken = refreshToken;

      await db.collection(NormalCollection.USER_LOGIN).insertOne(userLogin, { session });

      //activity log
      const createActivityLog: CreateActivityLog = {
        actionBy: {
          _id: user._id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          avatar: user.avatar,
          is_active: user.is_active,
          role: user.role,
        },
        actionType: ActivityLogType.LOGGED_IN,
      }
      await this.activityLogService.create(createActivityLog, session, [user._id.toString()]);

      // Get role
      user = await this.getRoleUser(user);

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
      const db = this.client.db(this.cfg.getOrThrow('database').dbName);
      session.startTransaction();

      if (!token) {
        throw new BadGatewayException();
      }

      const userLogin: UserLoginModel = await db.collection(NormalCollection.USER_LOGIN).findOne({
        token
      }) as UserLoginModel;

      if (!userLogin) {
        throw new BadRequestException('Token not found');
      };

      const user: UserModel = await this.getUser({ _id: userLogin.userId });

      if (!user) {
        this.logger.error('User not found');
        throw new NotFoundException('User not found');
      }

      const userLoginResult = await db.collection(NormalCollection.USER_LOGIN).deleteOne({ token }, { session });

      //activity log
      const createActivityLog: CreateActivityLog = {
        actionBy: {
          _id: user._id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          avatar: user.avatar,
          is_active: user.is_active,
          role: user.role,
        },
        actionType: ActivityLogType.LOGGED_OUT,
      }
      await this.activityLogService.create(createActivityLog, session, [user._id.toString()]);

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

  public async forgotPassword(forgotPasswordDto: ForgotPasswordDTO): Promise<ForgotPasswordResponse> {
    const { email } = forgotPasswordDto;
    const user: UserModel = (await this.userCollection.findOne({ email })) as UserModel;
    if (!user) {
      this.logger.error('User not found');
      throw new NotFoundException('User not found');
    }

    if (!user.is_active) throw new BadRequestException('Your account is currently inactive. Please contact customer support for assistance in reactivating your account.');

    const currentDate = new Date();
    const jwt = this.cfg.getOrThrow<JwtConfiguration>('jwt');
    const token = await this.jwtService.generateToken({
      userId: user._id,
      status: user.is_active,
      expired_at: new Date(currentDate.getTime() + 15 * 60 * 1000), //expire 15 minutes
    }, jwt.jwtLifetimeForgotPassword);

    const app = this.cfg.getOrThrow<AppConfiguration>('app');
    const mailer = this.cfg.getOrThrow<MailerConfiguration>('mailer');
    const createNewPasswordLink = `${app.url}/change-password?token=${token}`;
    const options: SendMailOptions = {
      to: email,
      from: mailer.mailerSendFrom,
      subject: 'Password Reset Request',
      template: 'reset-password.ejs',
      context: { firstname: user.first_name, createNewPasswordLink, emailSupport: mailer.emailSupport }
    }
    const res = await this.emailService.sendMail(options);

    await this.userLoginCollection.deleteMany({
      user_id: user._id
    });

    let msg: string;
    if (res) msg = 'send-mail-success';
    else msg = 'send-mail-fail';
    return { msg };
  }

  public isExpiredToken(date: Date): boolean {
    if (new Date(date).getTime() > new Date().getTime()) return false;
    return true;
  }

  public async createNewPassword(createNewPasswordDTO: CreateNewPasswordDTO): Promise<CreateNewPasswordResponse> {
    const session = this.client.startSession();

    try {
      const db = this.client.db(this.cfg.getOrThrow('database').dbName);
      session.startTransaction();

      const { token, newPassword } = createNewPasswordDTO;
      let user: UserModel;
      let tobe_updated = {};
      const decodeToken: AuthTokenInfo = (await this.jwtService.decodeToken(token)) as AuthTokenInfo;

      if (!decodeToken || this.isExpiredToken(decodeToken.expired_at)) {
        throw new BadRequestException('Expired token');
      }

      user = await this.getUser({ _id: new ObjectId(decodeToken.userId) });

      if (!user) {
        this.logger.error('User not found');
        throw new NotFoundException('User not found');
      }

      const newSalt = await genSalt(CREATE_USER_DEFAULT.SALT_HASH);
      const newHash = await hash(`${newSalt}.${newPassword}`, newSalt);

      tobe_updated['salt'] = newSalt;
      tobe_updated['hash'] = newHash;

      const updateUserResult = await db.collection(NormalCollection.USERS).updateOne(
        { _id: user._id },
        { $set: tobe_updated },
        { session }
      );

      await this.userLoginCollection.deleteMany({
        user_id: user._id
      }, { session });

      let msg: string;
      if (updateUserResult.acknowledged && updateUserResult.modifiedCount > 0) {
        msg = 'reset-new-password-success';

        //activity log
        const createActivityLog: CreateActivityLog = {
          actionBy: {
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            avatar: user.avatar,
            is_active: user.is_active,
            role: user.role,
          },
          actionType: ActivityLogType.UPDATED_ACCOUNT,
          targetObject: {
            type: EntityType.USER,
            info: {
              id: user._id,
              first_name: user.first_name,
              last_name: user.last_name,
              email: user.email
            },
            oldValue: {
              password: user.hash
            },
            newValue: {
              password: newHash
            }
          }
        }
        await this.activityLogService.create(createActivityLog, session);
        await session.commitTransaction();
      }
      else msg = 'reset-new-password-fail';
      return { msg };
    } catch (error) {
      this.logger.error(error);
      await session.abortTransaction();
      throw new BadRequestException(error);
    } finally {
      await session.endSession();
    }
  }

  public async getRoleUser(user: UserModel): Promise<UserModel> {
    const userRole = await this.userRoleCollection.aggregate([
      { "$match": { "user_id": user._id } },
      {
        "$lookup": {
          "from": "roles",
          "localField": "role_id",
          "foreignField": "_id",
          pipeline: [
            {
              $lookup: {
                from: NormalCollection.ROLE_GROUP_PERMISSIONS,
                localField: "_id",
                foreignField: "role_id",
                pipeline: [
                  {
                    $lookup: {
                      from: NormalCollection.GROUP_PERMISSIONS,
                      localField: "group_permission_id",
                      foreignField: "_id",
                      as: "permission"
                    }
                  },
                  {
                    $unwind: "$permission"
                  }
                ],
                as: "groups"
              }
            }
          ],
          "as": "role"
        }
      },
      {
        "$unwind": "$role"
      }
    ]).toArray();
    if (userRole.length) user.role = userRole[0].role;
    return user;
  }

  async getUser(filter: any): Promise<UserModel> {
    const user = (await this.userCollection.aggregate([
      {
        $match: filter
      },
      {
        $lookup: {
          from: NormalCollection.USER_ROLES,
          localField: '_id',
          foreignField: 'user_id',
          as: 'user_role',
        },
      },
      {
        $lookup: {
          from: NormalCollection.ROLES,
          localField: 'user_role.role_id',
          foreignField: '_id',
          as: 'role',
        },
      },
      {
        $unwind: '$role',
      }
    ]).toArray())[0] as UserModel;
    return user;
  }
}

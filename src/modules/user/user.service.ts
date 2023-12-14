import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { genSalt, hash } from 'bcrypt';
import { ClientSession, Collection, Db, MongoClient, ObjectId } from 'mongodb';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { InjectClient, InjectCollection } from 'src/modules/mongodb';
import { NormalCollection } from 'src/shared/constants/mongo.collection';
import { ChangePasswordDTO } from 'src/shared/dto/request/user/change-password.request';
import { UpdateProfileDTO } from 'src/shared/dto/request/user/update-profile.request';
import { ChangePasswordResponse } from 'src/shared/dto/response/user/change-password.response';
import { GetProfileResponse } from 'src/shared/dto/response/user/get-profile.response';
import { UpdateProfileResponse } from 'src/shared/dto/response/user/update-profile.response';
import { UserModel } from 'src/shared/models/users.model';
import { ConfigService } from '@nestjs/config';
import { ListUsersDTO } from 'src/shared/dto/request/user/list-users.request';
import { RegisterDTO } from 'src/shared/dto/request/user/register.request';

@Injectable()
export class UserService {
  private readonly logger: Logger = new Logger(UserService.name);
  jwtService: any;
  constructor(
    @InjectCollection(NormalCollection.USERS)
    private readonly userCollection: Collection,
    private readonly authService: AuthenticationService,
    private readonly cfg: ConfigService,
    @InjectClient()
    private readonly client: MongoClient,
  ) {}

  public async register(body: RegisterDTO) {
    const user: Partial<UserModel> = { ...body };

    const session = this.client.startSession();
    try {
      const db = this.client.db(this.cfg.getOrThrow('database').dbName);
      session.startTransaction();

      // Validate inputs
      const existed = await this.userCollection.findOne(
        { email: body.email },
        { session },
      );
      if (existed) {
        throw new BadRequestException('This email address has already existed');
      }

      const newSalt = await genSalt(10);
      const newHash = await hash(`${newSalt}.${body.password}`, newSalt);
      user.salt = newSalt;
      user.hash = newHash;
      user.isActive = true;

      // Set default fields
      user['isActive'] = true;
      delete user.password;
      delete user.confirmPassword;

      // Save user information
      await db.collection(NormalCollection.USERS).insertOne(
        {
          ...user,
          createdOn: new Date(),
          updatedOn: new Date(),
        },
        { session },
      );

      await session.commitTransaction();

      return { msg: 'Register successfully' };
    } catch (error) {
      this.logger.error('Got error when register user');
      this.logger.error(error);
      await session.abortTransaction();
      await session.endSession();
      throw new BadRequestException(error);
    } finally {
      await session.endSession();
    }
  }

  public async changePassword(
    userId: string,
    changePasswordDTO: ChangePasswordDTO,
  ): Promise<ChangePasswordResponse> {
    const session = this.client.startSession();

    try {
      const db = this.client.db(this.cfg.getOrThrow('database').dbName);
      session.startTransaction();

      const { newPassword } = changePasswordDTO;

      const user: UserModel = await this.authService.getUser({
        _id: new ObjectId(userId),
      });

      if (!user) {
        this.logger.error('User not found');
        throw new NotFoundException('User not found');
      }

      const currentPassword = await hash(
        `${user.salt}.${newPassword}`,
        user.salt,
      );
      if (currentPassword === user.hash) {
        throw new BadRequestException(
          'Please enter a new password that is different from your current password.',
        );
      }

      const newSalt = await genSalt(10);
      const newHash = await hash(`${newSalt}.${newPassword}`, newSalt);
      const updateUserResult = await db
        .collection(NormalCollection.USERS)
        .updateOne(
          { _id: user._id },
          { $set: { salt: newSalt, hash: newHash } },
          { session },
        );
      let msg: string;
      if (updateUserResult.acknowledged && updateUserResult.modifiedCount > 0) {
        msg = 'change-password-success';
        await session.commitTransaction();
      } else msg = 'change-password-fail';
      return { msg };
    } catch (error) {
      this.logger.error(error);
      await session.abortTransaction();
      throw new BadRequestException(error);
    } finally {
      await session.endSession();
    }
  }

  public async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDTO,
    file: Express.Multer.File,
  ): Promise<UpdateProfileResponse> {
    const session = this.client.startSession();

    try {
      const db = this.client.db(this.cfg.getOrThrow('database').dbName);
      session.startTransaction();

      const { firstName, lastName, phoneCode, phoneNumber } =
        updateProfileDto;

      const user: UserModel = await this.authService.getUser({
        _id: new ObjectId(userId),
      });

      if (!user) {
        this.logger.error('User not found');
        throw new NotFoundException('User not found');
      }

      const data = {};

      if (user.firstName !== firstName || user.lastName !== lastName) {
        data['firstName'] = firstName;
        data['lastName'] = lastName;
      }

      if (
        user.phone_code !== phoneCode ||
        user.phone_number !== phoneNumber
      ) {
        data['phoneCode'] = phoneCode;
        data['phoneNumber'] = phoneNumber;
      }

      const updateUserResult = await db
        .collection(NormalCollection.USERS)
        .updateOne({ _id: user._id }, { $set: data }, { session });

      let msg: string;
      if (updateUserResult.acknowledged && updateUserResult.modifiedCount > 0) {
        msg = 'update-profile-success';
        await session.commitTransaction();
      } else msg = 'update-profile-fail';
      return { msg };
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  public async getProfile(userId: string): Promise<GetProfileResponse> {
    let user: UserModel = (await this.userCollection.findOne(
      { _id: new ObjectId(userId) },
      {
        projection: {
          email: 1,
          avatar: 1,
          firstName: 1,
          lastName: 1,
          role: 1,
          isActive: 1,
          phoneNumber: 1,
        },
      },
    )) as UserModel;
    if (!user) {
      this.logger.error('User not found');
      throw new NotFoundException();
    }

    const response = new GetProfileResponse();
    response.id = user._id.toString();
    response.firstName = user.firstName;
    response.lastName = user.lastName;
    response.phoneNumber = user.phoneNumber;
    response.email = user.email;
    response.avatar = user.avatar;
    response.role = user.role;
    return response;
  }

  public async getListUser(query: ListUsersDTO) {
    try {
      const { q, isActive, page, limit, sortBy, sortOrder, skip } = query;

      const matchFilters = {};
      if (q) {
        matchFilters['$or'] = [
          { firstName: { $regex: q, $options: 'i' } },
          { lastName: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
          { fullName: { $regex: q, $options: 'i' } },
        ];
      }
      ![undefined, null].includes(isActive) &&
        (matchFilters['isActive'] = isActive);

      const data = await this.userCollection
        .aggregate([
          { $project: { hash: 0, salt: 0 } },
          { $match: matchFilters },
          { $sort: { [`${sortBy}`]: sortOrder } },
          {
            $facet: {
              paginatedResults: [{ $skip: skip }, { $limit: limit }],
              totalCount: [{ $count: 'count' }],
            },
          },
          {
            $set: {
              page,
              limit,
              total: { $first: '$totalCount.count' },
              current: { $size: '$paginatedResults' },
            },
          },
          { $unset: 'totalCount' },
        ])
        .toArray();

      return data[0];
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException('Occurs error');
    }
  }
}

import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { genSalt, hash } from 'bcrypt';
import { ClientSession, Collection, Db, MongoClient, ObjectId } from 'mongodb';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { InjectClient, InjectCollection } from 'src/modules/mongodb';
import { NormalCollection } from 'src/shared/constants/mongo.collection';
import { ChangePasswordDTO } from 'src/shared/dto/request/user/changePassword.request';
import { UpdateProfileDTO } from 'src/shared/dto/request/user/updateProfile.request';
import { ChangePasswordResponse } from 'src/shared/dto/response/user/changePassword.response';
import { GetProfileResponse } from 'src/shared/dto/response/user/getProfile.response';
import { UpdateProfileResponse } from 'src/shared/dto/response/user/updateProfile.response';
import { UserModel } from 'src/shared/model/users.model';
import { AwsService } from '../aws';
import { ConfigService } from '@nestjs/config';
import { AppConfiguration } from 'src/shared/configuration/configuration';
import { ListUsersDTO } from 'src/shared/dto/request/user/list-users.request';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { CreateActivityLog } from '../activity-log/interfaces';
import { ActivityLogType, EntityType } from 'src/shared/constants/activity-log.constants';
import { CREATE_USER_DEFAULT } from 'src/shared/constants/system-management.constants';
import { EmailDTO } from 'src/shared/dto/request/user/email.request';

@Injectable()
export class UserService {
  private readonly logger: Logger = new Logger(UserService.name);
  constructor(
    @InjectCollection(NormalCollection.USERS)
    private readonly userCollection: Collection,
    private readonly authService: AuthenticationService,
    private readonly awsService: AwsService,
    private readonly cfg: ConfigService,
    private readonly activityLogService: ActivityLogService,
    @InjectClient()
    private readonly client: MongoClient,
  ) { }

  public async changePassword(userId: string, changePasswordDTO: ChangePasswordDTO): Promise<ChangePasswordResponse> {
    const session = this.client.startSession();

    try {
      const db = this.client.db(this.cfg.getOrThrow('database').dbName);
      session.startTransaction();

      const { newPassword } = changePasswordDTO;

      const user: UserModel = await this.authService.getUser({ _id: new ObjectId(userId) });

      if (!user) {
        this.logger.error('User not found');
        throw new NotFoundException('User not found');
      }

      const currentPassword = await hash(`${user.salt}.${newPassword}`, user.salt);
      if (currentPassword === user.hash) {
        throw new BadRequestException('Please enter a new password that is different from your current password.');
      }

      const newSalt = await genSalt(CREATE_USER_DEFAULT.SALT_HASH);
      const newHash = await hash(`${newSalt}.${newPassword}`, newSalt);
      const updateUserResult = await db.collection(NormalCollection.USERS).updateOne({ _id: user._id }, { $set: { salt: newSalt, hash: newHash } }, { session });
      let msg: string;
      if (updateUserResult.acknowledged && updateUserResult.modifiedCount > 0) {
        msg = 'change-password-success';

        //activity log
        const createActivityLog: CreateActivityLog = {
          actionBy: {
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            avatar: user.avatar,
            is_active: user.is_active,
            role: user.role
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
        await this.activityLogService.create(createActivityLog, session, [user._id.toString()]);
        await session.commitTransaction();
      }
      else msg = 'change-password-fail';
      return { msg };
    } catch (error) {
      this.logger.error(error);
      await session.abortTransaction();
      throw new BadRequestException(error);
    } finally {
      await session.endSession();
    }
  }

  /*
    populate owners of tenants and locations
  */
  public async populateUsers(userId: ObjectId[], db: Db, session: ClientSession) {
    try {
      const users: UserModel[] = (await db
        .collection(NormalCollection.USERS)
        .find(
          {
            _id: { $in: userId },
          },
          {
            projection: {
              email: 1,
              name: 1,
              phone_number: 1,
            },
            session,
          },
        )
        .toArray()) as UserModel[];
      return users;
    } catch {
      this.logger.error('Populate user unsuccessfully');
      throw new BadRequestException();
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

      const { first_name, last_name, phone_code, phone_number } = updateProfileDto;

      const user: UserModel = await this.authService.getUser({ _id: new ObjectId(userId) });

      if (!user) {
        this.logger.error('User not found');
        throw new NotFoundException('User not found');
      }

      const oldValue = {};
      const newValue = {};
      const data = {};

      if (user.first_name !== first_name || user.last_name !== last_name) {
        oldValue['first_name'] = user.first_name;
        newValue['first_name'] = first_name;
        oldValue['last_name'] = user.last_name;
        newValue['last_name'] = last_name;

        data['first_name'] = first_name;
        data['last_name'] = last_name;
      }

      if (user.phone_code !== phone_code || user.phone_number !== phone_number) {
        oldValue['phone_code'] = user.phone_code;
        newValue['phone_code'] = phone_code;
        oldValue['phone_number'] = user.phone_number;
        newValue['phone_number'] = phone_number;

        data['phone_code'] = phone_code;
        data['phone_number'] = phone_number;
      }

      //avatar
      if (file) {
        const prefix = 'files/avatar';
        const key = `${prefix}/${user._id.toString()}/${file.originalname}`;
        const isUploadAvatar = await this.awsService.uploadFileToS3(key, file.buffer);
        const app = this.cfg.getOrThrow<AppConfiguration>('app');
        if (isUploadAvatar) {
          data['avatar'] = `${app.cloudFrontUrl}/${key}`;
          if (user.avatar !== data['avatar']) {
            newValue['avatar'] = data['avatar'];
            oldValue['avatar'] = user.avatar;
          }
        }
      }
      const updateUserResult = await db.collection(NormalCollection.USERS).updateOne({ _id: user._id }, { $set: data }, { session });

      let msg: string;
      if (updateUserResult.acknowledged && updateUserResult.modifiedCount > 0) {
        msg = 'update-profile-success';

        //activity log
        const createActivityLog: CreateActivityLog = {
          actionBy: {
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            avatar: user.avatar,
            is_active: user.is_active,
            role: user.role
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
            oldValue: oldValue,
            newValue: newValue
          }
        }
        await this.activityLogService.create(createActivityLog, session, [user._id.toString()]);
        await session.commitTransaction();
      }
      else msg = 'update-profile-fail';
      return { msg };
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  public async getProfile(userId: string): Promise<GetProfileResponse> {
    let user: UserModel = (await this.userCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { salt: 0, hash: 0 } },
    )) as UserModel;
    if (!user) {
      this.logger.error('User not found');
      throw new NotFoundException();
    }
    user = await this.authService.getRoleUser(user);
    const response = new GetProfileResponse();
    response.id = user._id.toString();
    response.first_name = user.first_name;
    response.last_name = user.last_name;
    response.phone_code = user.phone_code;
    response.phone_number = user.phone_number;
    response.email = user.email;
    response.avatar = user.avatar;
    response.role = user.role;
    return response;
  }

  public getRoleOfUserLookup() {
    const lookup_user_role = {
      $lookup: {
        from: NormalCollection.USER_ROLES,
        localField: '_id',
        foreignField: 'user_id',
        pipeline: [
          {
            $lookup: {
              from: NormalCollection.ROLES,
              localField: 'role_id',
              foreignField: '_id',
              as: 'role'
            }
          },
          { $set: { role: { $first: '$role' } } }
        ],
        as: 'user_role',
      },
    }

    return lookup_user_role;
  }

  public async getListUser(query: ListUsersDTO) {
    try {
      const { q, is_active, tenant_id, plant_id, exclude_roles, page, limit, sort_by, sort_order, skip } = query;

      const match_filters = {};
      if (q) {
        match_filters['$or'] = [
          { first_name: { $regex: q, $options: 'i' } },
          { last_name: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
          { full_name: { $regex: q, $options: 'i' } }
        ]
      }
      ![undefined, null].includes(is_active) && (match_filters['is_active'] = is_active);
      tenant_id && (match_filters['user_manage_tenant.tenant._id'] = new ObjectId(tenant_id));
      plant_id && (match_filters['user_manage_plant.tenant.plants._id'] = new ObjectId(plant_id));
      exclude_roles.length && (match_filters['user_role.role.role'] = { $nin: exclude_roles });

      const lookup_user_role = this.getRoleOfUserLookup();

      const data = await this.userCollection.aggregate([
        lookup_user_role,
        { $project: { hash: 0, salt: 0, activation_code: 0 } },
        {
          $addFields: {
            user_role: { $first: '$user_role' },
            full_name: { $concat: ['$first_name', ' ', '$last_name'] },
          }
        },
        { $match: match_filters },
        { $sort: { [`${sort_by}`]: sort_order } },
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
      ]).toArray();

      return data[0];
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException('Occurs error');
    }
  }

  public async getUserByEmail(body: EmailDTO) {
    const { email, targets } = body;
    const user = await this.userCollection.findOne({ email });
    if (!user) throw new NotFoundException('user-not-found-by-email');
    if (targets && targets.length) {
      const search = targets.map(t => {
        return {
          target: new ObjectId(t.target),
          target_model: t.target_model,
          user_id: user._id
        }
      })
    }

    return {
      _id: user._id,
      email: user.email,
      avatar: user.avatar,
      first_name: user.first_name,
      last_name: user.last_name
    }
  }

  public async findUser(query: Object = {}) {
    const user = await this.userCollection.aggregate([
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
      },
      {
        $match: query
      }
    ]).toArray()

    return user.length ? user[0] : null;
  }
}

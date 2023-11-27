import { BadRequestException, Injectable, Logger, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Collection, ObjectId } from 'mongodb';
import { InjectCollection } from 'src/modules/mongodb';
import { NormalCollection } from 'src/shared/constants/mongo.collection';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from 'src/modules/jwt/jwt.service';
import { AuthTokenInfo } from 'src/modules/jwt/interfaces';

@Injectable()
export class JwtAuthenticationMiddleware implements NestMiddleware {
  private readonly logger = new Logger(JwtAuthenticationMiddleware.name);

  constructor(
    private readonly jwtService: JwtService,
    @InjectCollection(NormalCollection.USER_LOGIN) private readonly userLoginCollection: Collection,
    @InjectCollection(NormalCollection.USERS) private readonly userCollection: Collection,
    @InjectCollection(NormalCollection.ROLE_GROUP_PERMISSIONS)
    private readonly roleGroupPermissionsCollection: Collection,
  ) {}

  async use(req: Request, _: Response, next: NextFunction) {
    const header = req.headers['authorization'] || '';
    const token = header.split(' ')[1];
    const maybeError = new UnauthorizedException();
    if (!header || !token) {
      return next(maybeError);
    }

    try {
      const rs = await this.jwtService.verifyToken(token);
      if (!rs) {
        return next(maybeError);
      }
    } catch (error) {
      this.logger.error(error);
      return next(maybeError);
    }

    const decodeToken = (await this.jwtService.decodeToken(token)) as AuthTokenInfo;

    const user = await this.userCollection
      .aggregate([
        {
          $match: {
            _id: new ObjectId(decodeToken.userId),
          },
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
        },
        {
          $group: {
            _id: '$_id',
            email: { $first: '$email' },
            avatar: { $first: '$avatar' },
            first_name: { $first: '$first_name' },
            last_name: { $first: '$last_name' },
            role: { $first: '$role' },
            is_active: { $first: '$is_active' },
          },
        },
        {
          $project: {
            email: 1,
            avatar: 1,
            first_name: 1,
            last_name: 1,
            role: 1,
            is_active: 1,
          },
        },
      ])
      .toArray();

    if (!user[0].is_active)
      throw new BadRequestException(
        'Your account is currently inactive. Please contact customer support for assistance in reactivating your account.',
      );

    const group_permissions = await this.roleGroupPermissionsCollection
      .aggregate([
        {
          $match: {
            role_id: user[0].role._id,
          },
        },
        {
          $lookup: {
            from: 'group_permissions',
            localField: 'group_permission_id',
            foreignField: '_id',
            as: 'group_permissions',
          },
        },
      ])
      .toArray();
    user[0].group_permissions_keys = [];
    if (group_permissions?.length != 0) {
      user[0].group_permissions_keys = group_permissions.map((x) => x.group_permissions[0].key);
    }

    req['user'] = user[0];

    return next();
  }
}

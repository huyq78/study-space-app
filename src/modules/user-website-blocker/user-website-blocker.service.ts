import { ClientSession, Collection, MongoClient, ObjectId } from 'mongodb';
import { NormalCollection } from 'src/shared/constants/mongo.collection';
import { InjectClient, InjectCollection } from '../mongodb';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { BaseResponse } from 'src/shared/dto/base.response.dto';
import { CreateUserWebsiteBlockerDTO } from 'src/shared/dto/request/user-website-blocker/create-website-blocker.request';
import { BLOCK_STATUS } from 'src/shared/constants/user-website-blocker.constants';
import { WebSocketGatewayy } from '../socket/websocket.gateway';
import { UserWebsiteBlockerModel } from 'src/shared/models/user-website-blocker.model';

@Injectable()
export class UserWebsiteBlockerService {
  private readonly logger: Logger = new Logger(UserWebsiteBlockerService.name);
  jwtService: any;
  constructor(
    @InjectCollection(NormalCollection.USER_WEBSITE_BLOCKER)
    private readonly userWebsiteBlockerCollection: Collection,
    private readonly websocketGateway: WebSocketGatewayy,
    @InjectClient()
    private readonly client: MongoClient,
  ) {}

  async updateMany(
    userId: string,
    createUserWebsiteBlockerDtos: CreateUserWebsiteBlockerDTO[],
  ) {
    const session = this.client.startSession();
    try {
      session.startTransaction();

      const updateGroup = {
        block: [],
        unblock: [],
        new: [],
      };
      createUserWebsiteBlockerDtos.forEach((dto) => {
        if (!dto.id) {
          dto.userId = userId;
          updateGroup.new.push(dto);
        } else if (dto.status === BLOCK_STATUS.BLOCKED) {
          updateGroup.block.push(new ObjectId(dto.id));
        } else if (dto.status === BLOCK_STATUS.UNBLOCKED) {
          updateGroup.unblock.push(new ObjectId(dto.id));
        }
      });

      const updatePromises = [];
      updateGroup.new.length > 0 &&
        updatePromises.push(
          this.userWebsiteBlockerCollection.insertMany(updateGroup.new),
        );
      updateGroup.block.length > 0 &&
        updatePromises.push(
          this.userWebsiteBlockerCollection.updateMany(
            {
              _id: {
                $in: updateGroup.block,
              },
            },
            {
              $set: {
                status: BLOCK_STATUS.BLOCKED,
              },
            },
          ),
        );
      updateGroup.unblock.length > 0 &&
        updatePromises.push(
          this.userWebsiteBlockerCollection.updateMany(
            {
              _id: {
                $in: updateGroup.unblock,
              },
            },
            {
              $set: {
                status: BLOCK_STATUS.UNBLOCKED,
              },
            },
          ),
        );
      await Promise.all(updatePromises);

      const blockedWebsites = await this.findAll(userId, BLOCK_STATUS.BLOCKED);

      const socketMessage = {
        action: 'block-websites',
        userId: userId,
        websites: blockedWebsites.data.map((dto) => {
          if (dto.status === BLOCK_STATUS.BLOCKED) {
            return {
              name: dto.name,
              url: dto.url,
            };
          }
        }),
      };
      this.websocketGateway.broadcast(JSON.stringify(socketMessage));

      await session.commitTransaction();

      return BaseResponse.ok('Update User Website Blocker successfully');
    } catch (error) {
      this.logger.error('Got error when update User Website Blocker');
      this.logger.error(error);
      session.inTransaction() && (await session.abortTransaction());
      await session.endSession();
      throw new BadRequestException(error);
    } finally {
      session.inTransaction() && (await session.abortTransaction());
    }
  }

  async findAll(userId?: string, status?: BLOCK_STATUS) {
    const session = this.client.startSession();
    try {
      session.startTransaction();

      const filter = {};
      userId && (filter['userId'] = userId);
      status && (filter['status'] = status);
      const websitesByUser: UserWebsiteBlockerModel[] =
        (await this.userWebsiteBlockerCollection
          .find(filter)
          .toArray()) as UserWebsiteBlockerModel[];

      await session.commitTransaction();

      return BaseResponse.ok(
        'Get Blocked Websites successfully',
        websitesByUser,
      );
    } catch (error) {
      this.logger.error('Got error when create space');
      this.logger.error(error);
      session.inTransaction() && (await session.abortTransaction());
      await session.endSession();
      throw new BadRequestException(error);
    } finally {
      session.inTransaction() && (await session.abortTransaction());
    }
  }

  async remove(id: string) {
    const session = this.client.startSession();
    try {
      session.startTransaction();

      const website = await this.userWebsiteBlockerCollection.findOne(
        {
          _id: new ObjectId(id),
        },
        { session },
      );
      if (!website) {
        throw BaseResponse.notFound();
      }

      await this.userWebsiteBlockerCollection.deleteOne(
        {
          _id: new ObjectId(id),
        },
        { session },
      );

      await session.commitTransaction();

      return BaseResponse.ok('Remove Blocked Website successfully');
    } catch (error) {
      this.logger.error('Got error when remove Blocked Website');
      this.logger.error(error.message);
      await session.abortTransaction();
      await session.endSession();
      throw new BadRequestException(error);
    } finally {
      await session.endSession();
    }
  }
}

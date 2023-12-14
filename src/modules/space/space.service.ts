import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateSpaceDTO } from 'src/shared/dto/request/space/create-space.request';
import { InjectClient, InjectCollection } from '../mongodb';
import { NormalCollection } from 'src/shared/constants/mongo.collection';
import { ClientSession, Collection, MongoClient, ObjectId } from 'mongodb';
import { BaseResponse } from 'src/shared/dto/base.response.dto';

@Injectable()
export class SpaceService {
  private readonly logger: Logger = new Logger(SpaceService.name);
  constructor(
    @InjectCollection(NormalCollection.SPACE)
    private readonly spaceCollection: Collection,
    @InjectClient()
    private readonly client: MongoClient,
  ) {}

  async create(createSpaceDto: CreateSpaceDTO) {
    const session = this.client.startSession();
    const { name, link, type } = createSpaceDto;
    try {
      session.startTransaction();

      await this.validateSpaceInfo(createSpaceDto, session);

      await this.spaceCollection.insertOne(
        {
          name,
          link,
          type,
        },
        { session },
      );

      await session.commitTransaction();

      return BaseResponse.ok('Create space successfully');
    } catch (error) {
      this.logger.error('Got error when create space');
      this.logger.error(error);
      await session.abortTransaction();
      await session.endSession();
      throw new BadRequestException(error);
    } finally {
      await session.endSession();
    }
  }

  findAll() {
    return `This action returns all space`;
  }

  async findOne(id: string) {
    const session = this.client.startSession();
    try {
      session.startTransaction();

      const space = await this.spaceCollection.findOne(
        {
          _id: new ObjectId(id),
        },
        { session },
      );
      if (!space) {
        throw BaseResponse.notFound()
      }

      await session.commitTransaction();

      return BaseResponse.ok('Get space successfully', space);
    } catch (error) {
      this.logger.error('Got error when get space');
      this.logger.error(error.message);
      await session.abortTransaction();
      await session.endSession();
      throw new BadRequestException(error);
    } finally {
      await session.endSession();
    }
  }

  update(id: number, updateSpaceDto: CreateSpaceDTO) {
    return `This action updates a #${id} space`;
  }

  remove(id: number) {
    return `This action removes a #${id} space`;
  }

  async validateSpaceInfo(spaceInfo: CreateSpaceDTO, session: ClientSession) {
    const { name, link } = spaceInfo;
    const nameExisted = await this.spaceCollection.findOne(
      {
        name,
      },
      { session },
    );
    if (nameExisted) {
      throw new BadRequestException('Space name already exists');
    }
    const linkExisted = await this.spaceCollection.findOne(
      {
        link,
      },
      { session },
    );
    if (linkExisted) {
      throw new BadRequestException('Space link already exists');
    }
  }
}

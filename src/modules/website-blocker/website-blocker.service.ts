import { ClientSession, Collection, MongoClient, ObjectId } from 'mongodb';
import { NormalCollection } from 'src/shared/constants/mongo.collection';
import { InjectClient, InjectCollection } from '../mongodb';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { BaseResponse } from 'src/shared/dto/base.response.dto';
import { CreateWebsiteBlockerDTO } from 'src/shared/dto/request/website-blocker/create-website-blocker.request';

@Injectable()
export class WebsiteBlockerService {
  private readonly logger: Logger = new Logger(WebsiteBlockerService.name);
  jwtService: any;
  constructor(
    @InjectCollection(NormalCollection.WEBSITE_BLOCKER)
    private readonly websiteBlockerCollection: Collection,
    @InjectClient()
    private readonly client: MongoClient,
  ) {}

  async create(createWebsiteBlockerDto: CreateWebsiteBlockerDTO) {
    const session = this.client.startSession();
    const { name, url } = createWebsiteBlockerDto;
    try {
      session.startTransaction();

      await this.validateBlockedWebsitesInfo(createWebsiteBlockerDto, session);

      await this.websiteBlockerCollection.insertOne(
        {
          name,
          url,
        },
        { session },
      );

      await session.commitTransaction();

      return BaseResponse.ok('Create Website Blocker successfully');
    } catch (error) {
      this.logger.error('Got error when create Website Blocker');
      this.logger.error(error);
      await session.abortTransaction();
      await session.endSession();
      throw new BadRequestException(error);
    } finally {
      await session.endSession();
    }
  }

  async findAll() {
    const session = this.client.startSession();
    try {
      session.startTransaction();

      const websites = await this.websiteBlockerCollection.find().toArray();

      await session.commitTransaction();

      return BaseResponse.ok('Get Blocked Websites successfully', websites);
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

  async findOne(id: string) {
    const session = this.client.startSession();
    try {
      session.startTransaction();

      const website = await this.websiteBlockerCollection.findOne(
        {
          _id: new ObjectId(id),
        },
        { session },
      );
      if (!website) {
        throw BaseResponse.notFound();
      }

      await session.commitTransaction();

      return BaseResponse.ok('Get Blocked Website successfully', website);
    } catch (error) {
      this.logger.error('Got error when get Blocked Website');
      this.logger.error(error.message);
      await session.abortTransaction();
      await session.endSession();
      throw new BadRequestException(error);
    } finally {
      await session.endSession();
    }
  }

  update(id: number, updateSpaceDto: CreateWebsiteBlockerDTO) {
    return `This action updates a #${id} space`;
  }

  async remove(id: string) {
    const session = this.client.startSession();
    try {
      session.startTransaction();

      const website = await this.websiteBlockerCollection.findOne(
        {
          _id: new ObjectId(id),
        },
        { session },
      );
      if (!website) {
        throw BaseResponse.notFound();
      }

      await this.websiteBlockerCollection.deleteOne(
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

  async validateBlockedWebsitesInfo(
    blockedWebsitesInfo: CreateWebsiteBlockerDTO,
    session: ClientSession,
  ) {
    const { name, url } = blockedWebsitesInfo;
    const nameExisted = await this.websiteBlockerCollection.findOne(
      {
        name,
      },
      { session },
    );
    if (nameExisted) {
      throw new BadRequestException('Blocked Website name already exists');
    }
    const linkExisted = await this.websiteBlockerCollection.findOne(
      {
        url,
      },
      { session },
    );
    if (linkExisted) {
      throw new BadRequestException('Blocked Websites url already exists');
    }
  }
}

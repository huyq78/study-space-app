import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CreateSpaceDTO } from 'src/shared/dto/request/space/create-space.request';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { ApiOkResponseBase } from 'src/shared/utils/swagger.utils';
import { BaseResponse } from 'src/shared/dto/base.response.dto';
import { WebsiteBlockerService } from 'src/modules/website-blocker/website-blocker.service';
import { CreateWebsiteBlockerDTO } from 'src/shared/dto/request/website-blocker/create-website-blocker.request';
import { UserWebsiteBlockerService } from 'src/modules/user-website-blocker/user-website-blocker.service';
import { User } from 'src/decorators/user.decorator';
import { CreateUserWebsiteBlockerDTO } from 'src/shared/dto/request/user-website-blocker/create-website-blocker.request';

@ApiTags('user-website-blocker')
@ApiBearerAuth()
@Controller('/user-website-blocker')
export class UserWebsiteBlockerController {
  constructor(private readonly userWebsiteBlockerService: UserWebsiteBlockerService) {}

  @Get()
  async findAll(@User('_id') userId: string) {
    return await this.userWebsiteBlockerService.findAll(userId);
  }

  @Patch()
  @ApiBody({ type: [CreateUserWebsiteBlockerDTO] })
  update(@User('_id') userId: string, @Body() updateUserWebsiteBlockerDtos: CreateUserWebsiteBlockerDTO[]) {
    return this.userWebsiteBlockerService.updateMany(userId, updateUserWebsiteBlockerDtos);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userWebsiteBlockerService.remove(id);
  }
}

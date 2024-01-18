import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
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

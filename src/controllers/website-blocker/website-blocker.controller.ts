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

@ApiTags('website-blocker')
@ApiBearerAuth()
@Controller('/website-blocker')
export class WebsiteBlockerController {
  constructor(private readonly websiteBlockerService: WebsiteBlockerService) {}

  @Post()
  @ApiBody({ type: CreateSpaceDTO })
  @ApiOkResponseBase(BaseResponse)
  async create(@Body() createWebsiteBlockerDto: CreateWebsiteBlockerDTO) {
    return await this.websiteBlockerService.create(createWebsiteBlockerDto);
  }

  @Get()
  async findAll() {
    return await this.websiteBlockerService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.websiteBlockerService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWebsiteBlockerDto: CreateWebsiteBlockerDTO) {
    return this.websiteBlockerService.update(+id, updateWebsiteBlockerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.websiteBlockerService.remove(id);
  }
}

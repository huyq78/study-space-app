import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SpaceService } from '../../modules/space/space.service';
import { CreateSpaceDTO } from 'src/shared/dto/request/space/create-space.request';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { ApiOkResponsePaginated } from 'src/shared/dto/response/pagination/base.decorator';
import { ApiOkResponseBase } from 'src/shared/utils/swagger.utils';
import { BaseResponse } from 'src/shared/dto/base.response.dto';

@ApiTags('space')
@Controller('/space')
export class SpaceController {
  constructor(private readonly spaceService: SpaceService) {}

  @Post()
  @ApiBody({ type: CreateSpaceDTO })
  @ApiBearerAuth()
  @ApiOkResponseBase(BaseResponse)
  async create(@Body() createSpaceDto: CreateSpaceDTO) {
    return await this.spaceService.create(createSpaceDto);
  }

  @Get()
  findAll() {
    return this.spaceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.spaceService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSpaceDto: CreateSpaceDTO) {
    return this.spaceService.update(+id, updateSpaceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.spaceService.remove(+id);
  }
}

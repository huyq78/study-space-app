import {
  Body,
  Controller,
  HttpCode,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { User } from 'src/decorators/user.decorator';
import { UserService } from 'src/modules/user/user.service';
import { ChangePasswordDTO } from 'src/shared/dto/request/user/change-password.request';
import { ChangePasswordResponse } from 'src/shared/dto/response/user/change-password.response';
import { UpdateProfileDTO } from 'src/shared/dto/request/user/update-profile.request';
import { UpdateProfileResponse } from 'src/shared/dto/response/user/update-profile.response';
import { ApiOkResponseBase } from 'src/shared/utils/swagger.utils';
import { GetProfileResponse } from 'src/shared/dto/response/user/get-profile.response';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { RegisterDTO } from 'src/shared/dto/request/user/register.request';
import { RegisterResponse } from 'src/shared/dto/response/user/register.response';

@ApiTags('user')
@Controller('/user')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Post('register')
  @ApiBody({ type: RegisterDTO })
  @ApiOkResponseBase(RegisterResponse)
  @HttpCode(200)
  public async register(
    @Body() registerDTO: RegisterDTO,
  ): Promise<RegisterResponse> {
    return await this.service.register(registerDTO);
  }

  @Post('change-password')
  @ApiBody({ type: ChangePasswordDTO })
  @ApiOkResponseBase(ChangePasswordResponse)
  @ApiBearerAuth()
  @HttpCode(200)
  public async changePassword(
    @Body() changePasswordDto: ChangePasswordDTO,
    @User('_id') userId: string,
  ): Promise<ChangePasswordResponse> {
    return await this.service.changePassword(userId, changePasswordDto);
  }

  @Get('profile')
  @ApiOkResponseBase(GetProfileResponse)
  @ApiBearerAuth()
  @HttpCode(200)
  public async getProfile(
    @User('_id') userId: string,
  ): Promise<GetProfileResponse> {
    return await this.service.getProfile(userId);
  }

  @Post('update-profile')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateProfileDTO })
  @UseInterceptors(FileInterceptor('file'))
  @ApiOkResponseBase(UpdateProfileResponse)
  @ApiBearerAuth()
  @HttpCode(200)
  public async updateProfile(
    @Body() updateProfileDto: UpdateProfileDTO,
    @User('_id') userId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ })],
        fileIsRequired: false,
      }),
    )
    file: Express.Multer.File,
  ): Promise<UpdateProfileResponse> {
    return await this.service.updateProfile(userId, updateProfileDto, file);
  }
}

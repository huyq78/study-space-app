import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { CreateNewPasswordDTO } from 'src/shared/dto/request/authentication/create-new-password.request';
import { LoginDTO } from 'src/shared/dto/request/authentication/login.request';
import { LogoutDTO } from 'src/shared/dto/request/authentication/logout.request';
import { RefreshTokenDTO } from 'src/shared/dto/request/authentication/refresh-token.request';
import { CreateNewPasswordResponse } from 'src/shared/dto/response/authentication/create-new-password.response';
import { LoginResponse } from 'src/shared/dto/response/authentication/login.response';
import { RefreshTokenResponse } from 'src/shared/dto/response/authentication/refresh-token.response';
import { ApiOkResponseBase } from 'src/shared/utils/swagger.utils';

@ApiTags('authentication')
@Controller('/auth')
export class AuthenticationController {
  constructor(private readonly service: AuthenticationService) {}

  @Post('login')
  @ApiBody({ type: LoginDTO })
  @ApiOkResponseBase(LoginResponse)
  @HttpCode(200)
  public async login(@Body() loginDto: LoginDTO): Promise<LoginResponse> {
    return await this.service.login(loginDto);
  }

  @Post('logout')
  @ApiResponse({ type: Boolean })
  @ApiBearerAuth()
  public async logout(@Body() logoutDto: LogoutDTO): Promise<boolean> {
    return await this.service.logout(logoutDto.token);
  }

  @Post('create-new-password')
  @ApiBody({ type: CreateNewPasswordDTO })
  @ApiOkResponseBase(CreateNewPasswordResponse)
  @HttpCode(200)
  public async createNewPassword(
    @Body() createNewPasswordDto: CreateNewPasswordDTO,
  ): Promise<CreateNewPasswordResponse> {
    return await this.service.createNewPassword(createNewPasswordDto);
  }

  @Post('refresh-token')
  @ApiBody({ type: RefreshTokenDTO })
  @ApiOkResponseBase(RefreshTokenResponse)
  @HttpCode(200)
  public async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDTO,
  ): Promise<RefreshTokenResponse> {
    return await this.service.refreshToken(refreshTokenDto);
  }
}

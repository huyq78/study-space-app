import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";
import { BLOCK_STATUS } from "src/shared/constants/user-website-blocker.constants";

export class CreateUserWebsiteBlockerDTO {
  @IsOptional()
  @ApiProperty()
  public id?: string;

  @IsOptional()
  @ApiProperty()
  public userId?: string;

  @IsOptional()
  @ApiProperty()
  public name?: string;

  @IsOptional()
  @ApiProperty()
  public url?: string;

  @IsNotEmpty()
  @ApiProperty()
  public status: BLOCK_STATUS;
}
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreateWebsiteBlockerDTO {
  @IsNotEmpty()
  @ApiProperty()
  public name: string;

  @IsNotEmpty()
  @ApiProperty()
  public url: string;
}
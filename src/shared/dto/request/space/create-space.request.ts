import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreateSpaceDTO {
  @IsNotEmpty()
  @ApiProperty()
  public name: string;

  @IsNotEmpty()
  @ApiProperty()
  public link: string;

  @IsNotEmpty()
  @ApiProperty()
  public type: string;
}
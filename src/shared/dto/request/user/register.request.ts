import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from "class-validator";
import { Match } from "src/shared/validations/match.validation";

export class RegisterDTO {
  @ApiProperty({ description: 'First name of account' })
  @IsNotEmpty()
  public firstName: string;

  @ApiProperty({ description: 'Last name of account' })
  @IsNotEmpty()
  public lastName: string;

  @ApiProperty({ description: 'Email of account' })
  @IsNotEmpty()
  @IsEmail()
  public email: string;

  @ApiProperty({ description: 'Phone number of account' })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => String(value))
  public phoneNumber: string;

  @IsNotEmpty({ message: 'This field is not empty' })
  @ApiProperty()
  @MinLength(8, { message: 'Password is too short' })
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\W|_)(?=.*\d).*$/, { message: 'Password is too weak' })
  public password: string;

  @IsNotEmpty()
  @ApiProperty()
  @Match('password')
  public confirmPassword: string;
}

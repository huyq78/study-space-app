import { ApiProperty } from '@nestjs/swagger';
import { ROLE } from 'src/shared/models/users.model';

export class GetProfileResponse {
  @ApiProperty()
  public id: string;
  @ApiProperty()
  public firstName: string;
  @ApiProperty()
  public lastName: string;
  @ApiProperty()
  public phoneNumber: string;
  @ApiProperty()
  public email: string;
  @ApiProperty()
  public avatar: string;
  @ApiProperty()
  public role?: ROLE;
}
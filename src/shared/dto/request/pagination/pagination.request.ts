import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import {
  PAGINATION_DEFAULT,
  SORT_ORDER,
} from 'src/shared/constants/pagination.constants';

export class PaginationDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim().toLowerCase())
  keyword?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Transform(({ value }) => JSON.parse(value))
  public page?: number = PAGINATION_DEFAULT.PAGE;

  @ApiPropertyOptional({ default: 15 })
  @IsOptional()
  @Transform(({ value }) => JSON.parse(value))
  public limit?: number = PAGINATION_DEFAULT.LIMIT;

  @Expose()
  @Transform(
    ({ obj: { page, limit } }) =>
      ((Number(page) || PAGINATION_DEFAULT.PAGE) - 1) *
      (Number(limit) || PAGINATION_DEFAULT.LIMIT),
  )
  public skip: number;

  @ApiPropertyOptional()
  @IsOptional()
  public sortBy?: string;

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'] })
  @IsOptional()
  public sortOrder?: SORT_ORDER = SORT_ORDER.DESC;
}

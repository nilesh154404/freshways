import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class RangeDTO {
  @ApiPropertyOptional({ default: 1, minimum: 1, description: 'Page number (1-based, default 1)' })
  @IsOptional()
  @Transform(({ value }) => {
    const num = Number(value);
    if (!Number.isFinite(num) || num <= 0) return 1;
    return Math.floor(num);
  })
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 50, description: 'Items per page (default 20, capped at max 50)' })
  @IsOptional()
  @Transform(({ value }) => {
    const num = Number(value);
    if (!Number.isFinite(num) || num <= 0) return 20;
    return Math.min(Math.floor(num), 50);
  })
  @IsInt()
  @Min(1)
  limit: number = 20;
}

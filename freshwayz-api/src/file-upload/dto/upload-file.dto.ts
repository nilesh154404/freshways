import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UploadFileDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number) // ✅ converts string to number
  @IsNumber()
  customerId?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @Type(() => Number) // ✅ converts string to number
  @IsNumber()
  vendorId?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @Type(() => Number) // ✅ converts string to number
  @IsNumber()
  orderId?: number;

  @Type(() => Number) // ✅ converts string to number
  @IsNumber()
  @IsOptional()
  tenantId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number) // ✅ converts string to number
  @IsNumber()
  marketingContentId?: number;
}

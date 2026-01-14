// src/marketing-content/dto/create-marketing-content.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMarketingContentDto {
  @ApiProperty({ description: 'Category ID', example: 1 })
  @Type(() => Number)
  @IsNumber()
  categoryId: number;

  @ApiPropertyOptional({ description: 'Product ID', example: 10 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  productId?: number;

  @ApiPropertyOptional({ description: 'Vendor ID', example: 5 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  vendorId?: number;

  @ApiProperty({ description: 'Marketing description', example: 'Fresh vegetables campaign' })
  @IsString()
  description: string;

  // 👇 Swagger-only field (required for file upload UI)
  @ApiPropertyOptional({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Marketing media files (images/videos)',
  })
  media_files?: any[];
}

// // src/marketing-content/dto/create-marketing-content.dto.ts
// import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
// import { Type } from 'class-transformer';
// import { IsNumber, IsOptional, IsString } from 'class-validator';

// export class CreateMarketingContentDto {
//   // @ApiProperty({ description: 'Category ID' })
//   // @IsNumber()
//   // categoryId: number;

//   // @ApiPropertyOptional({ description: 'Product ID' })
//   // @IsOptional()
//   // @IsNumber()
//   // productId?: number;
//   @Type(() => Number)
//   @IsNumber()
//   categoryId: number;

//   @Type(() => Number)
//   @IsNumber()
//   @IsOptional()
//   productId?: number;
//   @ApiPropertyOptional({ description: 'Vendor ID' })
//   @IsOptional()
//   @IsNumber()
//   vendorId?: number;

//   @ApiPropertyOptional({ description: 'Description text' })
//   // @IsOptional()
//   @IsString()
//   description: string;
// }

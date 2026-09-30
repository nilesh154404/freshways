// src/marketing-content/dto/create-marketing-content.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';

/**
 * Represents a single medical/health source citation.
 * Required by Apple App Store Guideline 1.4.1.
 */
export class SourceDto {
  @ApiProperty({ description: 'Name of the source / organisation', example: 'NIH' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'URL of the source', example: 'https://ods.od.nih.gov/' })
  @IsUrl()
  url: string;
}

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

  /**
   * Medical/health source citations (Apple App Store Guideline 1.4.1).
   * Provide an array of { name, url } objects when the content contains
   * medical or nutritional claims.
   */
  @ApiPropertyOptional({
    description: 'Medical/health source references for Apple App Store compliance',
    type: [SourceDto],
    example: [
      { name: 'NIH', url: 'https://ods.od.nih.gov/' },
      { name: 'WHO', url: 'https://www.who.int/' },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SourceDto)
  sources?: SourceDto[];

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

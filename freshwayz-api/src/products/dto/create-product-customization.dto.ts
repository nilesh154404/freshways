import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsBoolean, IsNumber, IsString, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { SelectionType } from '../entities/product-customization-group.entity';

export class CreateProductCustomizationOptionDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiPropertyOptional({ default: 0 })
    @IsNumber()
    @IsOptional()
    additionalPrice?: number;

    @ApiPropertyOptional({ default: 0 })
    @IsNumber()
    @IsOptional()
    displayOrder?: number;

    @ApiPropertyOptional({ default: true })
    @IsBoolean()
    @IsOptional()
    status?: boolean;
}

export class CreateProductCustomizationGroupDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty({ enum: SelectionType })
    @IsEnum(SelectionType)
    selectionType: SelectionType;

    @ApiPropertyOptional({ default: false })
    @IsBoolean()
    @IsOptional()
    isRequired?: boolean;

    @ApiPropertyOptional({ default: 0 })
    @IsNumber()
    @IsOptional()
    displayOrder?: number;

    @ApiPropertyOptional({ default: true })
    @IsBoolean()
    @IsOptional()
    status?: boolean;

    @ApiProperty({ type: [CreateProductCustomizationOptionDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateProductCustomizationOptionDto)
    options: CreateProductCustomizationOptionDto[];
}

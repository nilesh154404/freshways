import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productUrl: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  measurementUnit: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  measurementValue: string;

  @ApiProperty({ example: 'VEG', enum: ['VEG', 'NON-VEG'] })
  @IsString()
  @IsOptional()
  productType?: string;

  // @ApiProperty({ example: "MARKET" })
  // @IsString()
  // serviceOfferingCode: string;

  @ApiProperty({
    required: false,
    example: 1,
    default: 1,
    description: 'Defaults to vendor with ID 1',
  })
  @IsOptional()
  @Transform(({ value }) => value ?? 1)
  @IsNumber()
  vendorId?: number;

  
  @ApiProperty({
    required: false,
    example: 1,
    default: 1,
    description: 'Defaults to vendor with ID 1',
  })
  @IsOptional()
  @Transform(({ value }) => value ?? 1)
  @IsNumber()
  categoryId?: number;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsNumber()
  vendorSubscriptionPlanId?: number;
}

// import { ApiProperty } from '@nestjs/swagger';
// import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

// export class CreateProductDto {
//   @ApiProperty()
//   @IsString()
//   @IsNotEmpty()
//   label: string;

//   @ApiProperty()
//   @IsString()
//   @IsNotEmpty()
//   description: string;

//   @ApiProperty()
//   @IsString()
//   @IsNotEmpty()
//   productUrl: string;

//   @ApiProperty()
//   @IsString()
//   @IsNotEmpty()
//   measurementUnit: string;

//   @ApiProperty()
//   @IsString()
//   @IsNotEmpty()
//   measurementValue: string;

//   @ApiProperty()
//   @IsString()
//   @IsNotEmpty()
//   serviceOfferingId: string;
  
//   @ApiProperty()
//   @IsString()
//   @IsOptional()
//   vendorId: string;

//   @ApiProperty({ required: false })
//   @IsOptional()
//   @IsNumber()
//   vendorSubscriptionPlanId: number;
// }

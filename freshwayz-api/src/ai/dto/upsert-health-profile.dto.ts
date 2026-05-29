import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpsertHealthProfileDto {
  @ApiProperty({ example: 101, description: 'Unique user identifier' })
  @IsInt()
  @Min(1)
  userId: number;

  @ApiPropertyOptional({ example: 'Riya Sharma' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 29 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  age?: number;

  @ApiPropertyOptional({ example: 'female' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({ example: 165, description: 'Height in centimeters' })
  @IsNumber()
  @IsPositive()
  heightCm: number;

  @ApiProperty({ example: 68, description: 'Weight in kilograms' })
  @IsNumber()
  @IsPositive()
  weightKg: number;

  @ApiPropertyOptional({ example: 'O+' })
  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @ApiPropertyOptional({ example: 'Family history of diabetes' })
  @IsOptional()
  @IsString()
  medicalHistory?: string;

  @ApiPropertyOptional({ example: 'Peanut allergy' })
  @IsOptional()
  @IsString()
  allergies?: string;

  @ApiPropertyOptional({ example: 'Metformin 500mg daily' })
  @IsOptional()
  @IsString()
  currentMedications?: string;

  @ApiPropertyOptional({ example: 6.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(24)
  sleepHours?: number;

  @ApiPropertyOptional({ example: 'moderate' })
  @IsOptional()
  @IsString()
  activityLevel?: string;

  @ApiPropertyOptional({ example: 'vegetarian' })
  @IsOptional()
  @IsString()
  dietPreference?: string;

  @ApiPropertyOptional({ example: 18, description: 'Vitamin D level' })
  @IsOptional()
  @IsNumber()
  vitaminD?: number;

  @ApiPropertyOptional({ example: 250, description: 'Vitamin B12 level' })
  @IsOptional()
  @IsNumber()
  vitaminB12?: number;

  @ApiPropertyOptional({ example: 200, description: 'Total cholesterol level' })
  @IsOptional()
  @IsNumber()
  cholesterol?: number;

  @ApiPropertyOptional({ example: 100, description: 'Fasting blood sugar' })
  @IsOptional()
  @IsNumber()
  fastingSugar?: number;

  @ApiPropertyOptional({ example: 5.8, description: 'HbA1c percentage' })
  @IsOptional()
  @IsNumber()
  hba1c?: number;
}

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


  @ApiPropertyOptional({ example: 165, description: 'Height in centimeters' })
  @IsOptional()
  @IsNumber()
  heightCm?: number;

  @ApiPropertyOptional({ example: 165, description: 'Height value' })
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiPropertyOptional({ example: 'cm', enum: ['cm', 'inch'], description: 'Height unit (cm or inch)' })
  @IsOptional()
  @IsString()
  heightUnit?: string;

  @ApiProperty({ example: 68, description: 'Weight in kilograms' })
  @IsNumber()
  @IsPositive()
  weightKg: number;

  @ApiPropertyOptional({ example: 24.9, description: 'Body Mass Index' })
  @IsOptional()
  @IsNumber()
  bmi?: number;

  @ApiPropertyOptional({ example: 'Maintain weight', description: 'Health Goal (Gain weight, Loose weight, Maintain weight, Stay healthy, Diating)' })
  @IsOptional()
  @IsString()
  goal?: string;

  @ApiPropertyOptional({ example: 'O+' })
  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @ApiPropertyOptional({ description: 'Custom prompt for health analysis' })
  @IsOptional()
  @IsString()
  analysisPrompt?: string;

  @ApiPropertyOptional({ example: 'Type 2 diabetes, controlled blood pressure' })
  @IsOptional()
  @IsString()
  medicalInformation?: string;

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
}

// dto/create-delivery-slot.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsString } from 'class-validator';

export class CreateDeliverySlotDto {
  @ApiProperty({ example: '2025-01-01' })
  @IsString()
  date: string;

  @ApiProperty({ example: '10:00' })
  @IsString()
  startTime: string;

  @ApiProperty({ example: '12:00' })
  @IsString()
  endTime: string;

  @ApiProperty({ example: 20 })
  @IsInt()
  capacity: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ example: 1, required: false })
  @IsInt()
  planId?: number;
}

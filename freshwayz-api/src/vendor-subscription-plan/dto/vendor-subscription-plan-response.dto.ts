import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VendorSubscriptionPlanResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  label: string;

  @ApiProperty()
  planName?: string;  // Alias for label (for frontend compatibility)

  @ApiProperty()
  description: string;

  @ApiPropertyOptional()
  price?: number;

  @ApiPropertyOptional()
  duration?: string;

  @ApiProperty()
  vendorId: number;
}

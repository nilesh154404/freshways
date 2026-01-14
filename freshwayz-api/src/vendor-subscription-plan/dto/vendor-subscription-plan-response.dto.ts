import { ApiProperty } from '@nestjs/swagger';

export class VendorSubscriptionPlanResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  label: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  vendorId: number;
}

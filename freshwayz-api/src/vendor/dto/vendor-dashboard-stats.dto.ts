import { ApiProperty } from "@nestjs/swagger";

export class VendorDashboardStatsDto {
  @ApiProperty()
  totalProducts: number;

  @ApiProperty()
  totalOrders: number;

  @ApiProperty()
  activeProducts: number;

  @ApiProperty()
  totalRevenue: number;

  @ApiProperty()
  totalPosts: number;

  @ApiProperty()
  activeUsers: number;

  @ApiProperty({ type: [Object] })
  weeklyRevenue: { name: string; revenue: number }[];

  @ApiProperty({ type: [Object] })
  weeklyOrders: { name: string; orders: number }[];
}

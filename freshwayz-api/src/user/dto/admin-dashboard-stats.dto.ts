import { ApiProperty } from "@nestjs/swagger";

export class AdminDashboardStatsDto {
  @ApiProperty()
  totalProducts: number;

  @ApiProperty()
  totalVendors: number;

  @ApiProperty()
  activeUsers: number;

  @ApiProperty()
  totalSubscriptions: number;

  @ApiProperty({ type: [Object] })
  weeklyRevenue: { name: string; revenue: number }[];

  @ApiProperty({ type: [Object] })
  weeklyOrders: { name: string; orders: number }[];
}

export declare class VendorDashboardStatsDto {
    totalProducts: number;
    totalOrders: number;
    activeProducts: number;
    totalRevenue: number;
    weeklyRevenue: {
        name: string;
        revenue: number;
    }[];
    weeklyOrders: {
        name: string;
        orders: number;
    }[];
}

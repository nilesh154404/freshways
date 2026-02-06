export declare class VendorDashboardStatsDto {
    totalProducts: number;
    totalOrders: number;
    activeProducts: number;
    totalRevenue: number;
    totalPosts: number;
    activeUsers: number;
    weeklyRevenue: {
        name: string;
        revenue: number;
    }[];
    weeklyOrders: {
        name: string;
        orders: number;
    }[];
}

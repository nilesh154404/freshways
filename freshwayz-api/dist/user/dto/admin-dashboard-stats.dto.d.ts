export declare class AdminDashboardStatsDto {
    totalProducts: number;
    totalVendors: number;
    activeUsers: number;
    totalSubscriptions: number;
    weeklyRevenue: {
        name: string;
        revenue: number;
    }[];
    weeklyOrders: {
        name: string;
        orders: number;
    }[];
}

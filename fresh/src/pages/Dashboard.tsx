import { useEffect, useState } from "react";
import axios from "axios";
import { DashboardHeader } from "@/components/DashboardHeader";
import { StatCard } from "@/components/StatCard";
import { Package, ShoppingBag, Users, Calendar, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

type WeeklyData = { name: string; revenue?: number; orders?: number };

type VendorStats = {
  totalProducts: number;
  totalOrders: number;
  activeProducts: number;
  totalPosts: number;
  activeUsers: number;
  totalRevenue: number;
  weeklyRevenue: WeeklyData[];
  weeklyOrders: WeeklyData[];
};

type AdminStats = {
  totalProducts: number;
  totalVendors: number;
  activeUsers: number;
  totalSubscriptions: number;
  weeklyRevenue: WeeklyData[];
  weeklyOrders: WeeklyData[];
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<VendorStats | AdminStats | null>(null);
  const [revenueData, setRevenueData] = useState<WeeklyData[]>([]);
  const [ordersData, setOrdersData] = useState<WeeklyData[]>([]);

  const role = localStorage.getItem("role");
  const profileId = localStorage.getItem("profileId");
  const isVendor = role?.toLowerCase() === "vendor";
  const isAdmin = role?.toLowerCase() === "admin";

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

        let response;
        if (isVendor && profileId) {
          response = await axios.get<VendorStats>(
            `http://localhost:3064/vendors/${profileId}/dashboard-stats`,
            { headers }
          );
        } else if (isAdmin) {
          response = await axios.get<AdminStats>(
            `http://localhost:3064/user/admin/dashboard-stats`,
            { headers }
          );
        } else {
          setLoading(false);
          return;
        }

        setStats(response.data);
        setRevenueData(response.data.weeklyRevenue);
        setOrdersData(response.data.weeklyOrders);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isVendor, isAdmin, profileId]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <DashboardHeader />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col min-h-screen">
        <DashboardHeader />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">No dashboard data available</p>
        </div>
      </div>
    );
  }

  const vendorStats = isVendor ? (stats as VendorStats) : null;
  const adminStats = isAdmin ? (stats as AdminStats) : null;

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      
      <div className="flex-1 space-y-6 p-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back! Here's your {isVendor ? "business" : "platform"} overview.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {isVendor && vendorStats && (
            <>
              <StatCard
                title="Total Products"
                value={vendorStats.totalProducts.toString()}
                change={`${vendorStats.activeProducts} active`}
                changeType="positive"
                icon={Package}
                iconColor="text-primary"
              />
              <StatCard
                title="Total Orders"
                value={vendorStats.totalOrders.toString()}
                change="All time"
                changeType="positive"
                icon={ShoppingBag}
                iconColor="text-accent"
              />
              <StatCard
                title="Total Posts"
                value={(vendorStats.totalPosts || 0).toString()}
                change="Marketing posts"
                changeType="positive"
                icon={FileText}
                iconColor="text-chart-2"
              />
              <StatCard
                title="Active Users"
                value={(vendorStats.activeUsers || 0).toString()}
                change="Engaged customers"
                changeType="positive"
                icon={Users}
                iconColor="text-chart-3"
              />
            </>
          )}

          {isAdmin && adminStats && (
            <>
              <StatCard
                title="Total Products"
                value={adminStats.totalProducts.toLocaleString()}
                change="Platform wide"
                changeType="positive"
                icon={Package}
                iconColor="text-primary"
              />
              <StatCard
                title="Total Vendors"
                value={adminStats.totalVendors.toString()}
                change="Registered sellers"
                changeType="positive"
                icon={ShoppingBag}
                iconColor="text-accent"
              />
              <StatCard
                title="Active Users"
                value={adminStats.activeUsers.toLocaleString()}
                change="Total customers"
                changeType="positive"
                icon={Users}
                iconColor="text-chart-2"
              />
            </>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Revenue</CardTitle>
              <CardDescription>Revenue trend for the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)"
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Revenue (₹)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Orders</CardTitle>
              <CardDescription>Order volume for the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ordersData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)"
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="orders" 
                    fill="hsl(var(--chart-2))" 
                    name="Orders"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

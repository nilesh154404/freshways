import { useState, useEffect } from "react";
import axios from "axios";
import { DashboardHeader } from "@/components/DashboardHeader";
import { StatCard } from "@/components/StatCard";
import { Package, ShoppingBag, Users, Calendar, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const API_BASE = "http://localhost:3064";

const Dashboard = () => {
  const [productData, setProductData] = useState<{ count: string, growth: number, newThisMonth: number } | null>(null);
  const [vendorData, setVendorData] = useState<{ count: string, growth: number, newThisMonth: number } | null>(null);
  const [customerData, setCustomerData] = useState<{ count: string, growth: number, newThisMonth: number } | null>(null);
  const [marketingData, setMarketingData] = useState<{ count: string, growth: number, newThisMonth: number } | null>(null);
  const [revenueData, setRevenueData] = useState<{ name: string; revenue: number }[]>([]);
  const [ordersData, setOrdersData] = useState<{ name: string; orders: number }[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);

  const getLocalStorageCtx = () => {
    if (typeof window === 'undefined') return { token: null };
    let rawToken = localStorage.getItem("token") || localStorage.getItem("accessToken");
    return {
      token: rawToken?.replace(/^"|"$/g, '')
    };
  };

  useEffect(() => {
    const role = localStorage.getItem("role");
    setUserRole(role);

    fetchProductStats();
    fetchVendorStats();
    fetchCustomerStats();
    fetchWeeklyStats();
    if (role === 'Vendor') {
      fetchMarketingStats();
    }
  }, []);

  const fetchWeeklyStats = async () => {
    try {
      const { token } = getLocalStorageCtx();
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const role = localStorage.getItem("role");
      const profileId = localStorage.getItem("profileId");

      let url = `${API_BASE}/orders/stats/weekly`;
      if (role !== "Admin" && profileId) {
        url += `?vendorId=${profileId}`;
      }

      const res = await axios.get(url, config);
      const data: any = res.data;
      if (data) {
        setRevenueData(data.revenueData || []);
        setOrdersData(data.ordersData || []);
      }
    } catch (error) {
      console.error("Failed to fetch weekly stats", error);
    }
  };

  const fetchMarketingStats = async () => {
    try {
      const { token } = getLocalStorageCtx();
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const profileId = localStorage.getItem("profileId");

      let url = `${API_BASE}/marketing/count`;
      if (profileId) {
        url += `?vendorId=${profileId}`;
      }

      const res = await axios.get(url, config);
      const data: any = res.data;
      if (data) {
        setMarketingData({
          count: data.total?.toLocaleString() || "0",
          growth: data.growth || 0,
          newThisMonth: data.newThisMonth || 0
        });
      }
    } catch (error) {
      console.error("Failed to fetch marketing stats", error);
    }
  }

  const fetchProductStats = async () => {
    try {
      const { token } = getLocalStorageCtx();
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const role = localStorage.getItem("role");
      const profileId = localStorage.getItem("profileId");

      let url = `${API_BASE}/products/count`;
      if (role !== "Admin" && profileId) {
        url += `?vendorId=${profileId}`;
      }

      const res = await axios.get(url, config);
      const data: any = res.data;
      if (data) {
        setProductData({
          count: data.total?.toLocaleString() || "0",
          growth: data.growth || 0,
          newThisMonth: data.newThisMonth || 0
        });
      }

    } catch (error) {
      console.error("Failed to fetch product stats", error);
      setProductData({ count: "0", growth: 0, newThisMonth: 0 });
    }
  };

  const fetchVendorStats = async () => {
    try {
      const role = localStorage.getItem("role");
      if (role !== "Admin") {
        setVendorData({ count: "1", growth: 0, newThisMonth: 0 });
        return;
      }

      const { token } = getLocalStorageCtx();
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const res = await axios.get(`${API_BASE}/vendors/count`, config);
      const data: any = res.data;

      if (data) {
        setVendorData({
          count: data.total?.toLocaleString() || "0",
          growth: data.growth || 0,
          newThisMonth: data.newThisMonth || 0
        });
      }
    } catch (error) {
      console.error("Failed to fetch vendor stats", error);
      setVendorData({ count: "0", growth: 0, newThisMonth: 0 });
    }
  };

  const fetchCustomerStats = async () => {
    try {
      const { token } = getLocalStorageCtx();
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const res = await axios.get(`${API_BASE}/customer/count`, config);
      const data: any = res.data;

      if (data) {
        setCustomerData({
          count: data.total?.toLocaleString() || "0",
          growth: data.growth || 0,
          newThisMonth: data.newThisMonth || 0
        });
      }
    } catch (error) {
      console.error("Failed to fetch customer stats", error);
      setCustomerData({ count: "0", growth: 0, newThisMonth: 0 });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />

      <div className="flex-1 space-y-6 p-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
          <p className="text-muted-foreground">Welcome back! Here's your business overview.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Products"
            value={productData?.count || "Loading..."}
            change={productData ? `${productData.growth > 0 ? '+' : ''}${productData.growth}% from last month` : ""}
            changeType={productData?.growth && productData.growth >= 0 ? "positive" : "negative"}
            icon={Package}
            iconColor="text-primary"
          />

          {userRole === 'Vendor' ? (
            <StatCard
              title="Total Posts"
              value={marketingData?.count || "Loading..."}
              change={marketingData ? `${marketingData.growth > 0 ? '+' : ''}${marketingData.growth}% from last month` : ""}
              changeType={marketingData?.growth && marketingData.growth >= 0 ? "positive" : "negative"}
              icon={FileText}
              iconColor="text-accent"
            />
          ) : (
            <StatCard
              title="Total Vendors"
              value={vendorData?.count || "Loading..."}
              change={vendorData ? `${vendorData.growth > 0 ? '+' : ''}${vendorData.growth}% from last month` : ""}
              changeType={vendorData?.growth && vendorData.growth >= 0 ? "positive" : "negative"}
              icon={ShoppingBag}
              iconColor="text-accent"
            />
          )}

          <StatCard
            title="Active Users"
            value={customerData?.count || "Loading..."}
            change={customerData ? `${customerData.growth > 0 ? '+' : ''}${customerData.growth}% from last month` : ""}
            changeType={customerData?.growth && customerData.growth >= 0 ? "positive" : "negative"}
            icon={Users}
            iconColor="text-chart-2"
          />
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

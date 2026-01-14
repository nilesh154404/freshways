import { DashboardHeader } from "@/components/DashboardHeader";
import { StatCard } from "@/components/StatCard";
import { Package, ShoppingBag, Users, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const revenueData = [
  { name: "Mon", revenue: 4200 },
  { name: "Tue", revenue: 3800 },
  { name: "Wed", revenue: 5100 },
  { name: "Thu", revenue: 4600 },
  { name: "Fri", revenue: 6200 },
  { name: "Sat", revenue: 7800 },
  { name: "Sun", revenue: 5900 },
];

const ordersData = [
  { name: "Mon", orders: 42 },
  { name: "Tue", orders: 38 },
  { name: "Wed", orders: 51 },
  { name: "Thu", orders: 46 },
  { name: "Fri", orders: 62 },
  { name: "Sat", orders: 78 },
  { name: "Sun", orders: 59 },
];

const Dashboard = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      
      <div className="flex-1 space-y-6 p-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
          <p className="text-muted-foreground">Welcome back! Here's your business overview.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Products"
            value="1,284"
            change="+12% from last month"
            changeType="positive"
            icon={Package}
            iconColor="text-primary"
          />
          <StatCard
            title="Total Vendors"
            value="48"
            change="+3 new this month"
            changeType="positive"
            icon={ShoppingBag}
            iconColor="text-accent"
          />
          <StatCard
            title="Active Users"
            value="2,845"
            change="+18% from last month"
            changeType="positive"
            icon={Users}
            iconColor="text-chart-2"
          />
          <StatCard
            title="Subscriptions"
            value="892"
            change="+8% from last month"
            changeType="positive"
            icon={Calendar}
            iconColor="text-chart-3"
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

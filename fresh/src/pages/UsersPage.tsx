import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users as UsersIcon, Search } from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subscriptionType: "Daily" | "Weekly" | "Monthly" | "None";
  community: string;
  status: "Active" | "Inactive";
  joinDate: string;
  totalOrders: number;
};

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubscription, setFilterSubscription] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://192.168.1.36:3064/auth/customer");
        const data = await res.json();

        // Map backend response to User type
        const mappedUsers: User[] = data.map((u: any) => ({
          id: u.id.toString(),
          name: u.fullName,
          email: u.email,
          phone: u.phone,
          subscriptionType: u.goal === "weight loss" ? "Monthly" : "None", // example mapping
          community: u.community,
          status: "Active", // default, you can update based on your backend
          joinDate: u.createdAt,
          totalOrders: 0, // if you have totalOrders in backend, map it here
        }));

        setUsers(mappedUsers);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.community.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSubscription = 
      filterSubscription === "all" || user.subscriptionType === filterSubscription;
    
    const matchesStatus = 
      filterStatus === "all" || user.status === filterStatus;

    return matchesSearch && matchesSubscription && matchesStatus;
  });

  const getSubscriptionBadgeVariant = (type: string) => {
    if (type === "None") return "secondary";
    return "default";
  };

  const getStatusBadgeVariant = (status: string) => {
    return status === "Active" ? "default" : "secondary";
  };

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      <div className="flex-1 space-y-6 p-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Users</h2>
          <p className="text-muted-foreground">Manage registered users and their subscriptions</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">Registered accounts</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.subscriptionType !== "None").length}
              </div>
              <p className="text-xs text-muted-foreground">With active plans</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.status === "Active").length}
              </div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.reduce((sum, u) => sum + u.totalOrders, 0)}
              </div>
              <p className="text-xs text-muted-foreground">All time orders</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Directory</CardTitle>
            <CardDescription>View and manage all registered users</CardDescription>
            <div className="flex gap-4 pt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name, email, or community..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterSubscription} onValueChange={setFilterSubscription}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Subscription" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subscriptions</SelectItem>
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="None">No Subscription</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Community</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Join Date</TableHead>
                  {/* <TableHead className="text-right">Orders</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>
                      <Badge variant={getSubscriptionBadgeVariant(user.subscriptionType)}>
                        {user.subscriptionType}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.community}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(user.status)}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(user.joinDate).toLocaleDateString()}</TableCell>
                    {/* <TableCell className="text-right font-medium">{user.totalOrders}</TableCell> */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No users found matching your filters
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UsersPage;

// import { useState } from "react";
// import { DashboardHeader } from "@/components/DashboardHeader";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Users as UsersIcon, Search } from "lucide-react";

// type User = {
//   id: string;
//   name: string;
//   email: string;
//   phone: string;
//   subscriptionType: "Daily" | "Weekly" | "Monthly" | "None";
//   community: string;
//   status: "Active" | "Inactive";
//   joinDate: string;
//   totalOrders: number;
// };

// const UsersPage = () => {
//   const [users] = useState<User[]>([
//     {
//       id: "1",
//       name: "Rajesh Kumar",
//       email: "rajesh.kumar@email.com",
//       phone: "+91 98765 11111",
//       subscriptionType: "Monthly",
//       community: "Green Valley Apartments",
//       status: "Active",
//       joinDate: "2024-01-15",
//       totalOrders: 45,
//     },
//     {
//       id: "2",
//       name: "Priya Sharma",
//       email: "priya.sharma@email.com",
//       phone: "+91 98765 22222",
//       subscriptionType: "Weekly",
//       community: "Sunrise Complex",
//       status: "Active",
//       joinDate: "2024-02-20",
//       totalOrders: 28,
//     },
//     {
//       id: "3",
//       name: "Amit Patel",
//       email: "amit.patel@email.com",
//       phone: "+91 98765 33333",
//       subscriptionType: "Daily",
//       community: "Green Valley Apartments",
//       status: "Active",
//       joinDate: "2024-03-10",
//       totalOrders: 62,
//     },
//     {
//       id: "4",
//       name: "Sneha Reddy",
//       email: "sneha.reddy@email.com",
//       phone: "+91 98765 44444",
//       subscriptionType: "None",
//       community: "Palm Grove Society",
//       status: "Inactive",
//       joinDate: "2024-01-05",
//       totalOrders: 12,
//     },
//   ]);

//   const [searchQuery, setSearchQuery] = useState("");
//   const [filterSubscription, setFilterSubscription] = useState<string>("all");
//   const [filterStatus, setFilterStatus] = useState<string>("all");

//   const filteredUsers = users.filter((user) => {
//     const matchesSearch = 
//       user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       user.community.toLowerCase().includes(searchQuery.toLowerCase());
    
//     const matchesSubscription = 
//       filterSubscription === "all" || user.subscriptionType === filterSubscription;
    
//     const matchesStatus = 
//       filterStatus === "all" || user.status === filterStatus;

//     return matchesSearch && matchesSubscription && matchesStatus;
//   });

//   const getSubscriptionBadgeVariant = (type: string) => {
//     if (type === "None") return "secondary";
//     return "default";
//   };

//   const getStatusBadgeVariant = (status: string) => {
//     return status === "Active" ? "default" : "secondary";
//   };

//   return (
//     <div className="flex flex-col min-h-screen">
//       <DashboardHeader />
//       <div className="flex-1 space-y-6 p-6">
//         <div>
//           <h2 className="text-3xl font-bold tracking-tight">Users</h2>
//           <p className="text-muted-foreground">Manage registered users and their subscriptions</p>
//         </div>

//         <div className="grid gap-4 md:grid-cols-4">
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Total Users</CardTitle>
//               <UsersIcon className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{users.length}</div>
//               <p className="text-xs text-muted-foreground">Registered accounts</p>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">
//                 {users.filter(u => u.subscriptionType !== "None").length}
//               </div>
//               <p className="text-xs text-muted-foreground">With active plans</p>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Active Users</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">
//                 {users.filter(u => u.status === "Active").length}
//               </div>
//               <p className="text-xs text-muted-foreground">Currently active</p>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">
//                 {users.reduce((sum, u) => sum + u.totalOrders, 0)}
//               </div>
//               <p className="text-xs text-muted-foreground">All time orders</p>
//             </CardContent>
//           </Card>
//         </div>

//         <Card>
//           <CardHeader>
//             <CardTitle>User Directory</CardTitle>
//             <CardDescription>View and manage all registered users</CardDescription>
//             <div className="flex gap-4 pt-4">
//               <div className="relative flex-1">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   placeholder="Search users by name, email, or community..."
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   className="pl-10"
//                 />
//               </div>
//               <Select value={filterSubscription} onValueChange={setFilterSubscription}>
//                 <SelectTrigger className="w-[180px]">
//                   <SelectValue placeholder="Subscription" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Subscriptions</SelectItem>
//                   <SelectItem value="Daily">Daily</SelectItem>
//                   <SelectItem value="Weekly">Weekly</SelectItem>
//                   <SelectItem value="Monthly">Monthly</SelectItem>
//                   <SelectItem value="None">No Subscription</SelectItem>
//                 </SelectContent>
//               </Select>
//               <Select value={filterStatus} onValueChange={setFilterStatus}>
//                 <SelectTrigger className="w-[150px]">
//                   <SelectValue placeholder="Status" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Status</SelectItem>
//                   <SelectItem value="Active">Active</SelectItem>
//                   <SelectItem value="Inactive">Inactive</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Name</TableHead>
//                   <TableHead>Email</TableHead>
//                   <TableHead>Phone</TableHead>
//                   <TableHead>Subscription</TableHead>
//                   <TableHead>Community</TableHead>
//                   <TableHead>Status</TableHead>
//                   <TableHead>Join Date</TableHead>
//                   <TableHead className="text-right">Orders</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {filteredUsers.map((user) => (
//                   <TableRow key={user.id}>
//                     <TableCell className="font-medium">{user.name}</TableCell>
//                     <TableCell>{user.email}</TableCell>
//                     <TableCell>{user.phone}</TableCell>
//                     <TableCell>
//                       <Badge variant={getSubscriptionBadgeVariant(user.subscriptionType)}>
//                         {user.subscriptionType}
//                       </Badge>
//                     </TableCell>
//                     <TableCell>{user.community}</TableCell>
//                     <TableCell>
//                       <Badge variant={getStatusBadgeVariant(user.status)}>
//                         {user.status}
//                       </Badge>
//                     </TableCell>
//                     <TableCell>{new Date(user.joinDate).toLocaleDateString()}</TableCell>
//                     <TableCell className="text-right font-medium">{user.totalOrders}</TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//             {filteredUsers.length === 0 && (
//               <div className="text-center py-8 text-muted-foreground">
//                 No users found matching your filters
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default UsersPage;

import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import { DashboardHeader } from "@/components/DashboardHeader";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
    Select,
    SelectItem,
    SelectTrigger,
    SelectContent,
    SelectValue,
} from "@/components/ui/select";

import { Eye } from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api";

//
// TYPES
//

type Product = {
    id: number;
    label: string;
    description: string;
    productUrl: string;
    measurementUnit: string;
    measurementValue: string;
};

type ListedOrder = {
    id: number;
    productName: string | null;
    product: Product | null;
    quantity: number;
    amount: string;
    notes: string | null;
};

type Payment = {
    id: number;
    amount: string;
    method: string;
    status: string;
    createdAt: string;
};

type Community = {
    id: number;
    name: string;
    address: string;
};

type APIOrder = {
    id: number;
    customer: {
        id: number;
        fullName: string;
        phone: string;
    };
    vendor: any;
    community: Community;
    createdAt: string;
    completedAt: string | null;
    orderStatus: string;
    paymentStatus: string;
    deliveryDate: string | null;
    grandTotal: string;
    listedOrders: ListedOrder[];
    payments: Payment[];
};

//
// CONSTANTS
//

const allowedStatuses = [
    "DRAFTED",
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "COMPLETED",
    "CANCELLED",
];

const rowsPerPageOptions = [10, 25, 50];

//
// MAIN COMPONENT
//

export default function OrdersReport() {
    const [orders, setOrders] = useState<APIOrder[]>([]);
    const [communities, setCommunities] = useState<Community[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [communityFilter, setCommunityFilter] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    // Pagination
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // View Order modal
    const [selectedOrder, setSelectedOrder] = useState<APIOrder | null>(null);
    const role = localStorage.getItem("role");
    const profileId = localStorage.getItem("profileId");

    //
    // FETCH DATA
    //

    useEffect(() => {
        fetchOrders();
        fetchCommunities();
    }, []);

    const fetchOrders = async () => {

        let url = `${API_BASE_URL}/orders?page=1&limit=500`;
        if (role != "Admin") url += `&vendorId=` + profileId;

        try {
            const response = await axios.get<APIOrder[]>(
                url
            );
            setOrders(response.data);
        } catch (error) {
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    const fetchCommunities = async () => {
        try {
            const response = await axios.get<Community[]>(
                `${API_BASE_URL}/community`
            );
            setCommunities(response.data);
        } catch { }
    };

    //
    // FILTERING
    //

    const filteredOrders = useMemo(() => {
        return orders
            .filter((o) =>
                search
                    ? o.customer.fullName.toLowerCase().includes(search.toLowerCase()) ||
                    o.customer.phone.includes(search)
                    : true
            )
            .filter((o) => (statusFilter ? o.orderStatus === statusFilter : true))
            .filter((o) => (communityFilter ? o.community.name === communityFilter : true))
            .filter((o) => {
                if (!dateFrom && !dateTo) return true;

                const d = new Date(o.createdAt);
                const from = dateFrom ? new Date(dateFrom) : null;
                const to = dateTo ? new Date(dateTo) : null;

                if (from && d < from) return false;
                if (to && d > to) return false;

                return true;
            });
    }, [search, statusFilter, communityFilter, dateFrom, dateTo, orders]);

    //
    // PAGINATION
    //

    const totalRecords = filteredOrders.length;
    const totalPages = Math.ceil(totalRecords / rowsPerPage);

    const pageOrders = filteredOrders.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    const showingFrom = totalRecords === 0 ? 0 : (page - 1) * rowsPerPage + 1;
    const showingTo = Math.min(page * rowsPerPage, totalRecords);

    const handleStatusUpdate = async (orderId: number, newStatus: string) => {
        try {
            await axios.patch(`${API_BASE_URL}/orders/${orderId}/status`, {
                status: newStatus,
            });
            toast.success(`Order ${newStatus.toLowerCase()} successfully`);
            setOrders((prev) =>
                prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
            );
        } catch (error) {
            console.error(error);
            toast.error("Failed to update order status");
        }
    };

    //
    // RENDER
    //

    return (
        <div className="flex flex-col min-h-screen">
            <DashboardHeader />

            <div className="p-6 space-y-6">
                <h2 className="text-3xl font-bold">Orders Report</h2>

                {/* FILTER BAR */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg bg-white">

                    <Input
                        placeholder="Search by customer or phone"
                        className="md:col-span-2"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <Select onValueChange={setStatusFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            {allowedStatuses.map((st) => (
                                <SelectItem key={st} value={st}>
                                    {st}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select onValueChange={setCommunityFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Community" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            {communities.map((c) => (
                                <SelectItem key={c.id} value={c.name}>
                                    {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                    />

                    <Input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                    />

                </div>

                {/* TABLE */}
                <div className="border rounded-lg bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Community</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-center">View</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {pageOrders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell>#{order.id}</TableCell>

                                    <TableCell>
                                        {order.customer.fullName}
                                        <div className="text-xs text-muted-foreground">
                                            {order.customer.phone}
                                        </div>
                                    </TableCell>

                                    <TableCell>{order.community.name}</TableCell>

                                    <TableCell>
                                        <Badge>{order.orderStatus}</Badge>
                                    </TableCell>

                                    <TableCell>
                                        <Badge variant="outline">{order.paymentStatus}</Badge>
                                    </TableCell>

                                    <TableCell>₹{order.grandTotal}</TableCell>

                                    <TableCell>
                                        {new Date(order.createdAt).toLocaleString()}
                                    </TableCell>

                                    <TableCell className="text-center">
                                        <Button variant="ghost" onClick={() => setSelectedOrder(order)}>
                                            <Eye className="h-5 w-5" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {pageOrders.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8">
                                        No orders found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* PAGINATION */}
                <div className="flex flex-col md:flex-row justify-between items-center pt-4 gap-4">
                    <p className="text-sm text-muted-foreground">
                        Showing <b>{showingFrom}</b>–<b>{showingTo}</b> of <b>{totalRecords}</b>
                    </p>

                    <div className="flex items-center gap-3">
                        <span className="text-sm">Rows:</span>

                        <Select
                            defaultValue={rowsPerPage.toString()}
                            onValueChange={(v) => {
                                setRowsPerPage(Number(v));
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="w-20">
                                <SelectValue />
                            </SelectTrigger>

                            <SelectContent>
                                {rowsPerPageOptions.map((n) => (
                                    <SelectItem key={n} value={n.toString()}>
                                        {n}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        <Button
                            variant="outline"
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                        >
                            Prev
                        </Button>

                        {[...Array(totalPages)].map((_, i) => {
                            const p = i + 1;
                            return (
                                <Button
                                    key={p}
                                    variant={page === p ? "default" : "outline"}
                                    onClick={() => setPage(p)}
                                >
                                    {p}
                                </Button>
                            );
                        })}

                        <Button
                            variant="outline"
                            disabled={page === totalPages}
                            onClick={() => setPage(page + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>

            {/* VIEW ORDER MODAL */}
            {selectedOrder && (
                <Dialog open onOpenChange={() => setSelectedOrder(null)}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Order #{selectedOrder.id}</DialogTitle>
                            <DialogDescription>Order items and payments</DialogDescription>
                        </DialogHeader>

                        {/* ITEMS */}
                        <div className="p-4 border rounded-lg mt-4">
                            <h3 className="font-semibold text-lg mb-4">Items</h3>

                            {selectedOrder.listedOrders.map((item) => {
                                const unitPrice = parseFloat(item.amount) || 0;
                                const quantity = item.quantity || 1;
                                const total = unitPrice * quantity;
                                return (
                                    <div key={item.id} className="border rounded-lg p-3 mb-3 flex justify-between items-start bg-card shadow-sm hover:shadow-md transition-shadow">
                                        <div className="space-y-1.5 flex-1 min-w-0">
                                            <p className="font-semibold text-base truncate text-foreground">
                                                {item.productName || item.product?.label || "Unnamed Item"}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                ₹{unitPrice.toFixed(2)} × {quantity}
                                            </p>
                                            {item.notes && (
                                                <p className="text-xs italic text-muted-foreground bg-muted p-1.5 rounded mt-2 inline-block">
                                                    Notes: {item.notes}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right font-bold text-base text-primary pl-4 shrink-0">
                                            ₹{total.toFixed(2)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* PAYMENTS */}
                        <div className="p-4 border rounded-lg mt-4">
                            <h3 className="font-semibold text-lg mb-2">Payments</h3>

                            {selectedOrder.payments.length === 0 ? (
                                <p className="text-muted-foreground">No payments recorded</p>
                            ) : (
                                selectedOrder.payments.map((p) => (
                                    <div key={p.id} className="border rounded p-3 mb-2">
                                        <p>Amount: ₹{p.amount}</p>
                                        <p>Method: {p.method}</p>
                                        <p>Status: {p.status}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* STATUS UPDATE BUTTONS */}
                        <div className="flex flex-col sm:flex-row gap-2 mt-4">
                            {selectedOrder.orderStatus === "DRAFTED" && (
                                <Button
                                    className="flex-1"
                                    onClick={() => handleStatusUpdate(selectedOrder.id, "CONFIRMED")}
                                >
                                    Accept Order
                                </Button>
                            )}

                            {selectedOrder.orderStatus === "CONFIRMED" && (
                                <Button
                                    className="flex-1"
                                    onClick={() => handleStatusUpdate(selectedOrder.id, "PROCESSING")}
                                >
                                    In Process
                                </Button>
                            )}

                            {selectedOrder.orderStatus === "PROCESSING" && (
                                <Button
                                    className="flex-1"
                                    onClick={() => handleStatusUpdate(selectedOrder.id, "COMPLETED")}
                                >
                                    Complete
                                </Button>
                            )}

                            {selectedOrder.orderStatus !== "COMPLETED" &&
                                selectedOrder.orderStatus !== "CANCELLED" && (
                                    <Button
                                        variant="destructive"
                                        className="flex-1"
                                        onClick={() => handleStatusUpdate(selectedOrder.id, "CANCELLED")}
                                    >
                                        Cancel Order
                                    </Button>
                                )}
                        </div>
                    </DialogContent>
                </Dialog>
            )}

        </div>
    );
}


// import { useEffect, useState } from "react";
// import axios from "axios";
// import { DashboardHeader } from "@/components/DashboardHeader";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger
// } from "@/components/ui/dialog";
// import { Badge } from "@/components/ui/badge";
// import { Eye } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { toast } from "sonner";

// // Allowed statuses
// const allowedStatuses = [
//   "DRAFTED",
//   "PENDING",
//   "CONFIRMED",
//   "PROCESSING",
//   "COMPLETED",
//   "CANCELLED",
// ];

// type APIOrder = {
//   id: number;
//   customer: { fullName: string; phone: string };
//   vendor?: { businessName: string; ownerName: string };
//   community: { name: string; address: string };
//   createdAt: string;
//   orderStatus: string;
//   paymentStatus: string;
//   grandTotal: string;
//   listedOrders: {
//     id: number;
//     productName: string | null;
//     product?: { label: string };
//     quantity: number;
//     amount: string;
//     notes: string;
//   }[];
//   payments: {
//     id: number;
//     amount: string;
//     method: string;
//     status: string;
//   }[];
// };

// const OrdersReport = () => {
//   const [orders, setOrders] = useState<APIOrder[]>([]);
//   const [loading, setLoading] = useState(true);

//   // Pagination
//   const [page, setPage] = useState(1);
//   const rowsPerPage = 5;

//   const currentOrders = orders.slice(
//     (page - 1) * rowsPerPage,
//     page * rowsPerPage
//   );

//   // Modal Data
//   const [selectedOrder, setSelectedOrder] = useState<APIOrder | null>(null);

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const fetchOrders = async () => {
//     try {
//       const response = await axios.get<APIOrder[]>(
//         "http://localhost:3064/orders"
//       );
//       setOrders(response.data);
//     } catch (err) {
//       toast.error("Failed to load orders");
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "COMPLETED":
//         return "default";
//       case "CANCELLED":
//         return "destructive";
//       case "CONFIRMED":
//       case "PROCESSING":
//         return "secondary";
//       default:
//         return "outline";
//     }
//   };

//   return (
//     <div className="flex flex-col min-h-screen">
//       <DashboardHeader />

//       <div className="p-6 space-y-6">
//         <h2 className="text-3xl font-bold tracking-tight">Orders Report</h2>
//         <p className="text-muted-foreground">All customer orders</p>

//         {/* ORDERS TABLE */}
//         {loading ? (
//           <p>Loading orders...</p>
//         ) : (
//           <>
//             <div className="border rounded-lg bg-white overflow-hidden">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Order ID</TableHead>
//                     <TableHead>Customer</TableHead>
//                     <TableHead>Community</TableHead>
//                     <TableHead>Status</TableHead>
//                     <TableHead>Payment</TableHead>
//                     <TableHead>Total</TableHead>
//                     <TableHead>Created At</TableHead>
//                     <TableHead>View</TableHead>
//                   </TableRow>
//                 </TableHeader>

//                 <TableBody>
//                   {currentOrders.map((order) => (
//                     <TableRow key={order.id}>
//                       <TableCell className="font-medium">#{order.id}</TableCell>

//                       <TableCell>
//                         {order.customer.fullName}
//                         <div className="text-xs text-muted-foreground">
//                           {order.customer.phone}
//                         </div>
//                       </TableCell>

//                       <TableCell>
//                         {order.community?.name}
//                         <div className="text-xs text-muted-foreground">
//                           {order.community?.address}
//                         </div>
//                       </TableCell>

//                       <TableCell>
//                         <Badge variant={getStatusColor(order.orderStatus)}>
//                           {order.orderStatus}
//                         </Badge>
//                       </TableCell>

//                       <TableCell>
//                         <Badge
//                           variant={
//                             order.paymentStatus === "PAID"
//                               ? "default"
//                               : "outline"
//                           }
//                         >
//                           {order.paymentStatus}
//                         </Badge>
//                       </TableCell>

//                       <TableCell>₹{parseFloat(order.grandTotal).toFixed(2)}</TableCell>

//                       <TableCell>
//                         {new Date(order.createdAt).toLocaleString()}
//                       </TableCell>

//                       <TableCell>
//                         <Dialog>
//                           <DialogTrigger asChild>
//                             <Button
//                               variant="ghost"
//                               onClick={() => setSelectedOrder(order)}
//                             >
//                               <Eye className="h-5 w-5" />
//                             </Button>
//                           </DialogTrigger>

//                           <DialogContent className="max-w-2xl">
//                             <DialogHeader>
//                               <DialogTitle>
//                                 Order Details #{order.id}
//                               </DialogTitle>
//                               <DialogDescription>
//                                 Listed items and payment summary
//                               </DialogDescription>
//                             </DialogHeader>

//                             {/* LISTED ORDERS */}
//                             <div className="border rounded p-4 space-y-3">
//                               <h3 className="font-semibold text-lg">
//                                 Listed Orders
//                               </h3>

//                               {order.listedOrders.length === 0 ? (
//                                 <p className="text-muted-foreground">
//                                   No items found
//                                 </p>
//                               ) : (
//                                 order.listedOrders.map((item) => (
//                                   <div
//                                     key={item.id}
//                                     className="border rounded p-3 flex flex-col gap-1"
//                                   >
//                                     <p className="font-medium">
//                                       {item.productName ??
//                                         item.product?.label ??
//                                         "Unnamed Product"}
//                                     </p>

//                                     <p className="text-sm text-muted-foreground">
//                                       Qty: {item.quantity}
//                                     </p>

//                                     <p className="text-sm font-semibold">
//                                       ₹{parseFloat(item.amount).toFixed(2)}
//                                     </p>

//                                     {item.notes && (
//                                       <p className="text-xs italic text-muted-foreground">
//                                         Notes: {item.notes}
//                                       </p>
//                                     )}
//                                   </div>
//                                 ))
//                               )}
//                             </div>

//                             {/* PAYMENTS */}
//                             <div className="border rounded p-4 space-y-3 mt-4">
//                               <h3 className="font-semibold text-lg">
//                                 Payments
//                               </h3>

//                               {order.payments.length === 0 ? (
//                                 <p className="text-muted-foreground">
//                                   No payments recorded
//                                 </p>
//                               ) : (
//                                 order.payments.map((p) => (
//                                   <div key={p.id} className="border p-3 rounded">
//                                     <p className="font-medium">
//                                       Amount: ₹{parseFloat(p.amount).toFixed(2)}
//                                     </p>
//                                     <p className="text-sm">Method: {p.method}</p>
//                                     <p className="text-sm">Status: {p.status}</p>
//                                   </div>
//                                 ))
//                               )}
//                             </div>
//                           </DialogContent>
//                         </Dialog>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </div>

//             {/* PAGINATION */}
//             <div className="flex justify-between pt-4">
//               <Button
//                 variant="outline"
//                 disabled={page === 1}
//                 onClick={() => setPage(page - 1)}
//               >
//                 Previous
//               </Button>

//               <p className="text-sm text-muted-foreground">
//                 Page {page} of {Math.ceil(orders.length / rowsPerPage)}
//               </p>

//               <Button
//                 variant="outline"
//                 disabled={page === Math.ceil(orders.length / rowsPerPage)}
//                 onClick={() => setPage(page + 1)}
//               >
//                 Next
//               </Button>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default OrdersReport;

// import { useEffect, useState } from "react";
// import axios from "axios";
// import { DashboardHeader } from "@/components/DashboardHeader";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { toast } from "sonner";

// const allowedStatuses = [
//   "DRAFTED",
//   "PENDING",
//   "CONFIRMED",
//   "PROCESSING",
//   "COMPLETED",
//   "CANCELLED",
// ];

// type APIOrder = {
//   id: number;
//   customer: {
//     fullName: string;
//     phone: string;
//   };
//   community: {
//     name: string;
//     address: string;
//   };
//   createdAt: string;
//   orderStatus: string;
//   paymentStatus: string;
//   grandTotal: string;
// };

// const OrdersReport = () => {
//   const [orders, setOrders] = useState<APIOrder[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const fetchOrders = async () => {
//     try {
//       const response = await axios.get<APIOrder[]>(
//         "http://localhost:3064/orders"
//       );
//       setOrders(response.data);
//     } catch (err) {
//       toast.error("Failed to load orders");
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "COMPLETED":
//         return "default";
//       case "CANCELLED":
//         return "destructive";
//       case "CONFIRMED":
//       case "PROCESSING":
//         return "secondary";
//       default:
//         return "outline";
//     }
//   };

//   return (
//     <div className="flex flex-col min-h-screen">
//       <DashboardHeader />

//       <div className="p-6 space-y-6">
//         <h2 className="text-3xl font-bold tracking-tight">Orders Report</h2>
//         <p className="text-muted-foreground">Detailed list of all orders</p>

//         {loading ? (
//           <p>Loading orders...</p>
//         ) : (
//           <div className="border rounded-lg bg-white">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Order ID</TableHead>
//                   <TableHead>Customer</TableHead>
//                   <TableHead>Community</TableHead>
//                   <TableHead>Status</TableHead>
//                   <TableHead>Payment</TableHead>
//                   <TableHead>Total</TableHead>
//                   <TableHead>Created At</TableHead>
//                 </TableRow>
//               </TableHeader>

//               <TableBody>
//                 {orders.map((order) => (
//                   <TableRow key={order.id}>
//                     <TableCell className="font-medium">
//                       #{order.id}
//                     </TableCell>

//                     <TableCell>
//                       {order.customer?.fullName}
//                       <div className="text-xs text-muted-foreground">
//                         {order.customer?.phone}
//                       </div>
//                     </TableCell>

//                     <TableCell>
//                       {order.community?.name}
//                       <div className="text-xs text-muted-foreground">
//                         {order.community?.address}
//                       </div>
//                     </TableCell>

//                     <TableCell>
//                       {allowedStatuses.includes(order.orderStatus) ? (
//                         <Badge variant={getStatusColor(order.orderStatus)}>
//                           {order.orderStatus}
//                         </Badge>
//                       ) : (
//                         <Badge variant="outline">Unknown</Badge>
//                       )}
//                     </TableCell>

//                     <TableCell>
//                       <Badge
//                         variant={
//                           order.paymentStatus === "PAID"
//                             ? "default"
//                             : "outline"
//                         }
//                       >
//                         {order.paymentStatus}
//                       </Badge>
//                     </TableCell>

//                     <TableCell>₹{parseFloat(order.grandTotal).toFixed(2)}</TableCell>

//                     <TableCell>
//                       {new Date(order.createdAt).toLocaleString()}
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default OrdersReport;

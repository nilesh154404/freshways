import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Users, Edit, Package, Calendar } from "lucide-react";

import { DashboardHeader } from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

type Order = {
  id: number;
  orderStatus: string;
  paymentStatus: string;
  deliveryDate: string | null;
  isDeleted?:boolean;
  grandTotal: string;
};

type DailyPrice = {
  id: number;
  amount: string;
  date: string;
  isActive: boolean;
};

type Vendor = {
  id: number;
  businessName: string;
  ownerName: string;
  email: string;
  orders: Order[];
  dailyPrice: DailyPrice[];
};

const Vendors = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [priceDialogOpen, setPriceDialogOpen] = useState(false);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await axios.get<Vendor[]>("http://localhost:3064/vendors");
      setVendors(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch vendors");
    }
  };

  const countOrders = (orders: Order[], status: string) =>
    orders.filter((o) => o.orderStatus === status && !o?.isDeleted).length;

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      <div className="p-6 space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Vendors</h2>
        <p className="text-muted-foreground">Manage vendors, orders, and pricing</p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {vendors.map((vendor) => (
            <Card key={vendor.id} className="border hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{vendor.businessName}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Owner: {vendor.ownerName} <br />
                  Email: {vendor.email}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Total Orders: {vendor.orders.length}</span>
                  <span>Drafted: {countOrders(vendor.orders, "DRAFTED")}</span>
                </div>

                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Cancelled: {countOrders(vendor.orders, "CANCELLED")}</span>
                  <span>Completed: {countOrders(vendor.orders, "COMPLETED")}</span>
                </div>

                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setSelectedVendor(vendor);
                      setOrderDialogOpen(true);
                    }}
                  >
                    <Package className="h-4 w-4" /> View Orders
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setSelectedVendor(vendor);
                      setPriceDialogOpen(true);
                    }}
                  >
                    <Calendar className="h-4 w-4" /> Daily Prices
                  </Button>

                  <Button size="sm" variant="ghost" className="flex-1">
                    <Edit className="h-4 w-4" /> Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Orders Dialog */}
        {selectedVendor && (
          <Dialog open={orderDialogOpen} onOpenChange={(open) => setOrderDialogOpen(open)}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Orders - {selectedVendor.businessName}</DialogTitle>
                <DialogDescription>List of all orders for this vendor</DialogDescription>
              </DialogHeader>
              <div className="mt-4 max-h-80 overflow-auto">
                {selectedVendor.orders.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedVendor.orders.map((order) => (
                      <li
                        key={order.id}
                        className="flex justify-between border p-2 rounded hover:bg-gray-50 transition"
                      >
                        <span>Order #{order.id}</span>
                        <span>Status: {order.orderStatus}</span>
                        <span>Total: ₹{order.grandTotal}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No orders found</p>
                )}
              </div>
              <DialogFooter>
                <Button onClick={() => setOrderDialogOpen(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Daily Prices Dialog */}
        {selectedVendor && (
          <Dialog open={priceDialogOpen} onOpenChange={(open) => setPriceDialogOpen(open)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Daily Prices - {selectedVendor.businessName}</DialogTitle>
                <DialogDescription>List of daily prices</DialogDescription>
              </DialogHeader>
              <div className="mt-4 max-h-80 overflow-auto">
                {selectedVendor.dailyPrice.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedVendor.dailyPrice.map((price) => (
                      <li
                        key={price.id}
                        className="flex justify-between border p-2 rounded hover:bg-gray-50 transition"
                      >
                        <span>{new Date(price.date).toLocaleDateString()}</span>
                        <span>₹{price.amount}</span>
                        <span>{price.isActive ? "Active" : "Inactive"}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No daily prices found</p>
                )}
              </div>
              <DialogFooter>
                <Button onClick={() => setPriceDialogOpen(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default Vendors;

// import { useState } from "react";
// import { DashboardHeader } from "@/components/DashboardHeader";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Textarea } from "@/components/ui/textarea";
// import { Badge } from "@/components/ui/badge";
// import { Plus, Pencil, Trash2, MapPin, Phone, Mail } from "lucide-react";
// import { toast } from "sonner";

// type Vendor = {
//   id: string;
//   name: string;
//   contact: string;
//   email: string;
//   location: string;
//   assignedProducts: number;
//   commission: number;
// };

// const Vendors = () => {
//   const [vendors, setVendors] = useState<Vendor[]>([
//     {
//       id: "1",
//       name: "Green Valley Farms",
//       contact: "+91 98765 43210",
//       email: "contact@greenvalley.com",
//       location: "Punjab, India",
//       assignedProducts: 12,
//       commission: 15,
//     },
//     {
//       id: "2",
//       name: "Fresh Harvest Co.",
//       contact: "+91 98765 43211",
//       email: "info@freshharvest.com",
//       location: "Maharashtra, India",
//       assignedProducts: 8,
//       commission: 12,
//     },
//     {
//       id: "3",
//       name: "Dairy Best Ltd.",
//       contact: "+91 98765 43212",
//       email: "sales@dairybest.com",
//       location: "Gujarat, India",
//       assignedProducts: 15,
//       commission: 18,
//     },
//   ]);

//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
//   const [formData, setFormData] = useState({
//     name: "",
//     contact: "",
//     email: "",
//     location: "",
//     commission: "",
//   });

//   const resetForm = () => {
//     setFormData({
//       name: "",
//       contact: "",
//       email: "",
//       location: "",
//       commission: "",
//     });
//     setEditingVendor(null);
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (editingVendor) {
//       setVendors(vendors.map(v => 
//         v.id === editingVendor.id 
//           ? { ...v, ...formData, commission: parseFloat(formData.commission) }
//           : v
//       ));
//       toast.success("Vendor updated successfully");
//     } else {
//       const newVendor: Vendor = {
//         id: Date.now().toString(),
//         ...formData,
//         commission: parseFloat(formData.commission),
//         assignedProducts: 0,
//       };
//       setVendors([...vendors, newVendor]);
//       toast.success("Vendor added successfully");
//     }
    
//     setIsDialogOpen(false);
//     resetForm();
//   };

//   const handleEdit = (vendor: Vendor) => {
//     setEditingVendor(vendor);
//     setFormData({
//       name: vendor.name,
//       contact: vendor.contact,
//       email: vendor.email,
//       location: vendor.location,
//       commission: vendor.commission.toString(),
//     });
//     setIsDialogOpen(true);
//   };

//   const handleDelete = (id: string) => {
//     setVendors(vendors.filter(v => v.id !== id));
//     toast.success("Vendor deleted successfully");
//   };

//   return (
//     <div className="flex flex-col min-h-screen">
//       <DashboardHeader />
//       <div className="flex-1 space-y-6 p-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <h2 className="text-3xl font-bold tracking-tight">Vendors</h2>
//             <p className="text-muted-foreground">Manage your vendor partnerships</p>
//           </div>
//           <Dialog open={isDialogOpen} onOpenChange={(open) => {
//             setIsDialogOpen(open);
//             if (!open) resetForm();
//           }}>
//             <DialogTrigger asChild>
//               <Button className="gap-2">
//                 <Plus className="h-4 w-4" />
//                 Add Vendor
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="max-w-2xl">
//               <DialogHeader>
//                 <DialogTitle>{editingVendor ? "Edit Vendor" : "Add New Vendor"}</DialogTitle>
//                 <DialogDescription>
//                   {editingVendor ? "Update vendor details" : "Fill in the vendor information"}
//                 </DialogDescription>
//               </DialogHeader>
//               <form onSubmit={handleSubmit}>
//                 <div className="grid gap-4 py-4">
//                   <div className="grid gap-2">
//                     <Label htmlFor="name">Vendor Name</Label>
//                     <Input
//                       id="name"
//                       value={formData.name}
//                       onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                       placeholder="e.g., Green Valley Farms"
//                       required
//                     />
//                   </div>
//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="grid gap-2">
//                       <Label htmlFor="contact">Contact Number</Label>
//                       <Input
//                         id="contact"
//                         value={formData.contact}
//                         onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
//                         placeholder="+91 98765 43210"
//                         required
//                       />
//                     </div>
//                     <div className="grid gap-2">
//                       <Label htmlFor="email">Email Address</Label>
//                       <Input
//                         id="email"
//                         type="email"
//                         value={formData.email}
//                         onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                         placeholder="contact@vendor.com"
//                         required
//                       />
//                     </div>
//                   </div>
//                   <div className="grid gap-2">
//                     <Label htmlFor="location">Location</Label>
//                     <Textarea
//                       id="location"
//                       value={formData.location}
//                       onChange={(e) => setFormData({ ...formData, location: e.target.value })}
//                       placeholder="City, State, Country"
//                       required
//                     />
//                   </div>
//                   <div className="grid gap-2">
//                     <Label htmlFor="commission">Commission Rate (%)</Label>
//                     <Input
//                       id="commission"
//                       type="number"
//                       step="0.01"
//                       value={formData.commission}
//                       onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
//                       placeholder="15.00"
//                       required
//                     />
//                   </div>
//                 </div>
//                 <DialogFooter>
//                   <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
//                     Cancel
//                   </Button>
//                   <Button type="submit">{editingVendor ? "Update" : "Add"} Vendor</Button>
//                 </DialogFooter>
//               </form>
//             </DialogContent>
//           </Dialog>
//         </div>

//         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//           {vendors.map((vendor) => (
//             <Card key={vendor.id} className="relative">
//               <CardHeader>
//                 <div className="flex items-start justify-between">
//                   <div>
//                     <CardTitle className="text-xl">{vendor.name}</CardTitle>
//                     <CardDescription className="mt-2 flex items-center gap-1">
//                       <MapPin className="h-3 w-3" />
//                       {vendor.location}
//                     </CardDescription>
//                   </div>
//                   <Badge variant="secondary">{vendor.commission}% commission</Badge>
//                 </div>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="space-y-2">
//                   <div className="flex items-center gap-2 text-sm">
//                     <Phone className="h-4 w-4 text-muted-foreground" />
//                     <span>{vendor.contact}</span>
//                   </div>
//                   <div className="flex items-center gap-2 text-sm">
//                     <Mail className="h-4 w-4 text-muted-foreground" />
//                     <span className="truncate">{vendor.email}</span>
//                   </div>
//                 </div>
//                 <div className="pt-4 border-t">
//                   <div className="flex items-center justify-between text-sm">
//                     <span className="text-muted-foreground">Assigned Products</span>
//                     <Badge variant="outline">{vendor.assignedProducts} products</Badge>
//                   </div>
//                 </div>
//                 <div className="flex gap-2 pt-2">
//                   <Button variant="outline" className="flex-1" onClick={() => handleEdit(vendor)}>
//                     <Pencil className="h-4 w-4 mr-2" />
//                     Edit
//                   </Button>
//                   <Button variant="outline" className="flex-1" onClick={() => handleDelete(vendor.id)}>
//                     <Trash2 className="h-4 w-4 mr-2 text-destructive" />
//                     Delete
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Vendors;

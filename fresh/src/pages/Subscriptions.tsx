import { useEffect, useState, ChangeEvent } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Users, Edit, Trash2, CalendarPlus } from "lucide-react";

import { DashboardHeader } from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/lib/api";

const API_BASE = API_BASE_URL;

type Customer = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
};

type DeliverySlot = {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  isActive: boolean;
};

type Plan = {
  id: number;
  label: string;
  description: string;
  vendor: any;
  customers?: Customer[];
  deliverySlots?: DeliverySlot[];
};

const Subscriptions = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Subscription Plan Dialogs
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({ label: "", description: "" });

  // Delivery Slots
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [viewSlotDialogOpen, setViewSlotDialogOpen] = useState(false);
  const [addSlotDialogOpen, setAddSlotDialogOpen] = useState(false);
  const [slotFormData, setSlotFormData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    capacity: 1,
    isActive: true,
  });

  const role = localStorage.getItem("role");
  const profileId = localStorage.getItem("profileId");

  /* ================= LOAD PLANS ================= */
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      let url = `${API_BASE}/vendor-subscription-plans`;
      if (role !== "Admin") url = `${API_BASE}/vendor-subscription-plans/vendor/${profileId}`;

      const response = await axios.get<Plan[]>(url);
      setPlans(response.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load plans");
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= PLAN CRUD ================= */
  const resetForm = () => {
    setFormData({ label: "", description: "" });
    setEditingPlan(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        await axios.patch(`${API_BASE}/vendor-subscription-plans/${editingPlan.id}`, {
          ...formData,
          vendorId: Number(profileId),
        });
        toast.success("Plan updated successfully");
      } else {
        await axios.post(`${API_BASE}/vendor-subscription-plans`, {
          ...formData,
          vendorId: Number(profileId),
        });
        toast.success("Plan created successfully");
      }
      fetchPlans();
      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save plan");
    }
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({ label: plan.label, description: plan.description });
    setIsDialogOpen(true);
  };

  const handleDelete = async (planId: number) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;
    try {
      await axios.delete(`${API_BASE}/vendor-subscription-plans/${planId}`);
      setPlans(plans.filter((p) => p.id !== planId));
      toast.success("Plan deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete plan");
    }
  };

  /* ================= CUSTOMERS ================= */
  const handleViewCustomers = async (planId: number) => {
    try {
      const response = await axios.get(`${API_BASE}/subscriptions`);
      const data = Array.isArray(response.data) ? response.data : [];

      const planCustomers = data
        .filter((sub: any) => sub.plan?.id === planId)
        .map((sub: any) => sub.customer);

      setPlans((prev) =>
        prev.map((p) => (p.id === planId ? { ...p, customers: planCustomers } : p))
      );
      setSelectedPlan(plans.find((p) => p.id === planId) || null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch customers");
    }
  };

  /* ================= DELIVERY SLOTS ================= */
  const handleViewSlots = async (plan: Plan) => {
    try {
      const response = await axios.get(`${API_BASE}/delivery-slots/vendor-subscription-plan/${plan.id}`);
      setPlans((prev) =>
        prev.map((p) => (p.id === plan.id ? { ...p, deliverySlots: response.data } : p))
      );
      setSelectedPlan(plan);
      setViewSlotDialogOpen(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch delivery slots");
    }
  };

  const handleSlotChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSlotFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddSlot = async () => {
    if (!selectedPlan) return;
    try {
      await axios.post(`${API_BASE}/delivery-slots`, {
        ...slotFormData,
        planId: selectedPlan.id,
      });
      toast.success("Delivery slot added");
      setAddSlotDialogOpen(false);
      setSlotFormData({ date: "", startTime: "", endTime: "", capacity: 1, isActive: true });
    } catch (err) {
      console.error(err);
      toast.error("Failed to add delivery slot");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      <div className="flex-1 space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Subscription Plans</h2>
            <p className="text-muted-foreground">
              Manage plans, view customers & delivery slots
            </p>
          </div>

          {/* Create/Edit Plan Dialog */}
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Create Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingPlan ? "Edit Plan" : "Create Plan"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="label">Plan Name</Label>
                    <Input
                      id="label"
                      value={formData.label}
                      onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                      placeholder="Plan Name"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="Plan description"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">{editingPlan ? "Update" : "Create"} Plan</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Plans Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id} className="border hover:shadow-lg transition-shadow">
              <CardHeader className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-semibold">{plan.label}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => handleViewCustomers(plan.id)}
                  >
                    <Users className="h-4 w-4" /> View Customers
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex-1 flex items-center gap-2 justify-center"
                      onClick={() => handleEdit(plan)}
                    >
                      <Edit className="h-4 w-4" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1 flex items-center gap-2 justify-center"
                      onClick={() => handleDelete(plan.id)}
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </Button>
                  </div>

                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 flex items-center gap-2 justify-center"
                      onClick={() => handleViewSlots(plan)}
                    >
                      <CalendarPlus className="h-4 w-4" /> View Slots
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1 flex items-center gap-2 justify-center"
                      onClick={() => {
                        setSelectedPlan(plan);
                        setAddSlotDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4" /> Add Slot
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Customers Dialog */}
        {selectedPlan && selectedPlan.customers && (
          <Dialog open={!!selectedPlan.customers.length} onOpenChange={() => setSelectedPlan(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Customers - {selectedPlan.label}</DialogTitle>
              </DialogHeader>
              <div className="mt-4 max-h-80 overflow-auto">
                <ul className="space-y-2">
                  {selectedPlan.customers.map((c) => (
                    <li
                      key={c.id}
                      className="flex justify-between border p-2 rounded hover:bg-gray-50 transition"
                    >
                      <span>{c.fullName}</span>
                      <span className="text-muted-foreground">{c.email}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <DialogFooter>
                <Button onClick={() => setSelectedPlan(null)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* View Delivery Slots Dialog */}
        {selectedPlan && (
          <Dialog open={viewSlotDialogOpen} onOpenChange={setViewSlotDialogOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Delivery Slots - {selectedPlan.label}</DialogTitle>
              </DialogHeader>
              <div className="mt-4 max-h-80 overflow-auto space-y-2">
                {selectedPlan.deliverySlots?.length ? (
                  selectedPlan.deliverySlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex justify-between border p-2 rounded"
                    >
                      <span>
                        {/* {slot.date} | */}
                         {slot.startTime}-{slot.endTime}
                         {/* Capacity:{" "} */}
                        {/* {slot.capacity} */}
                      </span>
                      <Badge variant={slot.isActive ? "default" : "secondary"}>
                        {slot.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No slots available.</p>
                )}
              </div>
              <DialogFooter>
                <Button onClick={() => setViewSlotDialogOpen(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Add Delivery Slot Dialog */}
        {selectedPlan && (
          <Dialog open={addSlotDialogOpen} onOpenChange={setAddSlotDialogOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Slot - {selectedPlan.label}</DialogTitle>
              </DialogHeader>
              <div className="mt-4 space-y-2">
                <div className="grid gap-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    name="date"
                    value={slotFormData.date}
                    onChange={handleSlotChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    name="startTime"
                    value={slotFormData.startTime}
                    onChange={handleSlotChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    name="endTime"
                    value={slotFormData.endTime}
                    onChange={handleSlotChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Capacity</Label>
                  <Input
                    type="number"
                    min={1}
                    name="capacity"
                    value={slotFormData.capacity}
                    onChange={handleSlotChange}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="checkbox"
                    name="isActive"
                    checked={slotFormData.isActive}
                    onChange={handleSlotChange}
                  />
                  <Label>Active</Label>
                </div>
                <Button onClick={handleAddSlot}>Add Slot</Button>
              </div>
              <DialogFooter>
                <Button onClick={() => setAddSlotDialogOpen(false)}>Cancel</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default Subscriptions;

// import { useEffect, useState } from "react";
// import axios from "axios";
// import { toast } from "sonner";
// import { Plus, Users, Edit, Trash2 } from "lucide-react";

// import { DashboardHeader } from "@/components/DashboardHeader";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";

// type Customer = {
//   id: number;
//   fullName: string;
//   email: string;
//   phone: string;
// };

// type DeliverySlot = {
//   id: number;
//   date: string;
//   startTime: string;
//   endTime: string;
//   capacity: number;
//   isActive: boolean;
// };

// type Plan = {
//   id: number;
//   label: string;
//   description: string;
//   vendor: any;
//   customers?: Customer[];
// };

// const Subscriptions = () => {
//   const [plans, setPlans] = useState<Plan[]>([]);
//   const [isLoading, setIsLoading] = useState(true);

//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
//   const [formData, setFormData] = useState({ label: "", description: "" });

//   const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
//   const [customerDialogOpen, setCustomerDialogOpen] = useState(false);

//   const [slotViewOpen, setSlotViewOpen] = useState(false);
//   const [slots, setSlots] = useState<DeliverySlot[]>([]);
//   const [slotLoading, setSlotLoading] = useState(false);
//   const [slotPlan, setSlotPlan] = useState<Plan | null>(null);

//   const role = localStorage.getItem("role");
//   const profileId = localStorage.getItem("profileId");

//   useEffect(() => {
//     fetchPlans();
//   }, []);

//   const fetchPlans = async () => {
//     setIsLoading(true);
//     let url = `http://localhost:3064/vendor-subscription-plans`;
//     if (role !== "Admin")
//       url = `http://localhost:3064/vendor-subscription-plans/vendor/${profileId}`;

//     try {
//       const response = await axios.get<Plan[]>(url);
//       setPlans(response.data);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to load plans");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setFormData({ label: "", description: "" });
//     setEditingPlan(null);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       if (editingPlan) {
//         await axios.patch(
//           `http://localhost:3064/vendor-subscription-plans/${editingPlan.id}`,
//           { ...formData, vendorId: Number(profileId) }
//         );
//         toast.success("Plan updated successfully");
//       } else {
//         await axios.post(
//           `http://localhost:3064/vendor-subscription-plans`,
//           { ...formData, vendorId: Number(profileId) }
//         );
//         toast.success("Plan created successfully");
//       }
//       fetchPlans();
//       setIsDialogOpen(false);
//       resetForm();
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to save plan");
//     }
//   };

//   const handleEdit = (plan: Plan) => {
//     setEditingPlan(plan);
//     setFormData({ label: plan.label, description: plan.description });
//     setIsDialogOpen(true);
//   };

//   const handleDelete = async (planId: number) => {
//     if (!confirm("Are you sure you want to delete this plan?")) return;
//     try {
//       await axios.delete(
//         `http://localhost:3064/vendor-subscription-plans/${planId}`
//       );
//       setPlans(plans.filter((p) => p.id !== planId));
//       toast.success("Plan deleted successfully");
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to delete plan");
//     }
//   };

//   const handleViewCustomers = async (planId: number) => {
//     try {
//       const response = await axios.get("http://localhost:3064/subscriptions");
//       const data = Array.isArray(response.data) ? response.data : [];

//       const planCustomers = data
//         .filter((sub: any) => sub.plan?.id === planId)
//         .map((sub: any) => sub.customer);

//       setPlans((prev) =>
//         prev.map((p) =>
//           p.id === planId ? { ...p, customers: planCustomers } : p
//         )
//       );

//       const plan = plans.find((p) => p.id === planId) || null;
//       setSelectedPlan(plan);
//       setCustomerDialogOpen(true);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to fetch customers");
//     }
//   };

//   const fetchSlotsByPlan = async (plan: Plan) => {
//     try {
//       setSlotLoading(true);
//       setSlotPlan(plan);
//       const res = await axios.get(
//         `http://localhost:3064/delivery-slots/vendor-subscription-plan/${plan.id}`
//       );
//       setSlots(res.data || []);
//       setSlotViewOpen(true);
//     } catch {
//       toast.error("Failed to load delivery slots");
//     } finally {
//       setSlotLoading(false);
//     }
//   };

//   return (
//     <div className="flex flex-col min-h-screen">
//       <DashboardHeader />
//       <div className="flex-1 space-y-6 p-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <h2 className="text-3xl font-bold tracking-tight">
//               Subscription Plans
//             </h2>
//             <p className="text-muted-foreground">
//               Manage plans and view active customers & delivery slots
//             </p>
//           </div>

//           {/* Create/Edit Dialog */}
//           <Dialog
//             open={isDialogOpen}
//             onOpenChange={(open) => {
//               setIsDialogOpen(open);
//               if (!open) resetForm();
//             }}
//           >
//             <DialogTrigger asChild>
//               <Button className="gap-2">
//                 <Plus className="h-4 w-4" /> Create Plan
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="max-w-lg">
//               <DialogHeader>
//                 <DialogTitle>
//                   {editingPlan ? "Edit Plan" : "Create Plan"}
//                 </DialogTitle>
//                 <DialogDescription>
//                   {editingPlan
//                     ? "Update plan details"
//                     : "Define a new subscription plan"}
//                 </DialogDescription>
//               </DialogHeader>

//               <form onSubmit={handleSubmit}>
//                 <div className="grid gap-4 py-4">
//                   <div className="grid gap-2">
//                     <Label htmlFor="label">Plan Name</Label>
//                     <Input
//                       id="label"
//                       value={formData.label}
//                       onChange={(e) =>
//                         setFormData({ ...formData, label: e.target.value })
//                       }
//                       placeholder="Plan Name"
//                       required
//                     />
//                   </div>
//                   <div className="grid gap-2">
//                     <Label htmlFor="description">Description</Label>
//                     <Textarea
//                       id="description"
//                       value={formData.description}
//                       onChange={(e) =>
//                         setFormData({ ...formData, description: e.target.value })
//                       }
//                       placeholder="Plan description"
//                       required
//                     />
//                   </div>
//                 </div>

//                 <DialogFooter>
//                   <Button
//                     type="button"
//                     variant="outline"
//                     onClick={() => setIsDialogOpen(false)}
//                   >
//                     Cancel
//                   </Button>
//                   <Button type="submit">
//                     {editingPlan ? "Update" : "Create"} Plan
//                   </Button>
//                 </DialogFooter>
//               </form>
//             </DialogContent>
//           </Dialog>
//         </div>

//         {/* Plans Grid */}
//         {isLoading ? (
//           <p>Loading...</p>
//         ) : (
//           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//             {plans.map((plan) => (
//               <Card
//                 key={plan.id}
//                 className="border hover:shadow-lg transition-shadow"
//               >
//                 <CardHeader className="flex justify-between items-start">
//                   <div>
//                     <CardTitle className="text-xl font-semibold">
//                       {plan.label}
//                     </CardTitle>
//                     <CardDescription className="text-muted-foreground">
//                       {plan.description}
//                     </CardDescription>
//                   </div>
//                 </CardHeader>

//                 <CardContent className="space-y-3">
//                   <div className="flex flex-col gap-2">
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       className="flex items-center gap-2"
//                       onClick={() => handleViewCustomers(plan.id)}
//                     >
//                       <Users className="h-4 w-4" /> View Customers
//                     </Button>

//                     <Button
//                       size="sm"
//                       variant="secondary"
//                       className="flex items-center gap-2"
//                       onClick={() => fetchSlotsByPlan(plan)}
//                     >
//                       📅 View Delivery Slots
//                     </Button>

//                     <div className="flex gap-2">
//                       <Button
//                         size="sm"
//                         variant="ghost"
//                         className="flex-1 flex items-center gap-2 justify-center"
//                         onClick={() => handleEdit(plan)}
//                       >
//                         <Edit className="h-4 w-4" /> Edit
//                       </Button>
//                       <Button
//                         size="sm"
//                         variant="destructive"
//                         className="flex-1 flex items-center gap-2 justify-center"
//                         onClick={() => handleDelete(plan.id)}
//                       >
//                         <Trash2 className="h-4 w-4" /> Delete
//                       </Button>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         )}

//         {/* Customers Dialog */}
//         {selectedPlan && (
//           <Dialog
//             open={customerDialogOpen}
//             onOpenChange={(open) => setCustomerDialogOpen(open)}
//           >
//             <DialogContent className="max-w-lg">
//               <DialogHeader>
//                 <DialogTitle>
//                   Customers – {selectedPlan.label}
//                 </DialogTitle>
//                 <DialogDescription>
//                   Active customers for this plan
//                 </DialogDescription>
//               </DialogHeader>
//               <div className="mt-4 max-h-80 overflow-auto">
//                 {selectedPlan.customers && selectedPlan.customers.length > 0 ? (
//                   <ul className="space-y-2">
//                     {selectedPlan.customers.map((c) => (
//                       <li
//                         key={c.id}
//                         className="flex justify-between border p-2 rounded hover:bg-gray-50 transition"
//                       >
//                         <span>{c.fullName}</span>
//                         <span className="text-muted-foreground">{c.email}</span>
//                       </li>
//                     ))}
//                   </ul>
//                 ) : (
//                   <p className="text-muted-foreground">
//                     No customers found for this plan.
//                   </p>
//                 )}
//               </div>
//               <DialogFooter>
//                 <Button onClick={() => setCustomerDialogOpen(false)}>Close</Button>
//               </DialogFooter>
//             </DialogContent>
//           </Dialog>
//         )}

//         {/* Delivery Slots Dialog */}
//         {slotPlan && (
//           <Dialog open={slotViewOpen} onOpenChange={setSlotViewOpen}>
//             <DialogContent className="max-w-lg">
//               <DialogHeader>
//                 <DialogTitle>Delivery Slots – {slotPlan.label}</DialogTitle>
//                 <DialogDescription>
//                   Available delivery slots for this plan
//                 </DialogDescription>
//               </DialogHeader>

//               {slotLoading ? (
//                 <p>Loading...</p>
//               ) : slots.length === 0 ? (
//                 <p className="text-muted-foreground">No slots found</p>
//               ) : (
//                 <div className="space-y-3 max-h-80 overflow-auto">
//                   {slots.map((slot) => (
//                     <div
//                       key={slot.id}
//                       className="border rounded p-3 flex justify-between items-center"
//                     >
//                       <div>
//                         <p className="font-medium">{slot.date}</p>
//                         <p className="text-sm text-muted-foreground">
//                           {slot.startTime} – {slot.endTime}
//                         </p>
//                         <p className="text-sm">Capacity: {slot.capacity}</p>
//                       </div>

//                       <span
//                         className={`px-2 py-1 rounded text-xs font-semibold ${
//                           slot.isActive
//                             ? "bg-green-100 text-green-700"
//                             : "bg-red-100 text-red-700"
//                         }`}
//                       >
//                         {slot.isActive ? "Active" : "Inactive"}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               )}

//               <DialogFooter>
//                 <Button onClick={() => setSlotViewOpen(false)}>Close</Button>
//               </DialogFooter>
//             </DialogContent>
//           </Dialog>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Subscriptions;

// import { useEffect, useState } from "react";
// import axios from "axios";
// import { toast } from "sonner";
// import { Plus, Users, Edit, Trash2 } from "lucide-react";

// import { DashboardHeader } from "@/components/DashboardHeader";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";

// /* ================= TYPES ================= */

// type Customer = {
//   id: number;
//   fullName: string;
//   email: string;
// };

// type Plan = {
//   id: number;
//   label: string;
//   description: string;
//   customers?: Customer[];
// };

// type DeliverySlotForm = {
//   date: string;
//   startTime: string;
//   endTime: string;
//   capacity: number;
//   isActive: boolean;
// };

// /* ================= COMPONENT ================= */

// const Subscriptions = () => {
//   const [plans, setPlans] = useState<Plan[]>([]);
//   const [isLoading, setIsLoading] = useState(true);

//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
//   const [formData, setFormData] = useState({ label: "", description: "" });

//   const [slotDialogOpen, setSlotDialogOpen] = useState(false);
//   const [slotPlan, setSlotPlan] = useState<Plan | null>(null);
//   const [slotForm, setSlotForm] = useState<DeliverySlotForm>({
//     date: "",
//     startTime: "",
//     endTime: "",
//     capacity: 10,
//     isActive: true,
//   });

//   const role = localStorage.getItem("role");
//   const profileId = localStorage.getItem("profileId");

//   /* ================= LOAD DATA ================= */

//   useEffect(() => {
//     fetchPlans();
//   }, []);

//   const fetchPlans = async () => {
//     setIsLoading(true);
//     let url = `http://localhost:3064/vendor-subscription-plans`;
//     if (role !== "Admin") {
//       url = `http://localhost:3064/vendor-subscription-plans/vendor/${profileId}`;
//     }

//     try {
//       const res = await axios.get<Plan[]>(url);
//       setPlans(res.data);
//     } catch {
//       toast.error("Failed to load plans");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   /* ================= PLAN CRUD ================= */

//   const resetForm = () => {
//     setFormData({ label: "", description: "" });
//     setEditingPlan(null);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     try {
//       if (editingPlan) {
//         await axios.patch(
//           `http://localhost:3064/vendor-subscription-plans/${editingPlan.id}`,
//           { ...formData, vendorId: Number(profileId) }
//         );
//         toast.success("Plan updated");
//       } else {
//         await axios.post(
//           `http://localhost:3064/vendor-subscription-plans`,
//           { ...formData, vendorId: Number(profileId) }
//         );
//         toast.success("Plan created");
//       }

//       fetchPlans();
//       setIsDialogOpen(false);
//       resetForm();
//     } catch {
//       toast.error("Failed to save plan");
//     }
//   };

//   const handleEdit = (plan: Plan) => {
//     setEditingPlan(plan);
//     setFormData({ label: plan.label, description: plan.description });
//     setIsDialogOpen(true);
//   };

//   const handleDelete = async (id: number) => {
//     if (!confirm("Delete this plan?")) return;

//     try {
//       await axios.delete(
//         `http://localhost:3064/vendor-subscription-plans/${id}`
//       );
//       setPlans((p) => p.filter((x) => x.id !== id));
//       toast.success("Plan deleted");
//     } catch {
//       toast.error("Delete failed");
//     }
//   };

//   /* ================= DELIVERY SLOT ================= */

//   const handleAddSlot = (plan: Plan) => {
//     setSlotPlan(plan);
//     setSlotForm({
//       date: "",
//       startTime: "",
//       endTime: "",
//       capacity: 10,
//       isActive: true,
//     });
//     setSlotDialogOpen(true);
//   };

//   const handleSlotSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!slotPlan) return;

//     try {
//       await axios.post("http://localhost:3064/delivery-slots", {
//         ...slotForm,
//         planId: slotPlan.id,
//         vendorId: Number(profileId),
//       });

//       toast.success("Delivery slot added");
//       setSlotDialogOpen(false);
//     } catch {
//       toast.error("Failed to add delivery slot");
//     }
//   };

//   /* ================= UI ================= */

//   return (
//     <div className="flex flex-col min-h-screen">
//       <DashboardHeader />

//       <div className="flex-1 space-y-6 p-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <h2 className="text-3xl font-bold">Subscription Plans</h2>
//             <p className="text-muted-foreground">
//               Manage plans & delivery slots
//             </p>
//           </div>

//           {/* CREATE PLAN */}
//           <Dialog
//             open={isDialogOpen}
//             onOpenChange={(open) => {
//               setIsDialogOpen(open);
//               if (!open) resetForm();
//             }}
//           >
//             <DialogTrigger asChild>
//               <Button className="gap-2">
//                 <Plus className="h-4 w-4" /> Create Plan
//               </Button>
//             </DialogTrigger>

//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>
//                   {editingPlan ? "Edit Plan" : "Create Plan"}
//                 </DialogTitle>
//                 <DialogDescription>
//                   Subscription plan details
//                 </DialogDescription>
//               </DialogHeader>

//               <form onSubmit={handleSubmit} className="space-y-4">
//                 <div>
//                   <Label>Plan Name</Label>
//                   <Input
//                     value={formData.label}
//                     onChange={(e) =>
//                       setFormData({ ...formData, label: e.target.value })
//                     }
//                     required
//                   />
//                 </div>

//                 <div>
//                   <Label>Description</Label>
//                   <Textarea
//                     value={formData.description}
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,
//                         description: e.target.value,
//                       })
//                     }
//                     required
//                   />
//                 </div>

//                 <DialogFooter>
//                   <Button type="submit">
//                     {editingPlan ? "Update" : "Create"}
//                   </Button>
//                 </DialogFooter>
//               </form>
//             </DialogContent>
//           </Dialog>
//         </div>

//         {/* PLANS */}
//         {isLoading ? (
//           <p>Loading...</p>
//         ) : (
//           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//             {plans.map((plan) => (
//               <Card key={plan.id}>
//                 <CardHeader>
//                   <CardTitle>{plan.label}</CardTitle>
//                   <CardDescription>{plan.description}</CardDescription>
//                 </CardHeader>

//                 <CardContent className="space-y-2">
//                   <Button
//                     size="sm"
//                     variant="secondary"
//                     onClick={() => handleAddSlot(plan)}
//                   >
//                     ➕ Add Delivery Slot
//                   </Button>

//                   <div className="flex gap-2">
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       onClick={() => handleEdit(plan)}
//                     >
//                       <Edit className="h-4 w-4" />
//                     </Button>

//                     <Button
//                       size="sm"
//                       variant="destructive"
//                       onClick={() => handleDelete(plan.id)}
//                     >
//                       <Trash2 className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* DELIVERY SLOT DIALOG */}
//       <Dialog open={slotDialogOpen} onOpenChange={setSlotDialogOpen}>
//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle>Add Delivery Slot</DialogTitle>
//             <DialogDescription>{slotPlan?.label}</DialogDescription>
//           </DialogHeader>

//           <form onSubmit={handleSlotSubmit} className="space-y-4">
//             <div>
//               <Label>Date</Label>
//               <Input
//                 type="date"
//                 value={slotForm.date}
//                 onChange={(e) =>
//                   setSlotForm({ ...slotForm, date: e.target.value })
//                 }
//                 required
//               />
//             </div>

//             <div>
//               <Label>Start Time</Label>
//               <Input
//                 type="time"
//                 value={slotForm.startTime}
//                 onChange={(e) =>
//                   setSlotForm({ ...slotForm, startTime: e.target.value })
//                 }
//                 required
//               />
//             </div>

//             <div>
//               <Label>End Time</Label>
//               <Input
//                 type="time"
//                 value={slotForm.endTime}
//                 onChange={(e) =>
//                   setSlotForm({ ...slotForm, endTime: e.target.value })
//                 }
//                 required
//               />
//             </div>

//             <div>
//               <Label>Capacity</Label>
//               <Input
//                 type="number"
//                 min={1}
//                 value={slotForm.capacity}
//                 onChange={(e) =>
//                   setSlotForm({
//                     ...slotForm,
//                     capacity: Number(e.target.value),
//                   })
//                 }
//                 required
//               />
//             </div>

//             <DialogFooter>
//               <Button type="submit">Save Slot</Button>
//             </DialogFooter>
//           </form>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// export default Subscriptions;

// import { useEffect, useState } from "react";
// import axios from "axios";
// import { toast } from "sonner";
// import { Plus, Users, Edit, Trash2 } from "lucide-react";

// import { DashboardHeader } from "@/components/DashboardHeader";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Badge } from "@/components/ui/badge";

// type Customer = {
//   id: number;
//   fullName: string;
//   email: string;
//   phone: string;
// };

// type Plan = {
//   id: number;
//   label: string;
//   description: string;
//   vendor: any;
//   customers?: Customer[];
// };

// const Subscriptions = () => {
//   const [plans, setPlans] = useState<Plan[]>([]);
//   const [isLoading, setIsLoading] = useState(true);

//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
//   const [formData, setFormData] = useState({ label: "", description: "" });

//   const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
//   const [customerDialogOpen, setCustomerDialogOpen] = useState(false);

//     const role = localStorage.getItem("role");
//     const profileId = localStorage.getItem("profileId");

//   useEffect(() => {
//     fetchPlans();
//   }, []);

//   const fetchPlans = async () => {
//     setIsLoading(true);
//     let url = `http://localhost:3064/vendor-subscription-plans`;
//             if (role != "Admin") url = `http://localhost:3064/vendor-subscription-plans/vendor/${profileId}`;

//     try {
//       const response = await axios.get<Plan[]>(url
//       );
//       setPlans(response.data);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to load plans");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setFormData({ label: "", description: "" });
//     setEditingPlan(null);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       if (editingPlan) {
//         await axios.patch(
//           `http://localhost:3064/vendor-subscription-plans/${editingPlan.id}`,
//           {...formData,vendorId: Number(profileId)}
//         );
//         toast.success("Plan updated successfully");
//       } else {
//         await axios.post(
//           `http://localhost:3064/vendor-subscription-plans`,
//           {...formData,vendorId: Number(profileId)}
//         );
//         toast.success("Plan created successfully");
//       }
//       fetchPlans();
//       setIsDialogOpen(false);
//       resetForm();
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to save plan");
//     }
//   };

//   const handleEdit = (plan: Plan) => {
//     setEditingPlan(plan);
//     setFormData({ label: plan.label, description: plan.description });
//     setIsDialogOpen(true);
//   };

//   const handleDelete = async (planId: number) => {
//     if (!confirm("Are you sure you want to delete this plan?")) return;
//     try {
//       await axios.delete(`http://localhost:3064/vendor-subscription-plans/${planId}`);
//       setPlans(plans.filter((p) => p.id !== planId));
//       toast.success("Plan deleted successfully");
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to delete plan");
//     }
//   };

//   const handleViewCustomers = async (planId: number) => {
//     try {
//       const response = await axios.get("http://localhost:3064/subscriptions");
//       const data = Array.isArray(response.data) ? response.data : [];

//       const planCustomers = data
//         .filter((sub: any) => sub.plan?.id === planId)
//         .map((sub: any) => sub.customer);

//       setPlans((prev) =>
//         prev.map((p) => (p.id === planId ? { ...p, customers: planCustomers } : p))
//       );
//       setCustomerDialogOpen(true);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to fetch customers");
//     }
//   };

//   return (
//     <div className="flex flex-col min-h-screen">
//       <DashboardHeader />
//       <div className="flex-1 space-y-6 p-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <h2 className="text-3xl font-bold tracking-tight">Subscription Plans</h2>
//             <p className="text-muted-foreground">Manage plans and view active customers</p>
//           </div>

//           {/* Create/Edit Dialog */}
//           <Dialog
//             open={isDialogOpen}
//             onOpenChange={(open) => {
//               setIsDialogOpen(open);
//               if (!open) resetForm();
//             }}
//           >
//             <DialogTrigger asChild>
//               <Button className="gap-2">
//                 <Plus className="h-4 w-4" /> Create Plan
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="max-w-lg">
//               <DialogHeader>
//                 <DialogTitle>{editingPlan ? "Edit Plan" : "Create Plan"}</DialogTitle>
//                 <DialogDescription>
//                   {editingPlan ? "Update plan details" : "Define a new subscription plan"}
//                 </DialogDescription>
//               </DialogHeader>

//               <form onSubmit={handleSubmit}>
//                 <div className="grid gap-4 py-4">
//                   <div className="grid gap-2">
//                     <Label htmlFor="label">Plan Name</Label>
//                     <Input
//                       id="label"
//                       value={formData.label}
//                       onChange={(e) => setFormData({ ...formData, label: e.target.value })}
//                       placeholder="Plan Name"
//                       required
//                     />
//                   </div>
//                   <div className="grid gap-2">
//                     <Label htmlFor="description">Description</Label>
//                     <Textarea
//                       id="description"
//                       value={formData.description}
//                       onChange={(e) =>
//                         setFormData({ ...formData, description: e.target.value })
//                       }
//                       placeholder="Plan description"
//                       required
//                     />
//                   </div>
//                 </div>

//                 <DialogFooter>
//                   <Button
//                     type="button"
//                     variant="outline"
//                     onClick={() => setIsDialogOpen(false)}
//                   >
//                     Cancel
//                   </Button>
//                   <Button type="submit">{editingPlan ? "Update" : "Create"} Plan</Button>
//                 </DialogFooter>
//               </form>
//             </DialogContent>
//           </Dialog>
//         </div>

//         {/* Plans Grid */}
//         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//           {plans.map((plan) => (
//             <Card key={plan.id} className="border hover:shadow-lg transition-shadow">
//               <CardHeader className="flex justify-between items-start">
//                 <div>
//                   <CardTitle className="text-xl font-semibold">{plan.label}</CardTitle>
//                   <CardDescription className="text-muted-foreground">
//                     {plan.description}
//                   </CardDescription>
//                 </div>
//               </CardHeader>

//               <CardContent className="space-y-3">
//                 <div className="flex flex-col gap-2">
//                   <Button
//                     size="sm"
//                     variant="outline"
//                     className="flex items-center gap-2"
//                     onClick={() => handleViewCustomers(plan.id)}
//                   >
//                     <Users className="h-4 w-4" /> View Customers
//                   </Button>

//                   <div className="flex gap-2">
//                     <Button
//                       size="sm"
//                       variant="ghost"
//                       className="flex-1 flex items-center gap-2 justify-center"
//                       onClick={() => handleEdit(plan)}
//                     >
//                       <Edit className="h-4 w-4" /> Edit
//                     </Button>
//                     <Button
//                       size="sm"
//                       variant="destructive"
//                       className="flex-1 flex items-center gap-2 justify-center"
//                       onClick={() => handleDelete(plan.id)}
//                     >
//                       <Trash2 className="h-4 w-4" /> Delete
//                     </Button>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>

//         {/* Customers Dialog */}
//         {selectedPlan && (
//           <Dialog
//             open={customerDialogOpen}
//             onOpenChange={(open) => setCustomerDialogOpen(open)}
//           >
//             <DialogContent className="max-w-lg">
//               <DialogHeader>
//                 <DialogTitle>Customers - {selectedPlan.label}</DialogTitle>
//                 <DialogDescription>Active customers for this plan</DialogDescription>
//               </DialogHeader>
//               <div className="mt-4 max-h-80 overflow-auto">
//                 {selectedPlan.customers && selectedPlan.customers.length > 0 ? (
//                   <ul className="space-y-2">
//                     {selectedPlan.customers.map((c) => (
//                       <li
//                         key={c.id}
//                         className="flex justify-between border p-2 rounded hover:bg-gray-50 transition"
//                       >
//                         <span>{c.fullName}</span>
//                         <span className="text-muted-foreground">{c.email}</span>
//                       </li>
//                     ))}
//                   </ul>
//                 ) : (
//                   <p className="text-muted-foreground">No customers found for this plan.</p>
//                 )}
//               </div>
//               <DialogFooter>
//                 <Button onClick={() => setCustomerDialogOpen(false)}>Close</Button>
//               </DialogFooter>
//             </DialogContent>
//           </Dialog>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Subscriptions;

// import { useState } from "react";
// import { DashboardHeader } from "@/components/DashboardHeader";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Badge } from "@/components/ui/badge";
// import { Plus, Calendar, Package, Users, Edit } from "lucide-react";
// import { toast } from "sonner";

// type SubscriptionPlan = {
//   id: string;
//   name: string;
//   description: string;
//   type: "Daily" | "Weekly" | "Monthly";
//   price: number;
//   products: string[];
//   activeUsers: number;
// };

// const Subscriptions = () => {
//   const [plans, setPlans] = useState<SubscriptionPlan[]>([
//     {
//       id: "1",
//       name: "Daily Essentials",
//       description: "Fresh milk and bread delivered every morning",
//       type: "Daily",
//       price: 100,
//       products: ["Fresh Milk (1L)", "Brown Bread (1 piece)"],
//       activeUsers: 45,
//     },
//     {
//       id: "2",
//       name: "Weekly Fresh Box",
//       description: "Complete grocery essentials delivered weekly",
//       type: "Weekly",
//       price: 650,
//       products: ["Fresh Milk (7L)", "Brown Bread (7 pieces)", "Organic Apples (2kg)", "Fresh Vegetables (3kg)"],
//       activeUsers: 32,
//     },
//     {
//       id: "3",
//       name: "Monthly Premium",
//       description: "Premium monthly subscription with all essentials",
//       type: "Monthly",
//       price: 2400,
//       products: ["Fresh Milk (30L)", "Brown Bread (30 pieces)", "Fresh Fruits (8kg)", "Fresh Vegetables (12kg)", "Dairy Products Bundle"],
//       activeUsers: 28,
//     },
//   ]);

//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
//   const [formData, setFormData] = useState({
//     name: "",
//     description: "",
//     type: "Daily" as "Daily" | "Weekly" | "Monthly",
//     price: "",
//     products: "",
//   });

//   const resetForm = () => {
//     setFormData({
//       name: "",
//       description: "",
//       type: "Daily",
//       price: "",
//       products: "",
//     });
//     setEditingPlan(null);
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
    
//     const productsArray = formData.products.split(',').map(p => p.trim()).filter(p => p);
    
//     if (editingPlan) {
//       setPlans(plans.map(p => 
//         p.id === editingPlan.id 
//           ? { ...p, ...formData, price: parseFloat(formData.price), products: productsArray }
//           : p
//       ));
//       toast.success("Subscription plan updated successfully");
//     } else {
//       const newPlan: SubscriptionPlan = {
//         id: Date.now().toString(),
//         ...formData,
//         price: parseFloat(formData.price),
//         products: productsArray,
//         activeUsers: 0,
//       };
//       setPlans([...plans, newPlan]);
//       toast.success("Subscription plan created successfully");
//     }
    
//     setIsDialogOpen(false);
//     resetForm();
//   };

//   const handleEdit = (plan: SubscriptionPlan) => {
//     setEditingPlan(plan);
//     setFormData({
//       name: plan.name,
//       description: plan.description,
//       type: plan.type,
//       price: plan.price.toString(),
//       products: plan.products.join(', '),
//     });
//     setIsDialogOpen(true);
//   };

//   const getTypeBadgeColor = (type: string) => {
//     switch (type) {
//       case "Daily": return "bg-success text-white";
//       case "Weekly": return "bg-info text-white";
//       case "Monthly": return "bg-primary text-primary-foreground";
//       default: return "";
//     }
//   };

//   return (
//     <div className="flex flex-col min-h-screen">
//       <DashboardHeader />
//       <div className="flex-1 space-y-6 p-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <h2 className="text-3xl font-bold tracking-tight">Subscriptions</h2>
//             <p className="text-muted-foreground">Manage subscription plans and pricing</p>
//           </div>
//           <Dialog open={isDialogOpen} onOpenChange={(open) => {
//             setIsDialogOpen(open);
//             if (!open) resetForm();
//           }}>
//             <DialogTrigger asChild>
//               <Button className="gap-2">
//                 <Plus className="h-4 w-4" />
//                 Create Plan
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="max-w-2xl">
//               <DialogHeader>
//                 <DialogTitle>{editingPlan ? "Edit Plan" : "Create Subscription Plan"}</DialogTitle>
//                 <DialogDescription>
//                   {editingPlan ? "Update plan details" : "Define a new subscription plan"}
//                 </DialogDescription>
//               </DialogHeader>
//               <form onSubmit={handleSubmit}>
//                 <div className="grid gap-4 py-4">
//                   <div className="grid gap-2">
//                     <Label htmlFor="name">Plan Name</Label>
//                     <Input
//                       id="name"
//                       value={formData.name}
//                       onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                       placeholder="e.g., Daily Essentials"
//                       required
//                     />
//                   </div>
//                   <div className="grid gap-2">
//                     <Label htmlFor="description">Description</Label>
//                     <Textarea
//                       id="description"
//                       value={formData.description}
//                       onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                       placeholder="Plan description"
//                       required
//                     />
//                   </div>
//                   <div className="grid grid-cols-2 gap-4">
//                     {/* <div className="grid gap-2">
//                       <Label htmlFor="type">Plan Type</Label>
//                       <select
//                         id="type"
//                         value={formData.type}
//                         onChange={(e) => setFormData({ ...formData, type: e.target.value as "Daily" | "Weekly" | "Monthly" })}
//                         className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
//                         required
//                       >
//                         <option value="Daily">Daily</option>
//                         <option value="Weekly">Weekly</option>
//                         <option value="Monthly">Monthly</option>
//                       </select>
//                     </div> */}
//                     {/* <div className="grid gap-2">
//                       <Label htmlFor="price">Price (₹)</Label>
//                       <Input
//                         id="price"
//                         type="number"
//                         step="0.01"
//                         value={formData.price}
//                         onChange={(e) => setFormData({ ...formData, price: e.target.value })}
//                         placeholder="0.00"
//                         required
//                       />
//                     </div> */}
//                   </div>
//                   <div className="grid gap-2">
//                     <Label htmlFor="products">Products (comma-separated)</Label>
//                     <Textarea
//                       id="products"
//                       value={formData.products}
//                       onChange={(e) => setFormData({ ...formData, products: e.target.value })}
//                       placeholder="Fresh Milk (1L), Brown Bread (1 piece)"
//                       required
//                     />
//                     <p className="text-xs text-muted-foreground">
//                       Enter product names separated by commas
//                     </p>
//                   </div>
//                 </div>
//                 <DialogFooter>
//                   <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
//                     Cancel
//                   </Button>
//                   <Button type="submit">{editingPlan ? "Update" : "Create"} Plan</Button>
//                 </DialogFooter>
//               </form>
//             </DialogContent>
//           </Dialog>
//         </div>

//         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//           {plans.map((plan) => (
//             <Card key={plan.id} className="relative">
//               <CardHeader>
//                 <div className="flex items-start justify-between">
//                   <div className="space-y-1">
//                     <CardTitle className="text-xl">{plan.name}</CardTitle>
//                     <Badge className={getTypeBadgeColor(plan.type)}>
//                       {plan.type}
//                     </Badge>
//                   </div>
//                   <Button variant="ghost" size="icon" onClick={() => handleEdit(plan)}>
//                     <Edit className="h-4 w-4" />
//                   </Button>
//                 </div>
//                 <CardDescription className="pt-2">{plan.description}</CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 {/* <div className="flex items-baseline gap-2">
//                   <span className="text-3xl font-bold">₹{plan.price}</span>
//                   <span className="text-sm text-muted-foreground">/ {plan.type.toLowerCase()}</span>
//                 </div> */}
                
//                 <div className="space-y-2 pt-4 border-t">
//                   <div className="flex items-center gap-2 text-sm text-muted-foreground">
//                     <Package className="h-4 w-4" />
//                     <span className="font-medium">{plan.products.length} Products Included</span>
//                   </div>
//                   <ul className="space-y-1 pl-6">
//                     {plan.products.map((product, idx) => (
//                       <li key={idx} className={`text-sm text-foreground list-disc ${""}`}>
//                         {product}
//                       </li>
//                     ))}
//                   </ul>
//                 </div>

//                 <div className="pt-4 border-t">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-2 text-sm">
//                       <Users className="h-4 w-4 text-muted-foreground" />
//                       <span className="text-muted-foreground">Active Users</span>
//                     </div>
//                     <Badge variant="secondary">{plan.activeUsers}</Badge>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Subscriptions;

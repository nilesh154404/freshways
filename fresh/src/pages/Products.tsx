"use client";
import { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { log } from "console";

const API_BASE = "http://localhost:3064";

type Product = {
  id: number;
  label: string;
  description: string;
  productUrl: string;
  measurementUnit: string;
  measurementValue: string;
  serviceOffering: any;
  discounts?: any;
  vendor: any;
  category: any;
  dailyPrices?: any[];
  vendorSubscriptionPlan?: any;
};

type Vendor = { id: number; businessName: string };
type ServiceOffering = { serviceCode: string; serviceName: string };
type Category = { id: number; label: string };

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [services, setServices] = useState<ServiceOffering[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false);
  const [discountProduct, setDiscountProduct] = useState<Product | null>(null);
  const [discountForm, setDiscountForm] = useState({
    type: "PERCENTAGE", // PERCENTAGE | FLAT | BOGO
    value: 0,
    buyQuantity: 0,
    getQuantity: 0,
    minCartQuantity: 1,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    isActive: true,
  });
  const handleConfigureDiscount = (product: Product) => {
    setDiscountProduct(product);
    // If product has discounts, populate first one
    const existing = product.discounts?.[0];
    setDiscountForm({
      type: existing?.type || "PERCENTAGE",
      value: existing?.value || 0,
      buyQuantity: existing?.buyQuantity || 0,
      getQuantity: existing?.getQuantity || 0,
      minCartQuantity: existing?.minCartQuantity || 1,
      startDate: existing?.startDate?.split("T")[0] || new Date().toISOString().split("T")[0],
      endDate: existing?.endDate?.split("T")[0] || new Date().toISOString().split("T")[0],
      isActive: existing?.isActive ?? true,
    });
    setIsDiscountDialogOpen(true);
  };

  const handleDiscountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discountProduct) return;

    try {
      const payload = {
        ...discountForm,
        value: Number(discountForm.value),
        buyQuantity: Number(discountForm.buyQuantity),
        getQuantity: Number(discountForm.getQuantity),
        minCartQuantity: Number(discountForm.minCartQuantity),
        productId: discountProduct.id,
      };

      await axios.post(`http://localhost:3064/product-discount`, payload);
      toast.success("Discount configured successfully");
      setIsDiscountDialogOpen(false);
      getProducts(); // refresh products to reflect discount
    } catch (err) {
      console.error(err);
      toast.error("Failed to save discount");
    }
  };


  const [formData, setFormData] = useState<any>({
    label: "",
    description: "",
    measurementUnit: "KG",
    measurementValue: "",
    serviceOfferingCode: "",
    vendorId: "",
    vendorSubscriptionPlanId: "",
    categoryId: "",
    productUrl: "",
  });

  // -----------------------------
  // Price Dialog
  // -----------------------------
  const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false);
  const [priceProduct, setPriceProduct] = useState<Product | null>(null);
  const [priceForm, setPriceForm] = useState({
    amount: "",
    mrp_amount: "",
    date: new Date().toISOString().split("T")[0],
    isActive: true,
    vendorId: "",
  });
  const role = localStorage.getItem("role");
  const profileId = localStorage.getItem("profileId");

  console.log({ role, profileId });

  // -----------------------------
  // FETCH DATA
  // -----------------------------
  const getProducts = async () => {
    let url = `${API_BASE}/products?page=1&limit=500`;
    if (role != "Admin") url += `&vendorId=` + profileId;
    try {
      const res = await axios.get(url);
      setProducts(res.data.items || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch products");
    }
  };

  const getVendors = async () => {
    try {
      const res = await axios.get(`${API_BASE}/vendors`);
      setVendors(res.data || []);
    } catch (err) { console.error(err); }
  };

  const getServices = async () => {
    try {
      const res = await axios.get(`${API_BASE}/service-offerings`);
      setServices(res.data || []);
    } catch (err) { console.error(err); }
  };

  const getCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE}/categories/get-categories`);
      setCategories(res.data || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    getProducts();
    getVendors();
    getServices();
    getCategories();
  }, []);

  const resetForm = () => {
    setFormData({
      label: "",
      description: "",
      measurementUnit: "KG",
      measurementValue: "",
      serviceOfferingCode: "",
      vendorId: "",
      vendorSubscriptionPlanId: "",
      categoryId: "",
      productUrl: "",
    });
    setImageFile(null);
    setEditingProduct(null);
  };

  // -----------------------------
  // IMAGE UPLOAD
  // -----------------------------
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const data = new FormData();
    data.append("file", file);

    try {
      setUploading(true);
      const response = await axios.post<{ fileUrl: string }>(
        `${API_BASE}/files/upload`,
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setFormData({ ...formData, productUrl: response.data.fileUrl });
      toast.success("Image uploaded successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  // -----------------------------
  // CREATE / UPDATE PRODUCT
  // -----------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload: any = { ...formData };
      payload.vendorSubscriptionPlanId =
        payload.vendorSubscriptionPlanId
          ? Number(payload.vendorSubscriptionPlanId)
          : undefined;
      if (role != "Admin") {
        payload.vendorId = Number(profileId);
      } else {
        payload.vendorId = Number(formData.vendorId);
      }
      payload.categoryId = Number(formData.categoryId);
      if (editingProduct) {
        await axios.patch(`${API_BASE}/products/${editingProduct.id}`, payload);
        toast.success("Product updated");
      } else {
        await axios.post(`${API_BASE}/products`, payload);
        toast.success("Product created");
      }

      setIsDialogOpen(false);
      resetForm();
      getProducts();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save product");
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      label: product.label,
      description: product.description,
      measurementUnit: product.measurementUnit,
      measurementValue: product.measurementValue,
      serviceOfferingCode: product.serviceOffering?.serviceCode || "",
      vendorId: product.vendor?.id || "",
      vendorSubscriptionPlanId: product.vendorSubscriptionPlan?.id?.toString() || "",
      categoryId: product.category?.id?.toString() || "",
      productUrl: product.productUrl || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`${API_BASE}/products/${id}`);
      toast.success("Product deleted");
      getProducts();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete product");
    }
  };

  // -----------------------------
  // CONFIGURE PRICE
  // -----------------------------
  const handleConfigurePrice = (product: Product) => {
    setPriceProduct(product);
    setPriceForm({
      amount: product.dailyPrices?.[0]?.amount ? String(product.dailyPrices[0].amount) : "",
      mrp_amount: product.dailyPrices?.[0]?.mrp_amount ? String(product.dailyPrices[0].mrp_amount) : "",
      date: product.dailyPrices?.[0]?.date?.split("T")[0] || new Date().toISOString().split("T")[0],
      isActive: product.dailyPrices?.[0]?.isActive ?? true,
      vendorId: role === "Admin" ? (product.vendor?.id?.toString() || "") : (profileId || ""),
    });
    setIsPriceDialogOpen(true);
  };

  const handlePriceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!priceProduct) return;

    try {
      const payload = {
        amount: priceForm.amount ? Number(priceForm.amount) : 0,
        mrp_amount: priceForm.mrp_amount ? Number(priceForm.mrp_amount) : 0,
        date: priceForm.date,
        isActive: priceForm.isActive,
        productId: priceProduct.id,
        vendorId: Number(priceForm.vendorId),
      };

      await axios.post(`${API_BASE}/daily-price`, payload);
      toast.success("Price saved successfully");
      
      setIsPriceDialogOpen(false);
      getProducts();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save price");
    }
  };

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      <div className="flex-1 space-y-6 p-6">
        {/* Header + Add Product */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Products</h2>
            <p className="text-muted-foreground">Manage your product inventory</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(o) => { setIsDialogOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Product Name</Label>
                  <Input
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Measurement Unit</Label>
                  <Select
                    value={formData.measurementUnit}
                    onValueChange={(v) => setFormData({ ...formData, measurementUnit: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KG">KG</SelectItem>
                      <SelectItem value="GM">GM</SelectItem>
                      <SelectItem value="LITRE">LITRE</SelectItem>
                      <SelectItem value="ML">ML</SelectItem>
                      <SelectItem value="MONTH">MONTH</SelectItem>
                      <SelectItem value="NUMBER">NUMBER</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Measurement Value</Label>
                  <Input
                    type="text"
                    value={formData.measurementValue}
                    onChange={(e) => setFormData({ ...formData, measurementValue: e.target.value })}
                    required
                  />
                </div>

                {/* <div className="grid gap-2">
                  <Label>Service Offering</Label>
                  <Select
                    value={formData.serviceOfferingCode}
                    onValueChange={(v) => setFormData({ ...formData, serviceOfferingCode: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {services.map((s) => (
                        <SelectItem key={s.serviceCode} value={s.serviceCode}>
                          {s.serviceName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div> */}
                {role == "Admin" && (
                  <div className="grid gap-2">
                    <Label>Vendor</Label>
                    <Select
                      value={formData.vendorId}
                      onValueChange={(v) => setFormData({ ...formData, vendorId: v })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {vendors.map((v) => (
                          <SelectItem key={v.id} value={v.id.toString()}>
                            {v.businessName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>)}

                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(v) => setFormData({ ...formData, categoryId: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Product Image</Label>
                  <Input
                    type="text"
                    value={formData.productUrl}
                    onChange={(e) => setFormData({ ...formData, productUrl: e.target.value })}
                    placeholder="Paste image URL or upload below"
                  />
                  <input type="file" accept="image/*" onChange={handleFileUpload} />
                  {uploading && <p>Uploading...</p>}
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">{editingProduct ? "Update" : "Add"} Product</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Product Inventory</CardTitle>
            <CardDescription>List of all products</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell><img src={p.productUrl} className="h-10 w-10 rounded" /></TableCell>
                    <TableCell>{p.label}</TableCell>
                    <TableCell className="max-w-xs truncate">{p.description}</TableCell>
                    <TableCell>{p.measurementValue} {p.measurementUnit}</TableCell>
                    <TableCell>{p.dailyPrices[0]?.amount}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        <Button variant="outline" size="sm" onClick={() => handleConfigurePrice(p)}>Configure Price</Button>
                        <Button variant="outline" size="sm" onClick={() => handleConfigureDiscount(p)}>
                          Configure Discount
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Price Dialog */}
        <Dialog open={isPriceDialogOpen} onOpenChange={(o) => setIsPriceDialogOpen(o)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Configure Price for {priceProduct?.label}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handlePriceSubmit} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Amount</Label>
                <Input type="number" value={priceForm.amount} onChange={(e) => setPriceForm({ ...priceForm, amount: e.target.value })} placeholder="Enter amount" required />
              </div>

              <div className="grid gap-2">
                <Label>MRP Amount</Label>
                <Input type="number" step="0.01" value={priceForm.mrp_amount} onChange={(e) => setPriceForm({ ...priceForm, mrp_amount: e.target.value })} placeholder="Enter MRP amount" required />
              </div>

              <div className="grid gap-2">
                <Label>Date</Label>
                <Input type="date" value={priceForm.date} onChange={(e) => setPriceForm({ ...priceForm, date: e.target.value })} required />
              </div>

              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={priceForm.isActive ? "true" : "false"} onValueChange={(v) => setPriceForm({ ...priceForm, isActive: v === "true" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Vendor</Label>
                <Select value={priceForm.vendorId} onValueChange={(v) => setPriceForm({ ...priceForm, vendorId: v })} disabled={role !== "Admin"}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {vendors.map((v) => <SelectItem key={v.id} value={v.id.toString()}>{v.businessName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsPriceDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Save Price</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>


        <Dialog open={isDiscountDialogOpen} onOpenChange={setIsDiscountDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Configure Discount for {discountProduct?.label}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleDiscountSubmit} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Discount Type</Label>
                <Select
                  value={discountForm.type}
                  onValueChange={(v) => setDiscountForm({ ...discountForm, type: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                    <SelectItem value="FLAT">Flat</SelectItem>
                    <SelectItem value="BOGO">BOGO</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(discountForm.type === "PERCENTAGE" || discountForm.type === "FLAT") && (
                <div className="grid gap-2">
                  <Label>Value</Label>
                  <Input
                    type="number"
                    value={discountForm.value}
                    onChange={(e) => setDiscountForm({ ...discountForm, value: Number(e.target.value) })}
                    required
                  />
                </div>
              )}

              {discountForm.type === "BOGO" && (
                <>
                  <div className="grid gap-2">
                    <Label>Buy Quantity</Label>
                    <Input
                      type="number"
                      value={discountForm.buyQuantity}
                      onChange={(e) => setDiscountForm({ ...discountForm, buyQuantity: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Get Quantity</Label>
                    <Input
                      type="number"
                      value={discountForm.getQuantity}
                      onChange={(e) => setDiscountForm({ ...discountForm, getQuantity: Number(e.target.value) })}
                      required
                    />
                  </div>
                </>
              )}

              <div className="grid gap-2">
                <Label>Minimum Cart Quantity</Label>
                <Input
                  type="number"
                  value={discountForm.minCartQuantity}
                  onChange={(e) => setDiscountForm({ ...discountForm, minCartQuantity: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label>Start Date</Label>
                <Input type="date" value={discountForm.startDate} onChange={(e) => setDiscountForm({ ...discountForm, startDate: e.target.value })} required />
              </div>

              <div className="grid gap-2">
                <Label>End Date</Label>
                <Input type="date" value={discountForm.endDate} onChange={(e) => setDiscountForm({ ...discountForm, endDate: e.target.value })} required />
              </div>

              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={discountForm.isActive ? "true" : "false"} onValueChange={(v) => setDiscountForm({ ...discountForm, isActive: v === "true" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDiscountDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Save Discount</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

export default Products;


// import { useState, useEffect, ChangeEvent } from "react";
// import { DashboardHeader } from "@/components/DashboardHeader";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Textarea } from "@/components/ui/textarea";
// import { Plus, Pencil, Trash2 } from "lucide-react";
// import { toast } from "sonner";
// import axios from "axios";

// type Product = {
//   id: number;
//   label: string;
//   description: string;
//   productUrl: string;
//   measurementUnit: string;
//   measurementValue: string;
//   serviceOffering: any;
//   vendor?: any;
//   category?: any;
//   vendorSubscriptionPlan?: any;
// };

// const API_BASE = "http://localhost:3064";

// const Products = () => {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [editingProduct, setEditingProduct] = useState<Product | null>(null);
//   const [imageFile, setImageFile] = useState<File | null>(null);
//   const [uploading, setUploading] = useState(false);

//   const [services, setServices] = useState<any[]>([]);
//   const [vendors, setVendors] = useState<any[]>([]);
//   const [categories, setCategories] = useState<any[]>([]);

//   const [formData, setFormData] = useState({
//     label: "",
//     description: "",
//     productUrl: "",
//     measurementUnit: "KG",
//     measurementValue: "",
//     serviceOfferingId: "",
//     vendorId: "",
//     categoryId: "",
//   });

//   // -----------------------------
//   // FETCH PRODUCTS AND DROPDOWNS
//   // -----------------------------
//   const getProducts = async () => {
//     try {
//       const res = await axios.get(`${API_BASE}/products?page=1&limit=10`);
//       setProducts(res.data.items || []);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to load products");
//     }
//   };

//   const getDropdownData = async () => {
//     try {
//       const [svcRes, vendorRes, catRes] = await Promise.all([
//         axios.get(`${API_BASE}/service-offerings`),
//         axios.get(`${API_BASE}/vendors`),
//         axios.get(`${API_BASE}/categories/get-categories`)
//       ]);
//       setServices(svcRes.data);
//       setVendors(vendorRes.data);
//       setCategories(catRes.data);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to load dropdown data");
//     }
//   };

//   useEffect(() => {
//     getProducts();
//     getDropdownData();
//   }, []);

//   const resetForm = () => {
//     setFormData({
//       label: "",
//       description: "",
//       productUrl: "",
//       measurementUnit: "KG",
//       measurementValue: "",
//       serviceOfferingId: "",
//       vendorId: "",
//       categoryId: "",
//     });
//     setImageFile(null);
//     setEditingProduct(null);
//   };

//   // -----------------------------
//   // IMAGE UPLOAD FUNCTION
//   // -----------------------------
//   const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files || e.target.files.length === 0) return;
//     const file = e.target.files[0];
//     const data = new FormData();
//     data.append("file", file);

//     try {
//       setUploading(true);
//       const response = await axios.post<{ fileUrl: string }>(
//         `${API_BASE}/files/upload`,
//         data,
//         { headers: { "Content-Type": "multipart/form-data" } }
//       );
//       setFormData({ ...formData, productUrl: response.data.fileUrl });
//       toast.success("Image uploaded successfully");
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to upload image");
//     } finally {
//       setUploading(false);
//     }
//   };

//   // -----------------------------
//   // CREATE OR UPDATE PRODUCT
//   // -----------------------------
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!formData.serviceOfferingId || !formData.vendorId || !formData.categoryId) {
//       toast.error("Please select service, vendor, and category");
//       return;
//     }

//     try {
//       const payload = {
//         label: formData.label,
//         description: formData.description,
//         productUrl: formData.productUrl,
//         measurementUnit: formData.measurementUnit,
//         measurementValue: formData.measurementValue,
//         serviceOfferingId: formData.serviceOfferingId, // STRING
//         vendorId: formData.vendorId.toString(),
//         categoryId: Number(formData.categoryId),
//       };

//       if (editingProduct) {
//         await axios.patch(`${API_BASE}/products/${editingProduct.id}`, payload);
//         toast.success("Product updated successfully");
//       } else {
//         await axios.post(`${API_BASE}/products`, payload);
//         toast.success("Product created successfully");
//       }

//       setIsDialogOpen(false);
//       resetForm();
//       getProducts();
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to save product");
//     }
//   };

//   const handleEdit = (product: Product) => {
//     setEditingProduct(product);
//     setFormData({
//       label: product.label,
//       description: product.description,
//       productUrl: product.productUrl,
//       measurementUnit: product.measurementUnit,
//       measurementValue: product.measurementValue,
//       serviceOfferingId: product.serviceOffering?.serviceCode || "",
//       vendorId: product.vendor?.id?.toString() || "",
//       categoryId: product.category?.id?.toString() || "",
//     });
//     setIsDialogOpen(true);
//   };

//   const handleDelete = async (id: number) => {
//     if (!confirm("Are you sure you want to delete this product?")) return;
//     try {
//       await axios.delete(`${API_BASE}/products/${id}`);
//       setProducts(products.filter((p) => p.id !== id));
//       toast.success("Product deleted successfully");
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to delete product");
//     }
//   };

//   // -----------------------------
//   // RENDER
//   // -----------------------------
//   return (
//     <div className="flex flex-col min-h-screen">
//       <DashboardHeader />

//       <div className="flex-1 space-y-6 p-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <h2 className="text-3xl font-bold tracking-tight">Products</h2>
//             <p className="text-muted-foreground">Manage your product inventory</p>
//           </div>

//           <Dialog open={isDialogOpen} onOpenChange={(o) => { setIsDialogOpen(o); if (!o) resetForm(); }}>
//             <DialogTrigger asChild>
//               <Button className="gap-2">
//                 <Plus className="h-4 w-4" /> Add Product
//               </Button>
//             </DialogTrigger>

//             <DialogContent className="max-w-2xl">
//               <DialogHeader>
//                 <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
//               </DialogHeader>

//               <form onSubmit={handleSubmit}>
//                 <div className="grid gap-4 py-4">
//                   <div className="grid gap-2">
//                     <Label>Product Name</Label>
//                     <Input
//                       value={formData.label}
//                       onChange={(e) => setFormData({ ...formData, label: e.target.value })}
//                       required
//                     />
//                   </div>

//                   <div className="grid gap-2">
//                     <Label>Description</Label>
//                     <Textarea
//                       value={formData.description}
//                       onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                       required
//                     />
//                   </div>

//                   <div className="grid grid-cols-3 gap-4">
//                     <div className="grid gap-2">
//                       <Label>Service Offering</Label>
//                       <Select
//                         value={formData.serviceOfferingId}
//                         onValueChange={(v) => setFormData({ ...formData, serviceOfferingId: v })}
//                       >
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select service" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           {services.map((s) => (
//                             <SelectItem key={s.serviceCode} value={s.serviceCode}>
//                               {s.serviceName}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     </div>

//                     <div className="grid gap-2">
//                       <Label>Vendor</Label>
//                       <Select
//                         value={formData.vendorId}
//                         onValueChange={(v) => setFormData({ ...formData, vendorId: v })}
//                       >
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select vendor" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           {vendors.map((v) => (
//                             <SelectItem key={v.id} value={v.id.toString()}>
//                               {v.businessName}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     </div>

//                     <div className="grid gap-2">
//                       <Label>Category</Label>
//                       <Select
//                         value={formData.categoryId}
//                         onValueChange={(v) => setFormData({ ...formData, categoryId: v })}
//                       >
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select category" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           {categories.map((c) => (
//                             <SelectItem key={c.id} value={c.id.toString()}>
//                               {c.label}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="grid gap-2">
//                       <Label>Measurement Unit</Label>
//                       <Select
//                         value={formData.measurementUnit}
//                         onValueChange={(v) => setFormData({ ...formData, measurementUnit: v })}
//                       >
//                         <SelectTrigger>
//                           <SelectValue />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="KG">Kilogram (KG)</SelectItem>
//                           <SelectItem value="GM">Gram (GM)</SelectItem>
//                           <SelectItem value="LITRE">Litre</SelectItem>
//                           <SelectItem value="ML">Millilitre</SelectItem>
//                           <SelectItem value="MONTH">Month</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>

//                     <div className="grid gap-2">
//                       <Label>Value</Label>
//                       <Input
//                         value={formData.measurementValue}
//                         onChange={(e) => setFormData({ ...formData, measurementValue: e.target.value })}
//                         required
//                       />
//                     </div>
//                   </div>

//                   <div className="grid gap-2">
//                     <Label>Product Image</Label>
//                     <Input
//                       type="file"
//                       accept="image/*"
//                       onChange={handleFileUpload}
//                       required={!editingProduct}
//                     />
//                     {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
//                   </div>
//                 </div>

//                 <DialogFooter>
//                   <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
//                   <Button type="submit">{editingProduct ? "Update" : "Add"} Product</Button>
//                 </DialogFooter>
//               </form>
//             </DialogContent>
//           </Dialog>
//         </div>

//         {/* PRODUCT TABLE */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Product Inventory</CardTitle>
//             <CardDescription>List of all products</CardDescription>
//           </CardHeader>

//           <CardContent>
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Image</TableHead>
//                   <TableHead>Name</TableHead>
//                   <TableHead>Description</TableHead>
//                   <TableHead>Unit</TableHead>
//                   <TableHead>Value</TableHead>
//                   <TableHead>Actions</TableHead>
//                 </TableRow>
//               </TableHeader>

//               <TableBody>
//                 {products.map((p) => (
//                   <TableRow key={p.id}>
//                     <TableCell>
//                       {p.productUrl ? <img src={p.productUrl} className="h-10 w-10 rounded" /> : "-"}
//                     </TableCell>
//                     <TableCell>{p.label}</TableCell>
//                     <TableCell className="max-w-xs truncate">{p.description}</TableCell>
//                     <TableCell>{p.measurementUnit}</TableCell>
//                     <TableCell>{p.measurementValue}</TableCell>
//                     <TableCell>
//                       <div className="flex gap-2">
//                         <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}>
//                           <Pencil className="h-4 w-4" />
//                         </Button>
//                         <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
//                           <Trash2 className="h-4 w-4 text-red-500" />
//                         </Button>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>

//             </Table>
//           </CardContent>
//         </Card>

//       </div>
//     </div>
//   );
// };

// export default Products;

// import { useState, useEffect } from "react";
// import { DashboardHeader } from "@/components/DashboardHeader";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Textarea } from "@/components/ui/textarea";
// import { Plus, Pencil, Trash2 } from "lucide-react";
// import { toast } from "sonner";

// type Product = {
//   id: number;
//   label: string;
//   description: string;
//   productUrl: string;
//   measurementUnit: string;
//   measurementValue: string;
//   serviceOffering: any;
//   vendorSubscriptionPlan?: any;
// };

// const API_BASE = "http://localhost:3064";

// const Products = () => {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [editingProduct, setEditingProduct] = useState<Product | null>(null);
//   const [imageFile, setImageFile] = useState<File | null>(null);

//   const [formData, setFormData] = useState({
//     label: "",
//     description: "",
//     measurementUnit: "KG",
//     measurementValue: "",
//     serviceOfferingId: "MARKET", // default based on your API
//     vendorSubscriptionPlanId: ""
//   });

//   // -----------------------------
//   // GET PRODUCTS FROM API (fixed)
//   // -----------------------------
//   const getProducts = async () => {
//     try {
//       const res = await fetch(`${API_BASE}/products?page=1&limit=10`);
//       if (!res.ok) throw new Error("Failed to fetch products");

//       const data = await res.json();

//       // Your API returns: { items: [], meta: {} }
//       const list = Array.isArray(data.items) ? data.items : [];

//       setProducts(list);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to load products");
//     }
//   };

//   useEffect(() => {
//     getProducts();
//   }, []);

//   const resetForm = () => {
//     setFormData({
//       label: "",
//       description: "",
//       measurementUnit: "KG",
//       measurementValue: "",
//       serviceOfferingId: "MARKET",
//       vendorSubscriptionPlanId: ""
//     });
//     setImageFile(null);
//     setEditingProduct(null);
//   };

//   // -----------------------------
//   // IMAGE UPLOAD FUNCTION
//   // -----------------------------
//   const uploadImage = async () => {
//     if (!imageFile) return null;

//     const form = new FormData();
//     form.append("file", imageFile);

//     const res = await fetch(`${API_BASE}/upload`, {
//       method: "POST",
//       body: form
//     });

//     if (!res.ok) throw new Error("Image upload failed");

//     const data = await res.json();
//     return data.url; // backend returns uploaded URL
//   };

//   // -----------------------------
//   // CREATE OR UPDATE PRODUCT
//   // -----------------------------
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     try {
//       let uploadedUrl = editingProduct?.productUrl || "";

//       if (imageFile) uploadedUrl = await uploadImage();

//       const payload: any = {
//         label: formData.label,
//         description: formData.description,
//         productUrl: uploadedUrl,
//         measurementUnit: formData.measurementUnit,
//         measurementValue: formData.measurementValue,
//         serviceOfferingId: formData.serviceOfferingId
//       };

//       if (formData.vendorSubscriptionPlanId.trim() !== "") {
//         payload.vendorSubscriptionPlanId = Number(formData.vendorSubscriptionPlanId);
//       }

//       const res = await fetch(`${API_BASE}/products`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload)
//       });

//       if (!res.ok) throw new Error("Failed to save product");

//       toast.success(editingProduct ? "Product updated" : "Product created");

//       setIsDialogOpen(false);
//       resetForm();
//       getProducts();
//     } catch (err) {
//       console.error(err);
//       toast.error("Something went wrong");
//     }
//   };

//   const handleEdit = (product: Product) => {
//     setEditingProduct(product);

//     setFormData({
//       label: product.label,
//       description: product.description,
//       measurementUnit: product.measurementUnit,
//       measurementValue: product.measurementValue,
//       serviceOfferingId: product.serviceOffering?.serviceCode || "MARKET",
//       vendorSubscriptionPlanId: product.vendorSubscriptionPlan?.id?.toString() || ""
//     });

//     setIsDialogOpen(true);
//   };

//   const handleDelete = (id: number) => {
//     // no delete API available yet
//     setProducts((prev) => prev.filter((p) => p.id !== id));
//     toast.success("Product deleted (local only)");
//   };

//   return (
//     <div className="flex flex-col min-h-screen">
//       <DashboardHeader />

//       <div className="flex-1 space-y-6 p-6">

//         <div className="flex items-center justify-between">
//           <div>
//             <h2 className="text-3xl font-bold tracking-tight">Products</h2>
//             <p className="text-muted-foreground">Manage your product inventory</p>
//           </div>

//           <Dialog open={isDialogOpen} onOpenChange={(o) => { setIsDialogOpen(o); if (!o) resetForm(); }}>
//             <DialogTrigger asChild>
//               <Button className="gap-2">
//                 <Plus className="h-4 w-4" />
//                 Add Product
//               </Button>
//             </DialogTrigger>

//             <DialogContent className="max-w-2xl">
//               <DialogHeader>
//                 <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
//               </DialogHeader>

//               <form onSubmit={handleSubmit}>
//                 <div className="grid gap-4 py-4">
//                   <div className="grid gap-2">
//                     <Label>Product Name</Label>
//                     <Input
//                       value={formData.label}
//                       onChange={(e) => setFormData({ ...formData, label: e.target.value })}
//                       required
//                     />
//                   </div>

//                   <div className="grid gap-2">
//                     <Label>Description</Label>
//                     <Textarea
//                       value={formData.description}
//                       onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                       required
//                     />
//                   </div>

//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="grid gap-2">
//                       <Label>Measurement Unit</Label>
//                       <Select
//                         value={formData.measurementUnit}
//                         onValueChange={(v) => setFormData({ ...formData, measurementUnit: v })}
//                       >
//                         <SelectTrigger><SelectValue /></SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="KG">Kilogram (KG)</SelectItem>
//                           <SelectItem value="GM">Gram (GM)</SelectItem>
//                           <SelectItem value="LITRE">Litre</SelectItem>
//                           <SelectItem value="ML">Millilitre</SelectItem>
//                           <SelectItem value="MONTH">Month</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>

//                     <div className="grid gap-2">
//                       <Label>Value</Label>
//                       <Input
//                         value={formData.measurementValue}
//                         onChange={(e) => setFormData({ ...formData, measurementValue: e.target.value })}
//                         required
//                       />
//                     </div>
//                   </div>

//                   <div className="grid gap-2">
//                     <Label>Vendor Subscription Plan ID (Optional)</Label>
//                     <Input
//                       type="number"
//                       value={formData.vendorSubscriptionPlanId}
//                       onChange={(e) =>
//                         setFormData({ ...formData, vendorSubscriptionPlanId: e.target.value })
//                       }
//                       placeholder="Leave empty if not required"
//                     />
//                   </div>

//                   <div className="grid gap-2">
//                     <Label>Product Image</Label>
//                     <Input
//                       type="file"
//                       accept="image/*"
//                       onChange={(e) => setImageFile(e.target.files?.[0] || null)}
//                       required={!editingProduct}
//                     />
//                   </div>
//                 </div>

//                 <DialogFooter>
//                   <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
//                     Cancel
//                   </Button>
//                   <Button type="submit">{editingProduct ? "Update" : "Add"} Product</Button>
//                 </DialogFooter>
//               </form>
//             </DialogContent>
//           </Dialog>
//         </div>

//         {/* TABLE */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Product Inventory</CardTitle>
//             <CardDescription>List of all products</CardDescription>
//           </CardHeader>

//           <CardContent>
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Image</TableHead>
//                   <TableHead>Name</TableHead>
//                   <TableHead>Description</TableHead>
//                   <TableHead>Unit</TableHead>
//                   <TableHead>Value</TableHead>
//                   <TableHead>Actions</TableHead>
//                 </TableRow>
//               </TableHeader>

//               <TableBody>
//                 {products.map((p) => (
//                   <TableRow key={p.id}>
//                     <TableCell>
//                       <img src={p.productUrl} className="h-10 w-10 rounded" />
//                     </TableCell>
//                     <TableCell>{p.label}</TableCell>
//                     <TableCell className="max-w-xs truncate">{p.description}</TableCell>
//                     <TableCell>{p.measurementUnit}</TableCell>
//                     <TableCell>{p.measurementValue}</TableCell>
//                     <TableCell>
//                       <div className="flex gap-2">
//                         <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}>
//                           <Pencil className="h-4 w-4" />
//                         </Button>

//                         <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
//                           <Trash2 className="h-4 w-4 text-red-500" />
//                         </Button>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>

//             </Table>
//           </CardContent>
//         </Card>

//       </div>
//     </div>
//   );
// };

// export default Products;

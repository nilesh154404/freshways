"use client";

import { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";

import { DashboardHeader } from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

/* ================= TYPES ================= */

type CategoryOption = { id: number; name: string };
type ProductOption = { id: number; name: string };

type MarketingItem = {
  id: number;
  category_id: number;
  category_name: string;
  product_id?: number;
  product_name?: string;
  description: string;
  media_urls: string[];
};

type ProductsResponse = {
  items: { id: number; label: string }[];
};

const API_BASE = "http://localhost:3064";

/* ================= COMPONENT ================= */

const Marketing = () => {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [items, setItems] = useState<MarketingItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MarketingItem | null>(null);
  const [uploading, setUploading] = useState(false);

  const role = localStorage.getItem("role");
  const profileId = localStorage.getItem("profileId");

  /* ================= FORM STATE ================= */
  const [formData, setFormData] = useState({
    categoryId: "1", // ✅ DEFAULT CATEGORY ID = 1
    productId: "",
    description: "",
    media_files: [] as File[],
  });

  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchMarketingItems();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get<CategoryOption[]>(
        `${API_BASE}/categories/get-categories`
      );
      setCategories(res.data);
    } catch {
      toast.error("Failed to load categories");
    }
  };

  const fetchProducts = async () => {
    let url = `${API_BASE}/products?page=1&limit=500`;
    if (role !== "Admin") url += `&vendorId=${profileId}`;

    try {
      const res = await axios.get<ProductsResponse>(url);
      setProducts(res.data.items.map((p) => ({ id: p.id, name: p.label })));
    } catch {
      toast.error("Failed to load products");
    }
  };

  const fetchMarketingItems = async () => {
    try {
      let url = `${API_BASE}/marketing?page=1&limit=500`;
      if (role !== "Admin") url += `&vendorId=${profileId}`;
      const res = await axios.get(url);

      const normalized: MarketingItem[] = res.data.map((item: any) => ({
        id: item.id,
        category_id: item.category?.id,
        category_name: item.category?.name,
        product_id: item.product?.id,
        product_name: item.product?.label,
        description: item.description,
        media_urls: item.media?.map((m: any) => m.fileUrl) || [],
        vendorId: profileId
      }));

      setItems(normalized);
    } catch {
      toast.error("Failed to load marketing items");
    }
  };

  /* ================= HELPERS ================= */

  const resetForm = () => {
    setFormData({
      categoryId: "1", // ✅ reset default
      productId: "",
      description: "",
      media_files: [],
    });
    setMediaPreviews([]);
    setEditingItem(null);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    setFormData({ ...formData, media_files: files });
    setMediaPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  /* ================= CREATE / UPDATE ================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setUploading(true);
      const data = new FormData();

      data.append("categoryId", formData.categoryId);
      if (formData.productId) data.append("productId", formData.productId);
      data.append("description", formData.description);

      if (role !== "Admin" && profileId) {
        data.append("vendorId", profileId);
      }

      formData.media_files.forEach((file) =>
        data.append("media_files", file)
      );

      if (editingItem) {
        await axios.patch(`${API_BASE}/marketing/${editingItem.id}`, data);
        toast.success("Marketing updated");
      } else {
        await axios.post(`${API_BASE}/marketing`, data);
        toast.success("Marketing created");
      }

      fetchMarketingItems();
      setIsDialogOpen(false);
      resetForm();
    } catch {
      toast.error("Failed to save marketing");
    } finally {
      setUploading(false);
    }
  };

  /* ================= EDIT / DELETE ================= */

  const handleEdit = (item: MarketingItem) => {
    setEditingItem(item);
    setFormData({
      categoryId: String(item.category_id),
      productId: item.product_id ? String(item.product_id) : "",
      description: item.description,
      media_files: [],
    });
    setMediaPreviews(item.media_urls);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this marketing item?")) return;

    try {
      await axios.delete(`${API_BASE}/marketing/${id}`);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ================= UI ================= */

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />

      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Marketing</h2>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Add Marketing
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? "Edit Marketing" : "Add Marketing"}
                </DialogTitle>
                <DialogDescription>Manage marketing content</DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* CATEGORY */}
                <div>
                  <Label>Category</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(v) =>
                      setFormData({ ...formData, categoryId: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* PRODUCT */}
                <div>
                  <Label>Product</Label>
                  <Select
                    value={formData.productId}
                    onValueChange={(v) =>
                      setFormData({ ...formData, productId: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* DESCRIPTION */}
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                {/* MEDIA */}
                <div>
                  <Label>Media</Label>
                  <Input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                  />

                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {mediaPreviews.map((src, i) =>
                      src.endsWith(".mp4") ? (
                        <video key={i} src={src} controls />
                      ) : (
                        <img key={i} src={src} className="rounded" />
                      )
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button type="submit" disabled={uploading}>
                    {editingItem ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* LIST */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id}>
              {item.media_urls[0] && (
                <img
                  src={item.media_urls[0]}
                  className="h-40 w-full object-cover"
                />
              )}
              <CardContent>
                <CardTitle>{item.product_name}</CardTitle>
                <CardDescription>{item.description}</CardDescription>

                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={() => handleEdit(item)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Marketing;


// import { useState, useEffect, ChangeEvent } from "react";
// import axios from "axios";
// import { toast } from "sonner";
// import { Plus, Edit, Trash2 } from "lucide-react";

// import { DashboardHeader } from "@/components/DashboardHeader";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Select,
//   SelectTrigger,
//   SelectContent,
//   SelectItem,
//   SelectValue,
// } from "@/components/ui/select";

// /* ================= TYPES ================= */

// type CategoryOption = { id: number; name: string };
// type ProductOption = { id: number; name: string };

// type MarketingItem = {
//   id: number;
//   category_id: number;
//   category_name: string;
//   product_id?: number;
//   product_name?: string;
//   description: string;
//   media_urls: string[];
// };

// type ProductsResponse = {
//   items: { id: number; label: string }[];
//   total: number;
// };

// const API_BASE = "http://localhost:3064";

// /* ================= COMPONENT ================= */

// const Marketing = () => {
//   const [categories, setCategories] = useState<CategoryOption[]>([]);
//   const [products, setProducts] = useState<ProductOption[]>([]);
//   const [items, setItems] = useState<MarketingItem[]>([]);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [editingItem, setEditingItem] = useState<MarketingItem | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [uploading, setUploading] = useState(false);

//   const [formData, setFormData] = useState({
//     category_id: "",
//     product_id: "",
//     description: "",
//     media_files: [] as File[],
//   });

//   const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);

//   const role = localStorage.getItem("role");
//   const profileId = localStorage.getItem("profileId");
//   /* ================= LOAD DATA ================= */

//   useEffect(() => {
//     fetchCategories();
//     fetchProducts();
//     fetchMarketingItems();
//   }, []);

//   const fetchCategories = async () => {
//     try {
//       const res = await axios.get<CategoryOption[]>(
//         `${API_BASE}/categories/get-categories`
//       );
//       setCategories(res.data);
//     } catch {
//       toast.error("Failed to load categories");
//     }
//   };

//   const fetchProducts = async () => {

//     let url = `http://localhost:3064/products?page=1&limit=500`;
//     if (role != "Admin") url += `&vendorId=2`;

//     try {
//       const res = await axios.get<ProductsResponse>(
//         url
//       );

//       setProducts(
//         res.data.items.map((p) => ({ id: p.id, name: p.label }))
//       );
//     } catch {
//       toast.error("Failed to load products");
//     }
//   };

//   /* ================= NORMALIZED MARKETING LIST ================= */

//   const fetchMarketingItems = async () => {
//     try {
//       const res = await axios.get(`${API_BASE}/marketing`);

//       const normalized: MarketingItem[] = res.data.map((item: any) => ({
//         id: item.id,
//         category_id: item.category?.id,
//         category_name: item.category?.name,
//         product_id: item.product?.id,
//         product_name: item.product?.label,
//         description: item.description,
//         media_urls: item.media?.map((m: any) => m.fileUrl) || [],
//       }));

//       setItems(normalized);
//     } catch {
//       toast.error("Failed to load marketing items");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   /* ================= FORM HELPERS ================= */

//   const resetForm = () => {
//     setFormData({
//       category_id: "",
//       product_id: "",
//       description: "",
//       media_files: [],
//     });
//     setMediaPreviews([]);
//     setEditingItem(null);
//   };

//   const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files) return;

//     const files = Array.from(e.target.files);
//     setFormData({ ...formData, media_files: files });
//     setMediaPreviews(files.map((f) => URL.createObjectURL(f)));
//   };

//   /* ================= CREATE / UPDATE ================= */

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!formData.category_id || !formData.product_id) {
//       return toast.error("Category & Product are required");
//     }

//     try {
//       setUploading(true);
//       const data = new FormData();

//       data.append("categoryId", formData.category_id);
//       data.append("productId", formData.product_id);
//       data.append("description", formData.description);

//       formData.media_files.forEach((file) =>
//         data.append("media_files", file)
//       );

//       if (editingItem) {
//         await axios.patch(
//           `${API_BASE}/marketing/${editingItem.id}`,
//           data
//         );
//         toast.success("Marketing updated");
//       } else {
//         await axios.post(`${API_BASE}/marketing`, data);
//         toast.success("Marketing created");
//       }

//       fetchMarketingItems();
//       setIsDialogOpen(false);
//       resetForm();
//     } catch {
//       toast.error("Failed to save marketing");
//     } finally {
//       setUploading(false);
//     }
//   };

//   /* ================= EDIT / DELETE ================= */

//   const handleEdit = (item: MarketingItem) => {
//     setEditingItem(item);
//     setFormData({
//       category_id: String(item.category_id),
//       product_id: item.product_id ? String(item.product_id) : "",
//       description: item.description,
//       media_files: [],
//     });
//     setMediaPreviews(item.media_urls);
//     setIsDialogOpen(true);
//   };

//   const handleDelete = async (id: number) => {
//     if (!confirm("Delete this marketing item?")) return;

//     try {
//       await axios.delete(`${API_BASE}/marketing/${id}`);
//       setItems((prev) => prev.filter((i) => i.id !== id));
//       toast.success("Deleted");
//     } catch {
//       toast.error("Delete failed");
//     }
//   };

//   /* ================= UI ================= */

//   return (
//     <div className="flex flex-col min-h-screen">
//       <DashboardHeader />

//       <div className="flex-1 space-y-6 p-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <h2 className="text-3xl font-bold">Marketing</h2>
//             <p className="text-muted-foreground">Manage marketing content</p>
//           </div>
//           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//             <DialogTrigger asChild>
//               <Button className="gap-2 w-full sm:w-auto">
//                 <Plus className="h-4 w-4" /> Add Marketing
//               </Button>
//             </DialogTrigger>

//             <DialogContent
//               className="
//       w-[95vw]
//       max-w-lg
//       sm:rounded-lg
//       max-h-[90vh]
//       overflow-y-auto
//     "
//             >
//               <DialogHeader>
//                 <DialogTitle>
//                   {editingItem ? "Edit Marketing" : "Add Marketing"}
//                 </DialogTitle>
//                 <DialogDescription>
//                   Manage marketing content
//                 </DialogDescription>
//               </DialogHeader>

//               <form onSubmit={handleSubmit} className="space-y-4">
//                 {/* Category */}
//                 <div className="space-y-1">
//                   <Label>Category</Label>
//                   <Select
//                     value={formData.category_id}
//                     onValueChange={(v) =>
//                       setFormData({ ...formData, category_id: v })
//                     }
//                   >
//                     <SelectTrigger className="w-full">
//                       <SelectValue placeholder="Select category" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {categories.map((c) => (
//                         <SelectItem key={c.id} value={String(c.id)}>
//                           {c.name}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 {/* Product */}
//                 <div className="space-y-1">
//                   <Label>Product</Label>
//                   <Select
//                     value={formData.product_id}
//                     onValueChange={(v) =>
//                       setFormData({ ...formData, product_id: v })
//                     }
//                   >
//                     <SelectTrigger className="w-full">
//                       <SelectValue placeholder="Select product" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {products.map((p) => (
//                         <SelectItem key={p.id} value={String(p.id)}>
//                           {p.name}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 {/* Description */}
//                 <div className="space-y-1">
//                   <Label>Description</Label>
//                   <Textarea
//                     rows={4}
//                     className="w-full resize-none"
//                     value={formData.description}
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,
//                         description: e.target.value,
//                       })
//                     }
//                   />
//                 </div>

//                 {/* Media */}
//                 <div className="space-y-2">
//                   <Label>Media</Label>
//                   <Input
//                     type="file"
//                     multiple
//                     accept="image/*,video/*"
//                     onChange={handleFileChange}
//                   />

//                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
//                     {mediaPreviews.map((src, i) =>
//                       src.endsWith(".mp4") ? (
//                         <video
//                           key={i}
//                           src={src}
//                           controls
//                           className="rounded aspect-square object-cover"
//                         />
//                       ) : (
//                         <img
//                           key={i}
//                           src={src}
//                           className="rounded aspect-square object-cover"
//                         />
//                       )
//                     )}
//                   </div>
//                 </div>

//                 <DialogFooter className="pt-2">
//                   <Button
//                     type="submit"
//                     className="w-full sm:w-auto"
//                     disabled={uploading}
//                   >
//                     {editingItem ? "Update" : "Create"}
//                   </Button>
//                 </DialogFooter>
//               </form>
//             </DialogContent>
//           </Dialog>

//         </div>

//         {/* LIST */}
//         {isLoading ? (
//           <p>Loading...</p>
//         ) : (
//           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//             {items.map((item) => (
//               <Card key={item.id}>
//                 {item.media_urls.length > 0 && (
//                   <img
//                     src={item.media_urls[0]}
//                     className="h-40 w-full object-cover"
//                   />
//                 )}

//                 <CardContent>
//                   <CardTitle>{item.product_name}</CardTitle>
//                   <CardDescription>{item.description}</CardDescription>

//                   <div className="flex gap-2 mt-3">
//                     <Button size="sm" onClick={() => handleEdit(item)}>
//                       <Edit className="h-4 w-4" />
//                     </Button>
//                     <Button
//                       size="sm"
//                       variant="destructive"
//                       onClick={() => handleDelete(item.id)}
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
//     </div>
//   );
// };

// export default Marketing;

// import { useState, useEffect, ChangeEvent } from "react";
// import axios from "axios";
// import { toast } from "sonner";
// import { Plus, Edit, Trash2 } from "lucide-react";

// import { DashboardHeader } from "@/components/DashboardHeader";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Select,
//   SelectTrigger,
//   SelectContent,
//   SelectItem,
//   SelectValue,
// } from "@/components/ui/select";

// type CategoryOption = { id: number; name: string };
// type ProductOption = { id: number; name: string };
// type MarketingItem = {
//   id: number;
//   category_id: number;
//   category_name: string;
//   product_id?: number;
//   product_name?: string;
//   description: string;
//   media_urls: string[];
// };

// type ProductsResponse = {
//   items: {
//     id: number;
//     label: string;
//   }[];
//   total: number;
// };

// const API_BASE = "http://localhost:3064";

// const Marketing = () => {
//   const [categories, setCategories] = useState<CategoryOption[]>([]);
//   const [products, setProducts] = useState<ProductOption[]>([]);
//   const [items, setItems] = useState<MarketingItem[]>([]);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [editingItem, setEditingItem] = useState<MarketingItem | null>(null);
//   const [formData, setFormData] = useState({
//     category_id: "",
//     product_id: "",
//     description: "",
//     media_files: [] as File[],
//   });
//   const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
//   const [uploading, setUploading] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     fetchCategories();
//     fetchProducts();
//     fetchMarketingItems();
//   }, []);

//   const fetchCategories = async () => {
//     try {
//       const res = await axios.get<CategoryOption[]>(`${API_BASE}/categories/get-categories`);
//       setCategories(res.data);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to load categories");
//     }
//   };

//   const fetchProducts = async () => {
//     try {
//       const res = await axios.get<ProductsResponse>(
//         `${API_BASE}/products?page=1&limit=50`
//       );

//       const productOptions = res.data.items.map((p) => ({
//         id: p.id,
//         name: p.label,
//       }));

//       setProducts(productOptions);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to load products");
//     }
//   };


//   const fetchMarketingItems = async () => {
//     try {
//       const res = await axios.get<MarketingItem[]>(`${API_BASE}/marketing`);
//       setItems(res.data);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to load marketing items");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       category_id: "",
//       product_id: "",
//       description: "",
//       media_files: [],
//     });
//     setMediaPreviews([]);
//     setEditingItem(null);
//   };

//   const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files) return;
//     const files = Array.from(e.target.files);
//     setFormData({ ...formData, media_files: files });
//     setMediaPreviews(files.map(f => URL.createObjectURL(f)));
//   };

//   // ✅ Handle submit: use FormData for dynamic API integration
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!formData.category_id) return toast.error("Select a category");
//     if (!formData.product_id) return toast.error("Select a product");

//     try {
//       setUploading(true);
//       const data = new FormData();
//       // data.append("category_id", formData.category_id);
//       // data.append("product_id", formData.product_id);
//       data.append("categoryId", Number(formData.category_id).toString());
//       data.append("productId", Number(formData.product_id).toString());
//       data.append("description", formData.description);

//       formData.media_files.forEach(file => data.append("media_files", file));

//       if (editingItem) {
//         await axios.patch(`${API_BASE}/marketing/${editingItem.id}`, data, {
//           headers: { "Content-Type": "multipart/form-data" },
//         });
//         toast.success("Marketing item updated");
//       } else {
//         await axios.post(`${API_BASE}/marketing`, data, {
//           headers: { "Content-Type": "multipart/form-data" },
//         });
//         toast.success("Marketing item added");
//       }

//       fetchMarketingItems();
//       setIsDialogOpen(false);
//       resetForm();
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to save marketing item");
//     } finally {
//       setUploading(false);
//     }
//   };

//   const handleEdit = (item: MarketingItem) => {
//     setEditingItem(item);
//     setFormData({
//       category_id: String(item.category_id),
//       product_id: item.product_id ? String(item.product_id) : "",
//       description: item.description,
//       media_files: [],
//     });
//     setMediaPreviews(item.media_urls);
//     setIsDialogOpen(true);
//   };

//   const handleDelete = async (id: number) => {
//     if (!confirm("Are you sure you want to delete this item?")) return;
//     try {
//       await axios.delete(`${API_BASE}/marketing/${id}`);
//       setItems(items.filter(i => i.id !== id));
//       toast.success("Marketing item deleted");
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to delete item");
//     }
//   };

//   return (
//     <div className="flex flex-col min-h-screen">
//       <DashboardHeader />
//       <div className="flex-1 space-y-6 p-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <h2 className="text-3xl font-bold tracking-tight">Marketing</h2>
//             <p className="text-muted-foreground">Manage marketing content</p>
//           </div>

//           <Dialog
//             open={isDialogOpen}
//             onOpenChange={(open) => {
//               setIsDialogOpen(open);
//               if (!open) resetForm();
//             }}
//           >
//             <DialogTrigger asChild>
//               <Button className="gap-2">
//                 <Plus className="h-4 w-4" />
//                 Add Marketing
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="max-w-lg">
//               <DialogHeader>
//                 <DialogTitle>{editingItem ? "Edit Marketing" : "Add Marketing"}</DialogTitle>
//                 <DialogDescription>
//                   {editingItem ? "Update marketing content" : "Create new marketing content"}
//                 </DialogDescription>
//               </DialogHeader>

//               <form onSubmit={handleSubmit}>
//                 <div className="grid gap-4 py-4">
//                   {/* Category */}
//                   <div className="grid gap-2">
//                     <Label htmlFor="category">Category</Label>
//                     <Select
//                       value={formData.category_id}
//                       onValueChange={(val) =>
//                         setFormData({ ...formData, category_id: val })
//                       }
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select category" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {categories.map((cat) => (
//                           <SelectItem key={cat.id} value={String(cat.id)}>
//                             {cat.name}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   {/* Product */}
//                   <div className="grid gap-2">
//                     <Label htmlFor="product">Product</Label>
//                     <Select
//                       value={formData.product_id}
//                       onValueChange={(val) =>
//                         setFormData({ ...formData, product_id: val })
//                       }
//                       required
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select product" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {products.map((prod) => (
//                           <SelectItem key={prod.id} value={String(prod.id)}>
//                             {prod.name}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   {/* Description */}
//                   <div className="grid gap-2">
//                     <Label htmlFor="description">Description</Label>
//                     <Textarea
//                       id="description"
//                       value={formData.description}
//                       onChange={(e) =>
//                         setFormData({ ...formData, description: e.target.value })
//                       }
//                       placeholder="Enter content description"
//                     />
//                   </div>

//                   {/* Media */}
//                   <div className="grid gap-2">
//                     <Label htmlFor="media">Upload Media (Images/Videos)</Label>
//                     <Input
//                       type="file"
//                       accept="image/*,video/*"
//                       multiple
//                       onChange={handleFileChange}
//                     />
//                     {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
//                     <div className="grid grid-cols-3 gap-2 mt-2">
//                       {mediaPreviews.map((src, idx) => {
//                         const isVideo = src.endsWith(".mp4") || src.endsWith(".mov");
//                         return isVideo ? (
//                           <video
//                             key={idx}
//                             src={src}
//                             className="w-full h-24 object-cover rounded"
//                             controls
//                           />
//                         ) : (
//                           <img
//                             key={idx}
//                             src={src}
//                             className="w-full h-24 object-cover rounded"
//                           />
//                         );
//                       })}
//                     </div>
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
//                   <Button type="submit">{editingItem ? "Update" : "Add"}</Button>
//                 </DialogFooter>
//               </form>
//             </DialogContent>
//           </Dialog>
//         </div>

//         {isLoading ? (
//           <p>Loading marketing items...</p>
//         ) : (
//           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//             {items.map((item) => (
//               <Card key={item.id} className="relative">
//                 {item.media_urls.length > 0 && (
//                   <div className="grid grid-cols-2 gap-1">
//                     {item.media_urls.map((url, idx) => {
//                       const isVideo = url.endsWith(".mp4") || url.endsWith(".mov");
//                       return isVideo ? (
//                         <video
//                           key={idx}
//                           src={url}
//                           className="w-full h-32 object-cover rounded-t-lg"
//                           controls
//                         />
//                       ) : (
//                         <img
//                           key={idx}
//                           src={url}
//                           className="w-full h-32 object-cover rounded-t-lg"
//                         />
//                       );
//                     })}
//                   </div>
//                 )}
//                 <CardContent>
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <CardTitle className="text-xl">{item.category_name}</CardTitle>
//                       {item.product_name && (
//                         <CardDescription className="text-sm">
//                           Product: {item.product_name}
//                         </CardDescription>
//                       )}
//                       <CardDescription className="text-sm">{item.description}</CardDescription>
//                     </div>
//                     <div className="flex gap-2">
//                       <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
//                         <Edit className="h-4 w-4" />
//                       </Button>
//                       <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
//                         <Trash2 className="h-4 w-4 text-destructive" />
//                       </Button>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Marketing;

// import { useState, useEffect, ChangeEvent } from "react";
// import axios from "axios";
// import { toast } from "sonner";
// import { Plus, Edit, Trash2 } from "lucide-react";

// import { DashboardHeader } from "@/components/DashboardHeader";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Select,
//   SelectTrigger,
//   SelectContent,
//   SelectItem,
//   SelectValue,
// } from "@/components/ui/select";

// type CategoryOption = { id: number; name: string };
// type ProductOption = { id: number; name: string };
// type MarketingItem = {
//   id: number;
//   category_id: number;
//   category_name: string;
//   product_id?: number;
//   product_name?: string;
//   description: string;
//   media_urls: string[];
// };

// const Marketing = () => {
//   const [categories, setCategories] = useState<CategoryOption[]>([]);
//   const [products, setProducts] = useState<ProductOption[]>([]);
//   const [items, setItems] = useState<MarketingItem[]>([]);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [editingItem, setEditingItem] = useState<MarketingItem | null>(null);
//   const [formData, setFormData] = useState({
//     category_id: "",
//     product_id: "",
//     description: "",
//     media_files: [] as File[],
//   });
//   const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
//   const [uploading, setUploading] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     fetchCategories();
//     fetchProducts();
//     fetchMarketingItems();
//   }, []);

//   const fetchCategories = async () => {
//     try {
//       const response = await axios.get<CategoryOption[]>(
//        "http://localhost:3064/categories/get-categories"
//       );
//       setCategories(response.data);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to load categories");
//     }
//   };

// /*   const fetchProducts = async () => {
//     try {
//       const response = await axios.get<ProductOption[]>(
//         "http://localhost:3064/products?page=1&limit=10"
//       );
//       setProducts(response.data);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to load products");
//     }
//   }; */
//   const fetchProducts = async () => {
//   try {
//     const response = await axios.get(
//       "http://localhost:3064/products?page=1&limit=50"
//     );

//     const productOptions = response.data.items.map((p: any) => ({
//       id: p.id,
//       name: p.label, // API uses "label" for product name
//     }));

//     setProducts(productOptions);
//   } catch (err) {
//     console.error(err);
//     toast.error("Failed to load products");
//   }
// };


//   const fetchMarketingItems = async () => {
//     try {
//       const response = await axios.get<MarketingItem[]>(
//         "http://localhost:3064/marketing/get-items"
//       );
//       setItems(response.data);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to load marketing items");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       category_id: "",
//       product_id: "",
//       description: "",
//       media_files: [],
//     });
//     setMediaPreviews([]);
//     setEditingItem(null);
//   };

//   const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files) return;
//     const files = Array.from(e.target.files);
//     setFormData({ ...formData, media_files: files });

//     const previews = files.map((file) => URL.createObjectURL(file));
//     setMediaPreviews(previews);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!formData.category_id) return toast.error("Select a category");
//     if (!formData.product_id) return toast.error("Select a product");

//     try {
//       setUploading(true);

//       const media_urls: string[] = [];
//       for (const file of formData.media_files) {
//         const data = new FormData();
//         data.append("file", file);
//         const res = await axios.post<{ fileUrl: string }>(
//           "http://localhost:3064/files/upload",
//           data,
//           { headers: { "Content-Type": "multipart/form-data" } }
//         );
//         media_urls.push(res.data.fileUrl);
//       }

//       const payload = {
//         category_id: formData.category_id,
//         product_id: formData.product_id,
//         description: formData.description,
//         media_urls,
//       };

//       if (editingItem) {
//         await axios.patch(
//           `http://localhost:3064/marketing/${editingItem.id}`,
//           payload
//         );
//         toast.success("Marketing item updated");
//       } else {
//         await axios.post(
//           "http://localhost:3064/marketing",
//           payload
//         );
//         toast.success("Marketing item added");
//       }

//       fetchMarketingItems();
//       setIsDialogOpen(false);
//       resetForm();
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to save marketing item");
//     } finally {
//       setUploading(false);
//     }
//   };

//   const handleEdit = (item: MarketingItem) => {
//     setEditingItem(item);
//     setFormData({
//       category_id: String(item.category_id),
//       product_id: item.product_id ? String(item.product_id) : "",
//       description: item.description,
//       media_files: [],
//     });
//     setMediaPreviews(item.media_urls);
//     setIsDialogOpen(true);
//   };

//   const handleDelete = async (id: number) => {
//     if (!confirm("Are you sure you want to delete this item?")) return;
//     try {
//       await axios.delete(`http://localhost:3064/marketing/${id}`);
//       setItems(items.filter((i) => i.id !== id));
//       toast.success("Marketing item deleted");
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to delete item");
//     }
//   };

//   return (
//     <div className="flex flex-col min-h-screen">
//       <DashboardHeader />
//       <div className="flex-1 space-y-6 p-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <h2 className="text-3xl font-bold tracking-tight">Marketing</h2>
//             <p className="text-muted-foreground">Manage marketing content</p>
//           </div>

//           <Dialog
//             open={isDialogOpen}
//             onOpenChange={(open) => {
//               setIsDialogOpen(open);
//               if (!open) resetForm();
//             }}
//           >
//             <DialogTrigger asChild>
//               <Button className="gap-2">
//                 <Plus className="h-4 w-4" />
//                 Add Marketing
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="max-w-lg">
//               <DialogHeader>
//                 <DialogTitle>{editingItem ? "Edit Marketing" : "Add Marketing"}</DialogTitle>
//                 <DialogDescription>
//                   {editingItem ? "Update marketing content" : "Create new marketing content"}
//                 </DialogDescription>
//               </DialogHeader>

//               <form onSubmit={handleSubmit}>
//                 <div className="grid gap-4 py-4">
//                   {/* Category */}
//                   <div className="grid gap-2">
//                     <Label htmlFor="category">Category</Label>
//                     <Select
//                       value={formData.category_id}
//                       onValueChange={(val) =>
//                         setFormData({ ...formData, category_id: val })
//                       }
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select category" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {categories.map((cat) => (
//                           <SelectItem key={cat.id} value={String(cat.id)}>
//                             {cat.name}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   {/* Product */}
//                   <div className="grid gap-2">
//                     <Label htmlFor="product">Product</Label>
//                     <Select
//                       value={formData.product_id}
//                       onValueChange={(val) => setFormData({ ...formData, product_id: val })}
//                       required
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select product" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {products.map((prod) => (
//                           <SelectItem key={prod.id} value={String(prod.id)}>
//                             {prod.name}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   {/* Description */}
//                   <div className="grid gap-2">
//                     <Label htmlFor="description">Description</Label>
//                     <Textarea
//                       id="description"
//                       value={formData.description}
//                       onChange={(e) =>
//                         setFormData({ ...formData, description: e.target.value })
//                       }
//                       placeholder="Enter content description"
//                     />
//                   </div>

//                   {/* Media */}
//                   <div className="grid gap-2">
//                     <Label htmlFor="media">Upload Media (Images/Videos)</Label>
//                     <Input
//                       type="file"
//                       accept="image/*,video/*"
//                       multiple
//                       onChange={handleFileChange}
//                     />
//                     {uploading && (
//                       <p className="text-sm text-muted-foreground">Uploading...</p>
//                     )}
//                     <div className="grid grid-cols-3 gap-2 mt-2">
//                       {mediaPreviews.map((src, idx) => {
//                         const isVideo = src.endsWith(".mp4") || src.endsWith(".mov");
//                         return isVideo ? (
//                           <video
//                             key={idx}
//                             src={src}
//                             className="w-full h-24 object-cover rounded"
//                             controls
//                           />
//                         ) : (
//                           <img
//                             key={idx}
//                             src={src}
//                             className="w-full h-24 object-cover rounded"
//                           />
//                         );
//                       })}
//                     </div>
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
//                   <Button type="submit">{editingItem ? "Update" : "Add"}</Button>
//                 </DialogFooter>
//               </form>
//             </DialogContent>
//           </Dialog>
//         </div>

//         {isLoading ? (
//           <p>Loading marketing items...</p>
//         ) : (
//           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//             {items.map((item) => (
//               <Card key={item.id} className="relative">
//                 {item.media_urls.length > 0 && (
//                   <div className="grid grid-cols-2 gap-1">
//                     {item.media_urls.map((url, idx) => {
//                       const isVideo = url.endsWith(".mp4") || url.endsWith(".mov");
//                       return isVideo ? (
//                         <video
//                           key={idx}
//                           src={url}
//                           className="w-full h-32 object-cover rounded-t-lg"
//                           controls
//                         />
//                       ) : (
//                         <img
//                           key={idx}
//                           src={url}
//                           className="w-full h-32 object-cover rounded-t-lg"
//                         />
//                       );
//                     })}
//                   </div>
//                 )}
//                 <CardContent>
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <CardTitle className="text-xl">{item.category_name}</CardTitle>
//                       {item.product_name && (
//                         <CardDescription className="text-sm">
//                           Product: {item.product_name}
//                         </CardDescription>
//                       )}
//                       <CardDescription className="text-sm">{item.description}</CardDescription>
//                     </div>
//                     <div className="flex gap-2">
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => handleEdit(item)}
//                       >
//                         <Edit className="h-4 w-4" />
//                       </Button>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => handleDelete(item.id)}
//                       >
//                         <Trash2 className="h-4 w-4 text-destructive" />
//                       </Button>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Marketing;

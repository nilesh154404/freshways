"use client";

import { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Heart, MessageCircle, Share2, Bookmark, Info, MoreVertical } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { DashboardHeader } from "@/components/DashboardHeader";
import { MarketingCard, MarketingItem } from "@/components/MarketingCard";
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

  // Helper to safely get from localStorage (client-side only)
  const getLocalStorageCtx = () => {
    if (typeof window === 'undefined') return { role: null, profileId: null, token: null };

    let rawToken = localStorage.getItem("token") || localStorage.getItem("accessToken");

    return {
      role: localStorage.getItem("role"),
      profileId: localStorage.getItem("profileId"),
      token: rawToken?.replace(/^"|"$/g, '') // Remove start/end quotes if present
    };
  };

  const { role, profileId, token } = getLocalStorageCtx();

  /* ================= FORM STATE ================= */
  const [formData, setFormData] = useState({
    categoryId: "1",
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

  // Set Auth Header for all requests
  const authConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

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
      const res = await axios.get<ProductsResponse>(url, authConfig);
      setProducts(res.data.items.map((p) => ({ id: p.id, name: p.label })));
    } catch {
      toast.error("Failed to load products");
    }
  };

  const fetchMarketingItems = async () => {
    try {
      let url = `${API_BASE}/marketing`;

      const params = new URLSearchParams();
      // FIX: Only filter by vendorId if the user is actually a VENDOR. 
      // Customers should see ALL posts.
      if (role === "Vendor" && profileId) params.append("vendorId", profileId);

      const res = await axios.get<any[]>(`${url}?${params.toString()}`, authConfig);

      const normalized: MarketingItem[] = res.data.map((item: any) => ({
        id: item.id,
        category_id: item.category?.id,
        category_name: item.category?.name,
        product_id: item.product?.id,
        product_name: item.product?.label,
        description: item.description,
        media_urls: item.media?.map((m: any) => {
          // FIX: Replace hardcoded IP if present
          return m.fileUrl ? m.fileUrl.replace('http://192.168.1.36:3064', API_BASE) : '';
        }) || [],
        vendorId: item.vendor?.id,
        vendor_name: item.vendor?.businessName || item.vendor?.ownerName || (item.vendor ? "Unnamed Vendor" : undefined),


        likes_count: item.likes_count || 0,
        comments_count: item.comments_count || 0,
        shares_count: item.shares_count || 0,
        saves_count: item.saves_count || 0,
        liked_by_me: item.liked_by_me || false,
        saved_by_me: item.saved_by_me || false,
        comments: item.comments || []
      }));

      setItems(normalized);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load marketing items");
    }
  };

  /* ================= HELPERS ================= */

  const resetForm = () => {
    setFormData({
      categoryId: "1",
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

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      };

      if (editingItem) {
        await axios.patch(`${API_BASE}/marketing/${editingItem.id}`, data, config);
        toast.success("Updated successfully");
      } else {
        await axios.post(`${API_BASE}/marketing`, data, config);
        toast.success("Created successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchMarketingItems();
    } catch (error) {
      toast.error("Failed to save marketing item");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${API_BASE}/marketing/${id}`, authConfig);
      toast.success("Deleted successfully");
      fetchMarketingItems();
    } catch {
      toast.error("Failed to delete");
    }
  };

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

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            {role === 'Customer' ? 'Posts' : 'Marketing'}
          </h1>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Create Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>{editingItem ? "Edit Post" : "Create New Post"}</DialogTitle>
                <DialogDescription>
                  Upload marketing content (images/videos) for your customers.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(val) => setFormData({ ...formData, categoryId: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
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

                <div className="grid gap-2">
                  <Label>Product (Optional)</Label>
                  <Select
                    value={formData.productId}
                    onValueChange={(val) => setFormData({ ...formData, productId: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Product" />
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

                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Tell your customers about this..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Media (Images/Videos)</Label>
                  <Input type="file" multiple onChange={handleFileChange} />
                  {mediaPreviews.length > 0 && (
                    <div className="flex gap-2 mt-2 overflow-x-auto">
                      {mediaPreviews.map((src, i) => (
                        <img key={i} src={src} className="h-16 w-16 object-cover rounded border" />
                      ))}
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button type="submit" disabled={uploading}>
                    {uploading ? "Uploading..." : editingItem ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* LIST */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <MarketingCard
              key={item.id}
              item={item}
              role={role}
              token={token}
              onDelete={handleDelete}
              onEdit={handleEdit}
              refresh={fetchMarketingItems}
            />
          ))}
        </div>
      </div>
    </div >
  );
};

/* ================= SOCIAL INTERACTION COMPONENT ================= */



export default Marketing;

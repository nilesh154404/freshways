"use client";

import { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Heart, MessageCircle, Share2, Bookmark, Info, MoreVertical } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  // Social fields (mock/future)
  likes_count: number;
  comments_count: number;
  shares_count: number;
  saves_count: number;
  liked_by_me: boolean;
  saved_by_me: boolean;
  comments: Comment[];
};

type Comment = {
  id: number;
  user_name: string;
  user_role: string;
  content: string;
  created_at: string;
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
        vendorId: profileId,
        // Mock data initialization
        likes_count: Math.floor(Math.random() * 50),
        comments_count: 5,
        shares_count: Math.floor(Math.random() * 20),
        saves_count: Math.floor(Math.random() * 10),
        comments: [
          { id: 1, user_name: "John Doe", user_role: "Customer", content: "Great product!", created_at: new Date().toISOString() },
          { id: 2, user_name: "Jane Smith", user_role: "Customer", content: "Love the quality.", created_at: new Date().toISOString() }
        ]
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
            <MarketingCard
              key={item.id}
              item={item}
              role={role}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))}
        </div>
      </div>
    </div >
  );
};

/* ================= SOCIAL INTERACTION COMPONENT ================= */

const MarketingCard = ({
  item,
  role,
  onDelete,
  onEdit
}: {
  item: MarketingItem;
  role: string | null;
  onDelete: (id: number) => void;
  onEdit: (item: MarketingItem) => void;
}) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>(item.comments || []);
  const [showDetails, setShowDetails] = useState(false);

  const handlePostComment = () => {
    if (!commentText.trim()) return;
    const newComment: Comment = {
      id: Date.now(),
      user_name: "Current User",
      user_role: role || "Customer",
      content: commentText,
      created_at: new Date().toISOString(),
    };
    setComments([...comments, newComment]);
    setCommentText("");
    toast.success("Comment posted");
  };

  const handleDeleteComment = (commentId: number) => {
    setComments(comments.filter(c => c.id !== commentId));
    toast.success("Comment deleted");
  };

  /* Share Dialog State */
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  const handleShare = async () => {
    const deepLink = `freshwayz://marketing-content?id=${item.id}`;
    setShareUrl(deepLink);

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(deepLink);
        toast.success("Link copied to clipboard");
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = deepLink;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success("Link copied to clipboard");
      }
      // Open the "Open in App" dialog
      setShowShareDialog(true);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  // const handleOpenApp = () => {
  //   window.location.href = shareUrl;
  //   setShowShareDialog(false);
  // };

  const handleOpenApp = () => {
    window.location.href = shareUrl; // now it works (web link)
};


  const isAdminOrVendor = role === "Admin" || role === "Vendor";

  return (
    <>
      <Card className="flex flex-col h-[500px] overflow-hidden group">
        {/* ... existing card content ... */}
        <div className="relative h-64 w-full bg-muted">
          {item.media_urls[0] ? (
            <img
              src={item.media_urls[0]}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground">
              No Image
            </div>
          )}
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold shadow-sm">
            {item.category_name}
          </div>
        </div>

        <CardContent className="flex-1 flex flex-col p-4">
          <div className="mb-2">
            <h3 className="font-bold text-lg leading-tight line-clamp-1" title={item.product_name}>
              {item.product_name}
            </h3>
          </div>

          <div className="flex-1">
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {item.description}
            </p>
          </div>

          <div className="flex items-center gap-4 text-muted-foreground mt-4 text-sm">
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>{item.likes_count}</span>
            </div>

            <div
              className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="h-4 w-4" />
              <span>{comments.length}</span>
            </div>

            <div
              className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
              <span>{item.shares_count}</span>
            </div>

            <div className="flex items-center gap-1">
              <Bookmark className="h-4 w-4" />
              <span>{item.saves_count}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-3 border-t">
            <Button
              variant="secondary"
              className="flex-1 h-8 text-xs bg-muted/50 hover:bg-muted"
              onClick={() => setShowDetails(true)}
            >
              Details
            </Button>

            {isAdminOrVendor && (
              <>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => onEdit(item)}>
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive/70 hover:text-destructive" onClick={() => onDelete(item.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* COMMENTS DIALOG */}
      {showComments && (
        <Dialog open={showComments} onOpenChange={setShowComments}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Comments</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {comments.length === 0 ? <p className="text-center text-sm text-muted">No comments</p> :
                comments.map(c => (
                  <div key={c.id} className="text-sm border-b pb-2">
                    <div className="flex justify-between">
                      <span className="font-semibold">{c.user_name}</span>
                      <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                    <p>{c.content}</p>
                    {isAdminOrVendor && (
                      <Button variant="link" className="text-red-500 h-auto p-0 text-xs" onClick={() => handleDeleteComment(c.id)}>Delete</Button>
                    )}
                  </div>
                ))
              }
            </div>
            {!isAdminOrVendor && (
              <div className="flex gap-2">
                <Input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Add a comment..." />
                <Button onClick={handlePostComment}>Post</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* SHARE DIALOG (Open in App) */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Link Copied!</DialogTitle>
            <DialogDescription>
              Would you like to open this content in the Freshways App?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button onClick={handleOpenApp} className="w-full">
              Open in App
            </Button>
            <Button variant="outline" onClick={() => setShowShareDialog(false)} className="w-full">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* DETAILS DIALOG - THE POPUP */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-xl h-[500px] flex flex-col">
          <DialogHeader>
            <DialogTitle>Post Interactions</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="likes" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="likes">Likes ({item.likes_count})</TabsTrigger>
              <TabsTrigger value="comments">Comments ({comments.length})</TabsTrigger>
              <TabsTrigger value="shares">Shares ({item.shares_count})</TabsTrigger>
              <TabsTrigger value="saves">Saves ({item.saves_count})</TabsTrigger>
            </TabsList>

            <div className="flex-1 mt-4 overflow-hidden">
              {/* LIKES TAB */}
              <TabsContent value="likes" className="h-full overflow-y-auto pr-2 space-y-2">
                {/* Mock Data List */}
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 bg-muted/30 rounded hover:bg-muted/50 transition-colors">
                    <div className="h-8 w-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-500">
                      U{i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">User {i + 1}</p>
                      <p className="text-xs text-muted-foreground">Liked this post</p>
                    </div>
                  </div>
                ))}
              </TabsContent>

              {/* COMMENTS TAB */}
              <TabsContent value="comments" className="h-full overflow-y-auto pr-2 space-y-3">
                {comments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <MessageCircle className="h-8 w-8 mb-2 opacity-50" />
                    <p>No comments yet</p>
                  </div>
                ) : (
                  comments.map(c => (
                    <div key={c.id} className="flex gap-3 items-start p-3 bg-muted/30 rounded hover:bg-muted/50">
                      <div className="h-8 w-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                        {c.user_name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-semibold">{c.user_name}</span>
                          <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm break-all">{c.content}</p>
                      </div>
                      {isAdminOrVendor && (
                        <button className="text-destructive hover:bg-destructive/10 p-1.5 rounded" onClick={() => handleDeleteComment(c.id)}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </TabsContent>

              {/* SHARES TAB */}
              <TabsContent value="shares" className="h-full overflow-y-auto pr-2 space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 bg-muted/30 rounded">
                    <div className="h-8 w-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-500">
                      S{i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">User {i + 1}</p>
                      <p className="text-xs text-muted-foreground">Shared to Facebook</p>
                    </div>
                  </div>
                ))}
              </TabsContent>

              {/* SAVES TAB */}
              <TabsContent value="saves" className="h-full overflow-y-auto pr-2 space-y-2">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 bg-muted/30 rounded">
                    <div className="h-8 w-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-500">
                      B{i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">User {i + 1}</p>
                      <p className="text-xs text-muted-foreground">Saved to collection</p>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
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

// const API_BASE = "http://192.168.1.36:3064";

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

//     let url = `http://192.168.1.36:3064/products?page=1&limit=500`;
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

// const API_BASE = "http://192.168.1.36:3064";

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
//        "http://192.168.1.36:3064/categories/get-categories"
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
//         "http://192.168.1.36:3064/products?page=1&limit=10"
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
//       "http://192.168.1.36:3064/products?page=1&limit=50"
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
//         "http://192.168.1.36:3064/marketing/get-items"
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
//           "http://192.168.1.36:3064/files/upload",
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
//           `http://192.168.1.36:3064/marketing/${editingItem.id}`,
//           payload
//         );
//         toast.success("Marketing item updated");
//       } else {
//         await axios.post(
//           "http://192.168.1.36:3064/marketing",
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
//       await axios.delete(`http://192.168.1.36:3064/marketing/${id}`);
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















// "use client";

// import { useState, useEffect, ChangeEvent } from "react";
// import axios from "axios";
// import { toast } from "sonner";
// import { Plus, Edit, Trash2, Heart, MessageSquare, Share2, Send, X, User, Bookmark } from "lucide-react";

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
//   likes: { id: number; user: { id: number; fullName: string } }[];
//   comments: { id: number; text: string; userId: number; userType: string; user?: { id: number; fullName: string }; createdAt: string }[];
//   saves?: { id: number; userId: number; userType: string; user?: { id: number; fullName: string } }[];
//   shareCount: number;
//   saveCount: number;
//   vendorId?: number | string; // Added vendorId
// };

// type ProductsResponse = {
//   items: { id: number; label: string }[];
// };

// const API_BASE = "http://localhost:3064";

// /* ================= COMPONENT ================= */

// const Marketing = () => {
//   const [categories, setCategories] = useState<CategoryOption[]>([]);
//   const [products, setProducts] = useState<ProductOption[]>([]);
//   const [items, setItems] = useState<MarketingItem[]>([]);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [editingItem, setEditingItem] = useState<MarketingItem | null>(null);

//   const [uploading, setUploading] = useState(false);
//   const [commentsOpen, setCommentsOpen] = useState<number | null>(null);
//   const [likesOpen, setLikesOpen] = useState<number | null>(null);
//   const [savesOpen, setSavesOpen] = useState<number | null>(null);
//   const [newComment, setNewComment] = useState("");

//   const role = localStorage.getItem("role");
//   const profileId = localStorage.getItem("profileId");

//   /* ================= FORM STATE ================= */
//   const [formData, setFormData] = useState({
//     categoryId: "1", // ✅ DEFAULT CATEGORY ID = 1
//     productId: "",
//     description: "",
//     media_files: [] as File[],
//   });

//   const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);

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
//     let url = `${API_BASE}/products?page=1&limit=500`;
//     if (role !== "Admin") url += `&vendorId=${profileId}`;

//     try {
//       const res = await axios.get<ProductsResponse>(url);
//       setProducts(res.data.items.map((p) => ({ id: p.id, name: p.label })));
//     } catch {
//       toast.error("Failed to load products");
//     }
//   };

//   const fetchMarketingItems = async () => {
//     try {
//       let url = `${API_BASE}/marketing?page=1&limit=500`;
//       if (role !== "Admin") url += `&vendorId=${profileId}`;
//       const res = await axios.get(url);

//       const normalized: MarketingItem[] = res.data.map((item: any) => ({
//         id: item.id,
//         category_id: item.category?.id,
//         category_name: item.category?.name,
//         product_id: item.product?.id,
//         product_name: item.product?.label,
//         description: item.description,
//         media_urls: item.media?.map((m: any) => m.fileUrl) || [],
//         vendorId: profileId,
//         likes: item.likes || [],
//         comments: item.comments || [],
//         saves: item.saves || [],
//         shareCount: item.shareCount || 0,
//         saveCount: item.saveCount || 0,
//       }));

//       setItems(normalized);
//     } catch {
//       toast.error("Failed to load marketing items");
//     }
//   };

//   /* ================= HELPERS ================= */

//   const resetForm = () => {
//     setFormData({
//       categoryId: "1", // ✅ reset default
//       productId: "",
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

//     try {
//       setUploading(true);
//       const data = new FormData();

//       data.append("categoryId", formData.categoryId);
//       if (formData.productId) data.append("productId", formData.productId);
//       data.append("description", formData.description);

//       if (role !== "Admin" && profileId) {
//         data.append("vendorId", profileId);
//       }

//       formData.media_files.forEach((file) =>
//         data.append("media_files", file)
//       );

//       if (editingItem) {
//         await axios.patch(`${API_BASE}/marketing/${editingItem.id}`, data);
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
//       categoryId: String(item.category_id),
//       productId: item.product_id ? String(item.product_id) : "",
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

//   /* ================= SOCIAL ACTIONS ================= */

//   const handleLike = async (item: MarketingItem) => {
//     if (role === "Admin") {
//       return toast.error("Admins cannot like marketing content");
//     }
//     try {
//       const res = await axios.post(`${API_BASE}/marketing/${item.id}/like`, { userId: Number(profileId) });
//       const liked = res.data.liked;

//       setItems(prev => prev.map(i => {
//         if (i.id !== item.id) return i;
//         if (liked) {
//           // Add fake user like for optimistic/immediate update or re-fetch
//           // Simpler to just re-fetch or construct manually if we have user info. 
//           // We can fetchMarketingItems() to get fresh state.
//           return i; // fetchMarketingItems calls below
//         } else {
//           return i;
//         }
//       }));
//       fetchMarketingItems();
//     } catch {
//       toast.error("Failed to like");
//     }
//   };

//   const handleShare = async (item: MarketingItem) => {
//     if (role === "Admin") {
//       return toast.error("Admins cannot share marketing content");
//     }
//     try {
//       await axios.post(`${API_BASE}/marketing/${item.id}/share`, { userId: Number(profileId) });

//       // Copy to clipboard
//       await navigator.clipboard.writeText(`${window.location.origin}/marketing/${item.id}`); // Conceptual link
//       toast.success("Link copied to clipboard");
//       fetchMarketingItems();
//     } catch {
//       toast.error("Failed to share");
//     }
//   };

//   const handleAddComment = async (itemId: number) => {
//     if (role === "Admin") {
//       return toast.error("Admins cannot comment on marketing content");
//     }
//     if (!newComment.trim()) return;
//     try {
//       await axios.post(`${API_BASE}/marketing/${itemId}/comment`, {
//         userId: Number(profileId),
//         text: newComment
//       });
//       setNewComment("");
//       fetchMarketingItems();
//     } catch {
//       toast.error("Failed to post comment");
//     }
//   };

//   const handleDeleteComment = async (commentId: number) => {
//     if (!confirm("Delete this comment?")) return;
//     try {
//       await axios.delete(`${API_BASE}/marketing/comment/${commentId}`);
//       fetchMarketingItems();
//     } catch {
//       toast.error("Failed to delete comment");
//     }
//   };

//   /* ================= UI ================= */

//   return (
//     <div className="flex flex-col min-h-screen">
//       <DashboardHeader />

//       <div className="flex-1 space-y-6 p-6">
//         <div className="flex items-center justify-between">
//           <h2 className="text-3xl font-bold">Marketing</h2>

//           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//             <DialogTrigger asChild>
//               <Button>
//                 <Plus className="h-4 w-4 mr-2" /> Add Marketing
//               </Button>
//             </DialogTrigger>

//             <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
//               <DialogHeader>
//                 <DialogTitle>
//                   {editingItem ? "Edit Marketing" : "Add Marketing"}
//                 </DialogTitle>
//                 <DialogDescription>Manage marketing content</DialogDescription>
//               </DialogHeader>

//               <form onSubmit={handleSubmit} className="space-y-4">
//                 {/* CATEGORY */}
//                 <div>
//                   <Label>Category</Label>
//                   <Select
//                     value={formData.categoryId}
//                     onValueChange={(v) =>
//                       setFormData({ ...formData, categoryId: v })
//                     }
//                   >
//                     <SelectTrigger>
//                       <SelectValue />
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

//                 {/* PRODUCT */}
//                 <div>
//                   <Label>Product</Label>
//                   <Select
//                     value={formData.productId}
//                     onValueChange={(v) =>
//                       setFormData({ ...formData, productId: v })
//                     }
//                   >
//                     <SelectTrigger>
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

//                 {/* DESCRIPTION */}
//                 <div>
//                   <Label>Description</Label>
//                   <Textarea
//                     value={formData.description}
//                     onChange={(e) =>
//                       setFormData({ ...formData, description: e.target.value })
//                     }
//                   />
//                 </div>

//                 {/* MEDIA */}
//                 <div>
//                   <Label>Media</Label>
//                   <Input
//                     type="file"
//                     multiple
//                     accept="image/*,video/*"
//                     onChange={handleFileChange}
//                   />

//                   <div className="grid grid-cols-3 gap-2 mt-2">
//                     {mediaPreviews.map((src, i) =>
//                       src.endsWith(".mp4") ? (
//                         <video key={i} src={src} controls />
//                       ) : (
//                         <img key={i} src={src} className="rounded" />
//                       )
//                     )}
//                   </div>
//                 </div>

//                 <DialogFooter>
//                   <Button type="submit" disabled={uploading}>
//                     {editingItem ? "Update" : "Create"}
//                   </Button>
//                 </DialogFooter>
//               </form>
//             </DialogContent>
//           </Dialog>
//         </div>

//         {/* LIST */}
//         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//           {items.map((item) => (
//             <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
//               {/* Media Section */}
//               <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
//                 {item.media_urls[0] ? (
//                   item.media_urls[0].endsWith('.mp4') ? (
//                     <video src={item.media_urls[0]} className="h-full w-full object-cover" controls />
//                   ) : (
//                     <img
//                       src={item.media_urls[0]}
//                       alt={item.product_name}
//                       className="h-full w-full object-cover"
//                     />
//                   )
//                 ) : (
//                   <div className="flex items-center justify-center h-full text-gray-400">
//                     <span className="text-sm">No Image</span>
//                   </div>
//                 )}
//                 {/* Badge Overlay (Optional) */}
//                 <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-0.5 rounded text-xs backdrop-blur-sm">
//                   {item.category_name || "Category"}
//                 </div>
//               </div>

//               <CardContent className="flex-1 p-4 flex flex-col">
//                 <div className="mb-2">
//                   <CardTitle className="text-lg line-clamp-1" title={item.product_name}>{item.product_name}</CardTitle>
//                 </div>
//                 <CardDescription className="line-clamp-3 text-sm flex-1">
//                   {item.description}
//                 </CardDescription>

//                 {/* Social Stats */}
//                 <div className="flex items-center justify-between mt-4 pt-4 border-t">
//                   <div className="flex gap-6 text-sm text-gray-600">
//                     <button 
//                       onClick={() => setCommentsOpen(item.id)} 
//                       className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
//                     >
//                       <MessageSquare className="h-4 w-4" />
//                       <span>{item.comments.length}</span>
//                     </button>

//                     <button 
//                       onClick={() => setSavesOpen(item.id)} 
//                       className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
//                     >
//                       <span>{item.saveCount || 0} saves</span>
//                     </button>

//                     <div className="flex items-center gap-1.5">
//                       <Share2 className="h-4 w-4" />
//                       <span>{item.shareCount || 0}</span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Admin/Owner Actions */}
//                 <div className="mt-3 flex items-center justify-between">
//                   <div className="flex gap-2 ml-auto">
//                     {(role === "Admin" || String(item.vendorId) === String(profileId)) && (
//                       <>
//                         <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500 hover:text-blue-600" onClick={() => handleEdit(item)}>
//                           <Edit className="h-4 w-4" />
//                         </Button>
//                         <Button
//                           size="icon"
//                           variant="ghost"
//                           className="h-8 w-8 text-gray-500 hover:text-red-600"
//                           onClick={() => handleDelete(item.id)}
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </>
//                     )}
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>

//         {/* COMMENTS DIALOG */}
//         <Dialog open={commentsOpen !== null} onOpenChange={(o) => !o && setCommentsOpen(null)}>
//           <DialogContent className="max-w-2xl">
//             <DialogHeader>
//               <DialogTitle>Comments ({items.find(i => i.id === commentsOpen)?.comments.length || 0})</DialogTitle>
//               <DialogDescription>View and manage comments on this post</DialogDescription>
//             </DialogHeader>
//             <div className="max-h-[60vh] overflow-y-auto space-y-4 p-2">
//               {items.find(i => i.id === commentsOpen)?.comments.map(c => (
//                 <div key={c.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
//                   <div className="flex-shrink-0">
//                     <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
//                       <User className="h-5 w-5 text-blue-600 dark:text-blue-300" />
//                     </div>
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-center justify-between mb-1">
//                       <div>
//                         <span className="font-semibold text-sm">{c.userType} #{c.userId}</span>
//                         <span className="text-xs text-gray-500 ml-2">{new Date(c.createdAt).toLocaleDateString()}</span>
//                       </div>
//                       {role === "Admin" && (
//                         <Button 
//                           onClick={() => handleDeleteComment(c.id)} 
//                           size="sm" 
//                           variant="ghost" 
//                           className="text-red-500 hover:text-red-700 hover:bg-red-50"
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       )}
//                     </div>
//                     <p className="text-sm text-gray-700 dark:text-gray-300">{c.text}</p>
//                   </div>
//                 </div>
//               ))}
//               {items.find(i => i.id === commentsOpen)?.comments.length === 0 && (
//                 <div className="text-center py-12">
//                   <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-3" />
//                   <p className="text-gray-500 text-sm">No comments yet</p>
//                 </div>
//               )}
//             </div>
//             {role !== "Admin" && (
//               <div className="flex gap-2 pt-4 border-t">
//                 <Input 
//                   value={newComment} 
//                   onChange={e => setNewComment(e.target.value)} 
//                   placeholder="Write a comment..." 
//                   onKeyPress={(e) => {
//                     if (e.key === 'Enter' && commentsOpen) {
//                       handleAddComment(commentsOpen);
//                     }
//                   }}
//                 />
//                 <Button size="icon" onClick={() => commentsOpen && handleAddComment(commentsOpen)}>
//                   <Send className="h-4 w-4" />
//                 </Button>
//               </div>
//             )}
//           </DialogContent>
//         </Dialog>

//         {/* SAVES DIALOG */}
//         <Dialog open={savesOpen !== null} onOpenChange={(o) => !o && setSavesOpen(null)}>
//           <DialogContent className="max-w-md">
//             <DialogHeader>
//               <DialogTitle>Saved By ({items.find(i => i.id === savesOpen)?.saves?.length || 0})</DialogTitle>
//               <DialogDescription>Users who saved this post</DialogDescription>
//             </DialogHeader>
//             <div className="max-h-[60vh] overflow-y-auto space-y-2 p-2">
//               {items.find(i => i.id === savesOpen)?.saves?.map(s => (
//                 <div key={s.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
//                   <div className="flex-shrink-0">
//                     <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
//                       <Bookmark className="h-5 w-5 text-blue-600 dark:text-blue-300" />
//                     </div>
//                   </div>
//                   <div className="flex-1">
//                     <p className="font-medium text-sm">{s.userType} #{s.userId}</p>
//                     <p className="text-xs text-gray-500">Saved this post</p>
//                   </div>
//                 </div>
//               ))}
//               {items.find(i => i.id === savesOpen)?.saves?.length === 0 && (
//                 <div className="text-center py-12">
//                   <Bookmark className="h-12 w-12 mx-auto text-gray-400 mb-3" />
//                   <p className="text-gray-500 text-sm">No saves yet</p>
//                 </div>
//               )}
//             </div>
//           </DialogContent>
//         </Dialog>

//         {/* LIKES DIALOG */}
//         <Dialog open={likesOpen !== null} onOpenChange={(o) => !o && setLikesOpen(null)}>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>Liked By</DialogTitle>
//             </DialogHeader>
//             <div className="max-h-[60vh] overflow-y-auto space-y-2">
//               {items.find(i => i.id === likesOpen)?.likes.map(l => (
//                 <div key={l.id} className="flex items-center gap-2 p-2 border rounded">
//                   <User className="h-4 w-4 text-gray-500" />
//                   <span>{l.user?.fullName}</span>
//                 </div>
//               ))}
//               {items.find(i => i.id === likesOpen)?.likes.length === 0 && <p className="text-center text-gray-500">No likes yet</p>}
//             </div>
//           </DialogContent>
//         </Dialog>
//       </div>
//     </div>
//   );
// };

// export default Marketing;


// // import { useState, useEffect, ChangeEvent } from "react";
// // import axios from "axios";
// // import { toast } from "sonner";
// // import { Plus, Edit, Trash2 } from "lucide-react";

// // import { DashboardHeader } from "@/components/DashboardHeader";
// // import { Button } from "@/components/ui/button";
// // import {
// //   Card,
// //   CardContent,
// //   CardDescription,
// //   CardTitle,
// // } from "@/components/ui/card";
// // import {
// //   Dialog,
// //   DialogContent,
// //   DialogDescription,
// //   DialogFooter,
// //   DialogHeader,
// //   DialogTitle,
// //   DialogTrigger,
// // } from "@/components/ui/dialog";
// // import { Input } from "@/components/ui/input";
// // import { Label } from "@/components/ui/label";
// // import { Textarea } from "@/components/ui/textarea";
// // import {
// //   Select,
// //   SelectTrigger,
// //   SelectContent,
// //   SelectItem,
// //   SelectValue,
// // } from "@/components/ui/select";

// // /* ================= TYPES ================= */

// // type CategoryOption = { id: number; name: string };
// // type ProductOption = { id: number; name: string };

// // type MarketingItem = {
// //   id: number;
// //   category_id: number;
// //   category_name: string;
// //   product_id?: number;
// //   product_name?: string;
// //   description: string;
// //   media_urls: string[];
// // };

// // type ProductsResponse = {
// //   items: { id: number; label: string }[];
// //   total: number;
// // };

// // const API_BASE = "http://192.168.1.36:3064";

// // /* ================= COMPONENT ================= */

// // const Marketing = () => {
// //   const [categories, setCategories] = useState<CategoryOption[]>([]);
// //   const [products, setProducts] = useState<ProductOption[]>([]);
// //   const [items, setItems] = useState<MarketingItem[]>([]);
// //   const [isDialogOpen, setIsDialogOpen] = useState(false);
// //   const [editingItem, setEditingItem] = useState<MarketingItem | null>(null);
// //   const [isLoading, setIsLoading] = useState(true);
// //   const [uploading, setUploading] = useState(false);

// //   const [formData, setFormData] = useState({
// //     category_id: "",
// //     product_id: "",
// //     description: "",
// //     media_files: [] as File[],
// //   });

// //   const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);

// //   const role = localStorage.getItem("role");
// //   const profileId = localStorage.getItem("profileId");
// //   /* ================= LOAD DATA ================= */

// //   useEffect(() => {
// //     fetchCategories();
// //     fetchProducts();
// //     fetchMarketingItems();
// //   }, []);

// //   const fetchCategories = async () => {
// //     try {
// //       const res = await axios.get<CategoryOption[]>(
// //         `${API_BASE}/categories/get-categories`
// //       );
// //       setCategories(res.data);
// //     } catch {
// //       toast.error("Failed to load categories");
// //     }
// //   };

// //   const fetchProducts = async () => {

// //     let url = `http://192.168.1.36:3064/products?page=1&limit=500`;
// //     if (role != "Admin") url += `&vendorId=2`;

// //     try {
// //       const res = await axios.get<ProductsResponse>(
// //         url
// //       );

// //       setProducts(
// //         res.data.items.map((p) => ({ id: p.id, name: p.label }))
// //       );
// //     } catch {
// //       toast.error("Failed to load products");
// //     }
// //   };

// //   /* ================= NORMALIZED MARKETING LIST ================= */

// //   const fetchMarketingItems = async () => {
// //     try {
// //       const res = await axios.get(`${API_BASE}/marketing`);

// //       const normalized: MarketingItem[] = res.data.map((item: any) => ({
// //         id: item.id,
// //         category_id: item.category?.id,
// //         category_name: item.category?.name,
// //         product_id: item.product?.id,
// //         product_name: item.product?.label,
// //         description: item.description,
// //         media_urls: item.media?.map((m: any) => m.fileUrl) || [],
// //       }));

// //       setItems(normalized);
// //     } catch {
// //       toast.error("Failed to load marketing items");
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   /* ================= FORM HELPERS ================= */

// //   const resetForm = () => {
// //     setFormData({
// //       category_id: "",
// //       product_id: "",
// //       description: "",
// //       media_files: [],
// //     });
// //     setMediaPreviews([]);
// //     setEditingItem(null);
// //   };

// //   const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
// //     if (!e.target.files) return;

// //     const files = Array.from(e.target.files);
// //     setFormData({ ...formData, media_files: files });
// //     setMediaPreviews(files.map((f) => URL.createObjectURL(f)));
// //   };

// //   /* ================= CREATE / UPDATE ================= */

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();

// //     if (!formData.category_id || !formData.product_id) {
// //       return toast.error("Category & Product are required");
// //     }

// //     try {
// //       setUploading(true);
// //       const data = new FormData();

// //       data.append("categoryId", formData.category_id);
// //       data.append("productId", formData.product_id);
// //       data.append("description", formData.description);

// //       formData.media_files.forEach((file) =>
// //         data.append("media_files", file)
// //       );

// //       if (editingItem) {
// //         await axios.patch(
// //           `${API_BASE}/marketing/${editingItem.id}`,
// //           data
// //         );
// //         toast.success("Marketing updated");
// //       } else {
// //         await axios.post(`${API_BASE}/marketing`, data);
// //         toast.success("Marketing created");
// //       }

// //       fetchMarketingItems();
// //       setIsDialogOpen(false);
// //       resetForm();
// //     } catch {
// //       toast.error("Failed to save marketing");
// //     } finally {
// //       setUploading(false);
// //     }
// //   };

// //   /* ================= EDIT / DELETE ================= */

// //   const handleEdit = (item: MarketingItem) => {
// //     setEditingItem(item);
// //     setFormData({
// //       category_id: String(item.category_id),
// //       product_id: item.product_id ? String(item.product_id) : "",
// //       description: item.description,
// //       media_files: [],
// //     });
// //     setMediaPreviews(item.media_urls);
// //     setIsDialogOpen(true);
// //   };

// //   const handleDelete = async (id: number) => {
// //     if (!confirm("Delete this marketing item?")) return;

// //     try {
// //       await axios.delete(`${API_BASE}/marketing/${id}`);
// //       setItems((prev) => prev.filter((i) => i.id !== id));
// //       toast.success("Deleted");
// //     } catch {
// //       toast.error("Delete failed");
// //     }
// //   };

// //   /* ================= UI ================= */

// //   return (
// //     <div className="flex flex-col min-h-screen">
// //       <DashboardHeader />

// //       <div className="flex-1 space-y-6 p-6">
// //         <div className="flex items-center justify-between">
// //           <div>
// //             <h2 className="text-3xl font-bold">Marketing</h2>
// //             <p className="text-muted-foreground">Manage marketing content</p>
// //           </div>
// //           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
// //             <DialogTrigger asChild>
// //               <Button className="gap-2 w-full sm:w-auto">
// //                 <Plus className="h-4 w-4" /> Add Marketing
// //               </Button>
// //             </DialogTrigger>

// //             <DialogContent
// //               className="
// //       w-[95vw]
// //       max-w-lg
// //       sm:rounded-lg
// //       max-h-[90vh]
// //       overflow-y-auto
// //     "
// //             >
// //               <DialogHeader>
// //                 <DialogTitle>
// //                   {editingItem ? "Edit Marketing" : "Add Marketing"}
// //                 </DialogTitle>
// //                 <DialogDescription>
// //                   Manage marketing content
// //                 </DialogDescription>
// //               </DialogHeader>

// //               <form onSubmit={handleSubmit} className="space-y-4">
// //                 {/* Category */}
// //                 <div className="space-y-1">
// //                   <Label>Category</Label>
// //                   <Select
// //                     value={formData.category_id}
// //                     onValueChange={(v) =>
// //                       setFormData({ ...formData, category_id: v })
// //                     }
// //                   >
// //                     <SelectTrigger className="w-full">
// //                       <SelectValue placeholder="Select category" />
// //                     </SelectTrigger>
// //                     <SelectContent>
// //                       {categories.map((c) => (
// //                         <SelectItem key={c.id} value={String(c.id)}>
// //                           {c.name}
// //                         </SelectItem>
// //                       ))}
// //                     </SelectContent>
// //                   </Select>
// //                 </div>

// //                 {/* Product */}
// //                 <div className="space-y-1">
// //                   <Label>Product</Label>
// //                   <Select
// //                     value={formData.product_id}
// //                     onValueChange={(v) =>
// //                       setFormData({ ...formData, product_id: v })
// //                     }
// //                   >
// //                     <SelectTrigger className="w-full">
// //                       <SelectValue placeholder="Select product" />
// //                     </SelectTrigger>
// //                     <SelectContent>
// //                       {products.map((p) => (
// //                         <SelectItem key={p.id} value={String(p.id)}>
// //                           {p.name}
// //                         </SelectItem>
// //                       ))}
// //                     </SelectContent>
// //                   </Select>
// //                 </div>

// //                 {/* Description */}
// //                 <div className="space-y-1">
// //                   <Label>Description</Label>
// //                   <Textarea
// //                     rows={4}
// //                     className="w-full resize-none"
// //                     value={formData.description}
// //                     onChange={(e) =>
// //                       setFormData({
// //                         ...formData,
// //                         description: e.target.value,
// //                       })
// //                     }
// //                   />
// //                 </div>

// //                 {/* Media */}
// //                 <div className="space-y-2">
// //                   <Label>Media</Label>
// //                   <Input
// //                     type="file"
// //                     multiple
// //                     accept="image/*,video/*"
// //                     onChange={handleFileChange}
// //                   />

// //                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
// //                     {mediaPreviews.map((src, i) =>
// //                       src.endsWith(".mp4") ? (
// //                         <video
// //                           key={i}
// //                           src={src}
// //                           controls
// //                           className="rounded aspect-square object-cover"
// //                         />
// //                       ) : (
// //                         <img
// //                           key={i}
// //                           src={src}
// //                           className="rounded aspect-square object-cover"
// //                         />
// //                       )
// //                     )}
// //                   </div>
// //                 </div>

// //                 <DialogFooter className="pt-2">
// //                   <Button
// //                     type="submit"
// //                     className="w-full sm:w-auto"
// //                     disabled={uploading}
// //                   >
// //                     {editingItem ? "Update" : "Create"}
// //                   </Button>
// //                 </DialogFooter>
// //               </form>
// //             </DialogContent>
// //           </Dialog>

// //         </div>

// //         {/* LIST */}
// //         {isLoading ? (
// //           <p>Loading...</p>
// //         ) : (
// //           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
// //             {items.map((item) => (
// //               <Card key={item.id}>
// //                 {item.media_urls.length > 0 && (
// //                   <img
// //                     src={item.media_urls[0]}
// //                     className="h-40 w-full object-cover"
// //                   />
// //                 )}

// //                 <CardContent>
// //                   <CardTitle>{item.product_name}</CardTitle>
// //                   <CardDescription>{item.description}</CardDescription>

// //                   <div className="flex gap-2 mt-3">
// //                     <Button size="sm" onClick={() => handleEdit(item)}>
// //                       <Edit className="h-4 w-4" />
// //                     </Button>
// //                     <Button
// //                       size="sm"
// //                       variant="destructive"
// //                       onClick={() => handleDelete(item.id)}
// //                     >
// //                       <Trash2 className="h-4 w-4" />
// //                     </Button>
// //                   </div>
// //                 </CardContent>
// //               </Card>
// //             ))}
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// // export default Marketing;

// // import { useState, useEffect, ChangeEvent } from "react";
// // import axios from "axios";
// // import { toast } from "sonner";
// // import { Plus, Edit, Trash2 } from "lucide-react";

// // import { DashboardHeader } from "@/components/DashboardHeader";
// // import { Button } from "@/components/ui/button";
// // import {
// //   Card,
// //   CardContent,
// //   CardDescription,
// //   CardTitle,
// // } from "@/components/ui/card";
// // import {
// //   Dialog,
// //   DialogContent,
// //   DialogDescription,
// //   DialogFooter,
// //   DialogHeader,
// //   DialogTitle,
// //   DialogTrigger,
// // } from "@/components/ui/dialog";
// // import { Input } from "@/components/ui/input";
// // import { Label } from "@/components/ui/label";
// // import { Textarea } from "@/components/ui/textarea";
// // import {
// //   Select,
// //   SelectTrigger,
// //   SelectContent,
// //   SelectItem,
// //   SelectValue,
// // } from "@/components/ui/select";

// // type CategoryOption = { id: number; name: string };
// // type ProductOption = { id: number; name: string };
// // type MarketingItem = {
// //   id: number;
// //   category_id: number;
// //   category_name: string;
// //   product_id?: number;
// //   product_name?: string;
// //   description: string;
// //   media_urls: string[];
// // };

// // type ProductsResponse = {
// //   items: {
// //     id: number;
// //     label: string;
// //   }[];
// //   total: number;
// // };

// // const API_BASE = "http://192.168.1.36:3064";

// // const Marketing = () => {
// //   const [categories, setCategories] = useState<CategoryOption[]>([]);
// //   const [products, setProducts] = useState<ProductOption[]>([]);
// //   const [items, setItems] = useState<MarketingItem[]>([]);
// //   const [isDialogOpen, setIsDialogOpen] = useState(false);
// //   const [editingItem, setEditingItem] = useState<MarketingItem | null>(null);
// //   const [formData, setFormData] = useState({
// //     category_id: "",
// //     product_id: "",
// //     description: "",
// //     media_files: [] as File[],
// //   });
// //   const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
// //   const [uploading, setUploading] = useState(false);
// //   const [isLoading, setIsLoading] = useState(true);

// //   useEffect(() => {
// //     fetchCategories();
// //     fetchProducts();
// //     fetchMarketingItems();
// //   }, []);

// //   const fetchCategories = async () => {
// //     try {
// //       const res = await axios.get<CategoryOption[]>(`${API_BASE}/categories/get-categories`);
// //       setCategories(res.data);
// //     } catch (err) {
// //       console.error(err);
// //       toast.error("Failed to load categories");
// //     }
// //   };

// //   const fetchProducts = async () => {
// //     try {
// //       const res = await axios.get<ProductsResponse>(
// //         `${API_BASE}/products?page=1&limit=50`
// //       );

// //       const productOptions = res.data.items.map((p) => ({
// //         id: p.id,
// //         name: p.label,
// //       }));

// //       setProducts(productOptions);
// //     } catch (err) {
// //       console.error(err);
// //       toast.error("Failed to load products");
// //     }
// //   };


// //   const fetchMarketingItems = async () => {
// //     try {
// //       const res = await axios.get<MarketingItem[]>(`${API_BASE}/marketing`);
// //       setItems(res.data);
// //     } catch (err) {
// //       console.error(err);
// //       toast.error("Failed to load marketing items");
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   const resetForm = () => {
// //     setFormData({
// //       category_id: "",
// //       product_id: "",
// //       description: "",
// //       media_files: [],
// //     });
// //     setMediaPreviews([]);
// //     setEditingItem(null);
// //   };

// //   const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
// //     if (!e.target.files) return;
// //     const files = Array.from(e.target.files);
// //     setFormData({ ...formData, media_files: files });
// //     setMediaPreviews(files.map(f => URL.createObjectURL(f)));
// //   };

// //   // ✅ Handle submit: use FormData for dynamic API integration
// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     if (!formData.category_id) return toast.error("Select a category");
// //     if (!formData.product_id) return toast.error("Select a product");

// //     try {
// //       setUploading(true);
// //       const data = new FormData();
// //       // data.append("category_id", formData.category_id);
// //       // data.append("product_id", formData.product_id);
// //       data.append("categoryId", Number(formData.category_id).toString());
// //       data.append("productId", Number(formData.product_id).toString());
// //       data.append("description", formData.description);

// //       formData.media_files.forEach(file => data.append("media_files", file));

// //       if (editingItem) {
// //         await axios.patch(`${API_BASE}/marketing/${editingItem.id}`, data, {
// //           headers: { "Content-Type": "multipart/form-data" },
// //         });
// //         toast.success("Marketing item updated");
// //       } else {
// //         await axios.post(`${API_BASE}/marketing`, data, {
// //           headers: { "Content-Type": "multipart/form-data" },
// //         });
// //         toast.success("Marketing item added");
// //       }

// //       fetchMarketingItems();
// //       setIsDialogOpen(false);
// //       resetForm();
// //     } catch (err) {
// //       console.error(err);
// //       toast.error("Failed to save marketing item");
// //     } finally {
// //       setUploading(false);
// //     }
// //   };

// //   const handleEdit = (item: MarketingItem) => {
// //     setEditingItem(item);
// //     setFormData({
// //       category_id: String(item.category_id),
// //       product_id: item.product_id ? String(item.product_id) : "",
// //       description: item.description,
// //       media_files: [],
// //     });
// //     setMediaPreviews(item.media_urls);
// //     setIsDialogOpen(true);
// //   };

// //   const handleDelete = async (id: number) => {
// //     if (!confirm("Are you sure you want to delete this item?")) return;
// //     try {
// //       await axios.delete(`${API_BASE}/marketing/${id}`);
// //       setItems(items.filter(i => i.id !== id));
// //       toast.success("Marketing item deleted");
// //     } catch (err) {
// //       console.error(err);
// //       toast.error("Failed to delete item");
// //     }
// //   };

// //   return (
// //     <div className="flex flex-col min-h-screen">
// //       <DashboardHeader />
// //       <div className="flex-1 space-y-6 p-6">
// //         <div className="flex items-center justify-between">
// //           <div>
// //             <h2 className="text-3xl font-bold tracking-tight">Marketing</h2>
// //             <p className="text-muted-foreground">Manage marketing content</p>
// //           </div>

// //           <Dialog
// //             open={isDialogOpen}
// //             onOpenChange={(open) => {
// //               setIsDialogOpen(open);
// //               if (!open) resetForm();
// //             }}
// //           >
// //             <DialogTrigger asChild>
// //               <Button className="gap-2">
// //                 <Plus className="h-4 w-4" />
// //                 Add Marketing
// //               </Button>
// //             </DialogTrigger>
// //             <DialogContent className="max-w-lg">
// //               <DialogHeader>
// //                 <DialogTitle>{editingItem ? "Edit Marketing" : "Add Marketing"}</DialogTitle>
// //                 <DialogDescription>
// //                   {editingItem ? "Update marketing content" : "Create new marketing content"}
// //                 </DialogDescription>
// //               </DialogHeader>

// //               <form onSubmit={handleSubmit}>
// //                 <div className="grid gap-4 py-4">
// //                   {/* Category */}
// //                   <div className="grid gap-2">
// //                     <Label htmlFor="category">Category</Label>
// //                     <Select
// //                       value={formData.category_id}
// //                       onValueChange={(val) =>
// //                         setFormData({ ...formData, category_id: val })
// //                       }
// //                     >
// //                       <SelectTrigger>
// //                         <SelectValue placeholder="Select category" />
// //                       </SelectTrigger>
// //                       <SelectContent>
// //                         {categories.map((cat) => (
// //                           <SelectItem key={cat.id} value={String(cat.id)}>
// //                             {cat.name}
// //                           </SelectItem>
// //                         ))}
// //                       </SelectContent>
// //                     </Select>
// //                   </div>

// //                   {/* Product */}
// //                   <div className="grid gap-2">
// //                     <Label htmlFor="product">Product</Label>
// //                     <Select
// //                       value={formData.product_id}
// //                       onValueChange={(val) =>
// //                         setFormData({ ...formData, product_id: val })
// //                       }
// //                       required
// //                     >
// //                       <SelectTrigger>
// //                         <SelectValue placeholder="Select product" />
// //                       </SelectTrigger>
// //                       <SelectContent>
// //                         {products.map((prod) => (
// //                           <SelectItem key={prod.id} value={String(prod.id)}>
// //                             {prod.name}
// //                           </SelectItem>
// //                         ))}
// //                       </SelectContent>
// //                     </Select>
// //                   </div>

// //                   {/* Description */}
// //                   <div className="grid gap-2">
// //                     <Label htmlFor="description">Description</Label>
// //                     <Textarea
// //                       id="description"
// //                       value={formData.description}
// //                       onChange={(e) =>
// //                         setFormData({ ...formData, description: e.target.value })
// //                       }
// //                       placeholder="Enter content description"
// //                     />
// //                   </div>

// //                   {/* Media */}
// //                   <div className="grid gap-2">
// //                     <Label htmlFor="media">Upload Media (Images/Videos)</Label>
// //                     <Input
// //                       type="file"
// //                       accept="image/*,video/*"
// //                       multiple
// //                       onChange={handleFileChange}
// //                     />
// //                     {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
// //                     <div className="grid grid-cols-3 gap-2 mt-2">
// //                       {mediaPreviews.map((src, idx) => {
// //                         const isVideo = src.endsWith(".mp4") || src.endsWith(".mov");
// //                         return isVideo ? (
// //                           <video
// //                             key={idx}
// //                             src={src}
// //                             className="w-full h-24 object-cover rounded"
// //                             controls
// //                           />
// //                         ) : (
// //                           <img
// //                             key={idx}
// //                             src={src}
// //                             className="w-full h-24 object-cover rounded"
// //                           />
// //                         );
// //                       })}
// //                     </div>
// //                   </div>
// //                 </div>

// //                 <DialogFooter>
// //                   <Button
// //                     type="button"
// //                     variant="outline"
// //                     onClick={() => setIsDialogOpen(false)}
// //                   >
// //                     Cancel
// //                   </Button>
// //                   <Button type="submit">{editingItem ? "Update" : "Add"}</Button>
// //                 </DialogFooter>
// //               </form>
// //             </DialogContent>
// //           </Dialog>
// //         </div>

// //         {isLoading ? (
// //           <p>Loading marketing items...</p>
// //         ) : (
// //           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
// //             {items.map((item) => (
// //               <Card key={item.id} className="relative">
// //                 {item.media_urls.length > 0 && (
// //                   <div className="grid grid-cols-2 gap-1">
// //                     {item.media_urls.map((url, idx) => {
// //                       const isVideo = url.endsWith(".mp4") || url.endsWith(".mov");
// //                       return isVideo ? (
// //                         <video
// //                           key={idx}
// //                           src={url}
// //                           className="w-full h-32 object-cover rounded-t-lg"
// //                           controls
// //                         />
// //                       ) : (
// //                         <img
// //                           key={idx}
// //                           src={url}
// //                           className="w-full h-32 object-cover rounded-t-lg"
// //                         />
// //                       );
// //                     })}
// //                   </div>
// //                 )}
// //                 <CardContent>
// //                   <div className="flex items-center justify-between">
// //                     <div>
// //                       <CardTitle className="text-xl">{item.category_name}</CardTitle>
// //                       {item.product_name && (
// //                         <CardDescription className="text-sm">
// //                           Product: {item.product_name}
// //                         </CardDescription>
// //                       )}
// //                       <CardDescription className="text-sm">{item.description}</CardDescription>
// //                     </div>
// //                     <div className="flex gap-2">
// //                       <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
// //                         <Edit className="h-4 w-4" />
// //                       </Button>
// //                       <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
// //                         <Trash2 className="h-4 w-4 text-destructive" />
// //                       </Button>
// //                     </div>
// //                   </div>
// //                 </CardContent>
// //               </Card>
// //             ))}
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// // export default Marketing;

// // import { useState, useEffect, ChangeEvent } from "react";
// // import axios from "axios";
// // import { toast } from "sonner";
// // import { Plus, Edit, Trash2 } from "lucide-react";

// // import { DashboardHeader } from "@/components/DashboardHeader";
// // import { Button } from "@/components/ui/button";
// // import {
// //   Card,
// //   CardContent,
// //   CardDescription,
// //   CardTitle,
// // } from "@/components/ui/card";
// // import {
// //   Dialog,
// //   DialogContent,
// //   DialogDescription,
// //   DialogFooter,
// //   DialogHeader,
// //   DialogTitle,
// //   DialogTrigger,
// // } from "@/components/ui/dialog";
// // import { Input } from "@/components/ui/input";
// // import { Label } from "@/components/ui/label";
// // import { Textarea } from "@/components/ui/textarea";
// // import {
// //   Select,
// //   SelectTrigger,
// //   SelectContent,
// //   SelectItem,
// //   SelectValue,
// // } from "@/components/ui/select";

// // type CategoryOption = { id: number; name: string };
// // type ProductOption = { id: number; name: string };
// // type MarketingItem = {
// //   id: number;
// //   category_id: number;
// //   category_name: string;
// //   product_id?: number;
// //   product_name?: string;
// //   description: string;
// //   media_urls: string[];
// // };

// // const Marketing = () => {
// //   const [categories, setCategories] = useState<CategoryOption[]>([]);
// //   const [products, setProducts] = useState<ProductOption[]>([]);
// //   const [items, setItems] = useState<MarketingItem[]>([]);
// //   const [isDialogOpen, setIsDialogOpen] = useState(false);
// //   const [editingItem, setEditingItem] = useState<MarketingItem | null>(null);
// //   const [formData, setFormData] = useState({
// //     category_id: "",
// //     product_id: "",
// //     description: "",
// //     media_files: [] as File[],
// //   });
// //   const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
// //   const [uploading, setUploading] = useState(false);
// //   const [isLoading, setIsLoading] = useState(true);

// //   useEffect(() => {
// //     fetchCategories();
// //     fetchProducts();
// //     fetchMarketingItems();
// //   }, []);

// //   const fetchCategories = async () => {
// //     try {
// //       const response = await axios.get<CategoryOption[]>(
// //        "http://192.168.1.36:3064/categories/get-categories"
// //       );
// //       setCategories(response.data);
// //     } catch (err) {
// //       console.error(err);
// //       toast.error("Failed to load categories");
// //     }
// //   };

// // /*   const fetchProducts = async () => {
// //     try {
// //       const response = await axios.get<ProductOption[]>(
// //         "http://192.168.1.36:3064/products?page=1&limit=10"
// //       );
// //       setProducts(response.data);
// //     } catch (err) {
// //       console.error(err);
// //       toast.error("Failed to load products");
// //     }
// //   }; */
// //   const fetchProducts = async () => {
// //   try {
// //     const response = await axios.get(
// //       "http://192.168.1.36:3064/products?page=1&limit=50"
// //     );

// //     const productOptions = response.data.items.map((p: any) => ({
// //       id: p.id,
// //       name: p.label, // API uses "label" for product name
// //     }));

// //     setProducts(productOptions);
// //   } catch (err) {
// //     console.error(err);
// //     toast.error("Failed to load products");
// //   }
// // };


// //   const fetchMarketingItems = async () => {
// //     try {
// //       const response = await axios.get<MarketingItem[]>(
// //         "http://192.168.1.36:3064/marketing/get-items"
// //       );
// //       setItems(response.data);
// //     } catch (err) {
// //       console.error(err);
// //       toast.error("Failed to load marketing items");
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   const resetForm = () => {
// //     setFormData({
// //       category_id: "",
// //       product_id: "",
// //       description: "",
// //       media_files: [],
// //     });
// //     setMediaPreviews([]);
// //     setEditingItem(null);
// //   };

// //   const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
// //     if (!e.target.files) return;
// //     const files = Array.from(e.target.files);
// //     setFormData({ ...formData, media_files: files });

// //     const previews = files.map((file) => URL.createObjectURL(file));
// //     setMediaPreviews(previews);
// //   };

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     if (!formData.category_id) return toast.error("Select a category");
// //     if (!formData.product_id) return toast.error("Select a product");

// //     try {
// //       setUploading(true);

// //       const media_urls: string[] = [];
// //       for (const file of formData.media_files) {
// //         const data = new FormData();
// //         data.append("file", file);
// //         const res = await axios.post<{ fileUrl: string }>(
// //           "http://192.168.1.36:3064/files/upload",
// //           data,
// //           { headers: { "Content-Type": "multipart/form-data" } }
// //         );
// //         media_urls.push(res.data.fileUrl);
// //       }

// //       const payload = {
// //         category_id: formData.category_id,
// //         product_id: formData.product_id,
// //         description: formData.description,
// //         media_urls,
// //       };

// //       if (editingItem) {
// //         await axios.patch(
// //           `http://192.168.1.36:3064/marketing/${editingItem.id}`,
// //           payload
// //         );
// //         toast.success("Marketing item updated");
// //       } else {
// //         await axios.post(
// //           "http://192.168.1.36:3064/marketing",
// //           payload
// //         );
// //         toast.success("Marketing item added");
// //       }

// //       fetchMarketingItems();
// //       setIsDialogOpen(false);
// //       resetForm();
// //     } catch (err) {
// //       console.error(err);
// //       toast.error("Failed to save marketing item");
// //     } finally {
// //       setUploading(false);
// //     }
// //   };

// //   const handleEdit = (item: MarketingItem) => {
// //     setEditingItem(item);
// //     setFormData({
// //       category_id: String(item.category_id),
// //       product_id: item.product_id ? String(item.product_id) : "",
// //       description: item.description,
// //       media_files: [],
// //     });
// //     setMediaPreviews(item.media_urls);
// //     setIsDialogOpen(true);
// //   };

// //   const handleDelete = async (id: number) => {
// //     if (!confirm("Are you sure you want to delete this item?")) return;
// //     try {
// //       await axios.delete(`http://192.168.1.36:3064/marketing/${id}`);
// //       setItems(items.filter((i) => i.id !== id));
// //       toast.success("Marketing item deleted");
// //     } catch (err) {
// //       console.error(err);
// //       toast.error("Failed to delete item");
// //     }
// //   };

// //   return (
// //     <div className="flex flex-col min-h-screen">
// //       <DashboardHeader />
// //       <div className="flex-1 space-y-6 p-6">
// //         <div className="flex items-center justify-between">
// //           <div>
// //             <h2 className="text-3xl font-bold tracking-tight">Marketing</h2>
// //             <p className="text-muted-foreground">Manage marketing content</p>
// //           </div>

// //           <Dialog
// //             open={isDialogOpen}
// //             onOpenChange={(open) => {
// //               setIsDialogOpen(open);
// //               if (!open) resetForm();
// //             }}
// //           >
// //             <DialogTrigger asChild>
// //               <Button className="gap-2">
// //                 <Plus className="h-4 w-4" />
// //                 Add Marketing
// //               </Button>
// //             </DialogTrigger>
// //             <DialogContent className="max-w-lg">
// //               <DialogHeader>
// //                 <DialogTitle>{editingItem ? "Edit Marketing" : "Add Marketing"}</DialogTitle>
// //                 <DialogDescription>
// //                   {editingItem ? "Update marketing content" : "Create new marketing content"}
// //                 </DialogDescription>
// //               </DialogHeader>

// //               <form onSubmit={handleSubmit}>
// //                 <div className="grid gap-4 py-4">
// //                   {/* Category */}
// //                   <div className="grid gap-2">
// //                     <Label htmlFor="category">Category</Label>
// //                     <Select
// //                       value={formData.category_id}
// //                       onValueChange={(val) =>
// //                         setFormData({ ...formData, category_id: val })
// //                       }
// //                     >
// //                       <SelectTrigger>
// //                         <SelectValue placeholder="Select category" />
// //                       </SelectTrigger>
// //                       <SelectContent>
// //                         {categories.map((cat) => (
// //                           <SelectItem key={cat.id} value={String(cat.id)}>
// //                             {cat.name}
// //                           </SelectItem>
// //                         ))}
// //                       </SelectContent>
// //                     </Select>
// //                   </div>

// //                   {/* Product */}
// //                   <div className="grid gap-2">
// //                     <Label htmlFor="product">Product</Label>
// //                     <Select
// //                       value={formData.product_id}
// //                       onValueChange={(val) => setFormData({ ...formData, product_id: val })}
// //                       required
// //                     >
// //                       <SelectTrigger>
// //                         <SelectValue placeholder="Select product" />
// //                       </SelectTrigger>
// //                       <SelectContent>
// //                         {products.map((prod) => (
// //                           <SelectItem key={prod.id} value={String(prod.id)}>
// //                             {prod.name}
// //                           </SelectItem>
// //                         ))}
// //                       </SelectContent>
// //                     </Select>
// //                   </div>

// //                   {/* Description */}
// //                   <div className="grid gap-2">
// //                     <Label htmlFor="description">Description</Label>
// //                     <Textarea
// //                       id="description"
// //                       value={formData.description}
// //                       onChange={(e) =>
// //                         setFormData({ ...formData, description: e.target.value })
// //                       }
// //                       placeholder="Enter content description"
// //                     />
// //                   </div>

// //                   {/* Media */}
// //                   <div className="grid gap-2">
// //                     <Label htmlFor="media">Upload Media (Images/Videos)</Label>
// //                     <Input
// //                       type="file"
// //                       accept="image/*,video/*"
// //                       multiple
// //                       onChange={handleFileChange}
// //                     />
// //                     {uploading && (
// //                       <p className="text-sm text-muted-foreground">Uploading...</p>
// //                     )}
// //                     <div className="grid grid-cols-3 gap-2 mt-2">
// //                       {mediaPreviews.map((src, idx) => {
// //                         const isVideo = src.endsWith(".mp4") || src.endsWith(".mov");
// //                         return isVideo ? (
// //                           <video
// //                             key={idx}
// //                             src={src}
// //                             className="w-full h-24 object-cover rounded"
// //                             controls
// //                           />
// //                         ) : (
// //                           <img
// //                             key={idx}
// //                             src={src}
// //                             className="w-full h-24 object-cover rounded"
// //                           />
// //                         );
// //                       })}
// //                     </div>
// //                   </div>
// //                 </div>

// //                 <DialogFooter>
// //                   <Button
// //                     type="button"
// //                     variant="outline"
// //                     onClick={() => setIsDialogOpen(false)}
// //                   >
// //                     Cancel
// //                   </Button>
// //                   <Button type="submit">{editingItem ? "Update" : "Add"}</Button>
// //                 </DialogFooter>
// //               </form>
// //             </DialogContent>
// //           </Dialog>
// //         </div>

// //         {isLoading ? (
// //           <p>Loading marketing items...</p>
// //         ) : (
// //           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
// //             {items.map((item) => (
// //               <Card key={item.id} className="relative">
// //                 {item.media_urls.length > 0 && (
// //                   <div className="grid grid-cols-2 gap-1">
// //                     {item.media_urls.map((url, idx) => {
// //                       const isVideo = url.endsWith(".mp4") || url.endsWith(".mov");
// //                       return isVideo ? (
// //                         <video
// //                           key={idx}
// //                           src={url}
// //                           className="w-full h-32 object-cover rounded-t-lg"
// //                           controls
// //                         />
// //                       ) : (
// //                         <img
// //                           key={idx}
// //                           src={url}
// //                           className="w-full h-32 object-cover rounded-t-lg"
// //                         />
// //                       );
// //                     })}
// //                   </div>
// //                 )}
// //                 <CardContent>
// //                   <div className="flex items-center justify-between">
// //                     <div>
// //                       <CardTitle className="text-xl">{item.category_name}</CardTitle>
// //                       {item.product_name && (
// //                         <CardDescription className="text-sm">
// //                           Product: {item.product_name}
// //                         </CardDescription>
// //                       )}
// //                       <CardDescription className="text-sm">{item.description}</CardDescription>
// //                     </div>
// //                     <div className="flex gap-2">
// //                       <Button
// //                         variant="outline"
// //                         size="sm"
// //                         onClick={() => handleEdit(item)}
// //                       >
// //                         <Edit className="h-4 w-4" />
// //                       </Button>
// //                       <Button
// //                         variant="outline"
// //                         size="sm"
// //                         onClick={() => handleDelete(item.id)}
// //                       >
// //                         <Trash2 className="h-4 w-4 text-destructive" />
// //                       </Button>
// //                     </div>
// //                   </div>
// //                 </CardContent>
// //               </Card>
// //             ))}
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// // export default Marketing;

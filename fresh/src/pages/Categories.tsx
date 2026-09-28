import { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Upload } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { Package } from "lucide-react";

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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type Category = {
  id: number;
  name: string;
  label: string;
  is_active: boolean;
  img_link?: string | null;
};

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    label: "",
    img_link: "",
    is_active: true,
  });

  const [uploading, setUploading] = useState(false);

  // View Products state
  const [isProductsModalOpen, setIsProductsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get<Category[]>(
        `${API_BASE_URL}/categories/get-categories`
      );
      setCategories(response.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", label: "", img_link: "", is_active: true });
    setEditingCategory(null);
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const data = new FormData();
    data.append("file", file);

    try {
      setUploading(true);
      // Replace with your image upload API
      const response = await axios.post<{ fileUrl: string }>(
        `${API_BASE_URL}/files/upload`,
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setFormData({ ...formData, img_link: response.data.fileUrl });
      toast.success("Image uploaded successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        // Update
        await axios.patch(
          `${API_BASE_URL}/categories/${editingCategory.id}`,
          formData
        );
        toast.success("Category updated successfully");
      } else {
        // Create
        await axios.post(
          `${API_BASE_URL}/categories`,
          formData
        );
        toast.success("Category added successfully");
      }
      fetchCategories();
      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save category");
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      label: category.label,
      img_link: category.img_link || "",
      is_active: category.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await axios.delete(
        `${API_BASE_URL}/categories/${id}`
      );
      setCategories(categories.filter((c) => c.id !== id));
      toast.success("Category deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete category");
    }
  };

  const handleViewProducts = async (category: Category) => {
    setSelectedCategory(category);
    setIsProductsModalOpen(true);
    setIsLoadingProducts(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/products?categoryId=${category.id}&page=1&limit=500`);
      setCategoryProducts(res.data.items || []);
    } catch (err) {
      toast.error("Failed to load products for this category");
    } finally {
      setIsLoadingProducts(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
            <p className="text-muted-foreground">
              Manage product categories
            </p>
          </div>

          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </DialogTitle>
                <DialogDescription>
                  {editingCategory
                    ? "Update category details"
                    : "Create a new product category"}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Category Name"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="label">Label</Label>
                    <Input
                      id="label"
                      value={formData.label}
                      onChange={(e) =>
                        setFormData({ ...formData, label: e.target.value })
                      }
                      placeholder="Category Label"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="img_link">Image URL or Upload</Label>
                    <Input
                      id="img_link"
                      value={formData.img_link}
                      onChange={(e) =>
                        setFormData({ ...formData, img_link: e.target.value })
                      }
                      placeholder="Paste image URL or upload below"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="mt-2"
                    />
                    {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_active: checked })
                      }
                    />
                    <span className="text-sm">Active</span>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingCategory ? "Update" : "Add"} Category
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <p>Loading categories...</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Card 
                key={category.id} 
                className="relative cursor-pointer hover:shadow-md hover:border-green-300 transition-all"
                onClick={() => handleViewProducts(category)}
              >
                {category.img_link && (
                  <img
                    src={category.img_link}
                    alt={category.name}
                    className="w-full h-40 object-cover rounded-t-lg"
                  />
                )}
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{category.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {category.label}
                      </CardDescription>
                      <p className="text-xs text-muted-foreground">
                        {category.is_active ? "Active" : "Inactive"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleEdit(category); }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleDelete(category.id); }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* View Products Dialog */}
        <Dialog open={isProductsModalOpen} onOpenChange={setIsProductsModalOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-green-600" />
                Products in '{selectedCategory?.name}'
              </DialogTitle>
              <DialogDescription>
                Viewing all products mapped to this category.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {isLoadingProducts ? (
                <div className="text-center py-10 text-muted-foreground">Loading products...</div>
              ) : categoryProducts.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  No products found in this category.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {categoryProducts.map(product => (
                    <div key={product.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      {product.productUrl ? (
                        <img src={product.productUrl} alt={product.label} className="w-12 h-12 rounded-md object-cover border" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center border">
                          <Package className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{product.label}</p>
                        <p className="text-xs text-muted-foreground truncate">{product.description}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs font-medium">{product.measurementValue} {product.measurementUnit}</p>
                          {product.vendor && (
                            <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded border border-green-200 truncate max-w-[80px]">
                              {product.vendor.businessName || 'Vendor'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Categories;

// import { useState, useEffect } from "react";
// import axios from "axios";
// import { toast } from "sonner";
// import { Plus, Edit, Trash2 } from "lucide-react";

// import { DashboardHeader } from "@/components/DashboardHeader";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
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
// import { Switch } from "@/components/ui/switch";

// type Category = {
//   id: number;
//   name: string;
//   label: string;
//   is_active: boolean;
//   img_link?: string | null;
// };

// const Categories = () => {
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [isLoading, setIsLoading] = useState(true);

//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [editingCategory, setEditingCategory] = useState<Category | null>(null);
//   const [formData, setFormData] = useState({
//     name: "",
//     label: "",
//     img_link: "",
//     is_active: true,
//   });

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   const fetchCategories = async () => {
//     try {
//       const response = await axios.get<Category[]>(
//         "http://localhost:3064/categories/get-categories"
//       );
//       setCategories(response.data);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to load categories");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setFormData({ name: "", label: "", img_link: "", is_active: true });
//     setEditingCategory(null);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       if (editingCategory) {
//         // Update
//         await axios.patch(
//           `http://localhost:3064/categories/${editingCategory.id}`,
//           formData
//         );
//         toast.success("Category updated successfully");
//       } else {
//         // Create
//         await axios.post(
//           "http://localhost:3064/categories",
//           formData
//         );
//         toast.success("Category added successfully");
//       }
//       fetchCategories();
//       setIsDialogOpen(false);
//       resetForm();
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to save category");
//     }
//   };

//   const handleEdit = (category: Category) => {
//     setEditingCategory(category);
//     setFormData({
//       name: category.name,
//       label: category.label,
//       img_link: category.img_link || "",
//       is_active: category.is_active,
//     });
//     setIsDialogOpen(true);
//   };

//   const handleDelete = async (id: number) => {
//     if (!confirm("Are you sure you want to delete this category?")) return;
//     try {
//       await axios.delete(
//         `http://localhost:3064/categories/${id}`
//       );
//       setCategories(categories.filter((c) => c.id !== id));
//       toast.success("Category deleted successfully");
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to delete category");
//     }
//   };

//   return (
//     <div className="flex flex-col min-h-screen">
//       <DashboardHeader />
//       <div className="flex-1 space-y-6 p-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
//             <p className="text-muted-foreground">
//               Manage product categories
//             </p>
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
//                 Add Category
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="max-w-lg">
//               <DialogHeader>
//                 <DialogTitle>
//                   {editingCategory ? "Edit Category" : "Add New Category"}
//                 </DialogTitle>
//                 <DialogDescription>
//                   {editingCategory
//                     ? "Update category details"
//                     : "Create a new product category"}
//                 </DialogDescription>
//               </DialogHeader>

//               <form onSubmit={handleSubmit}>
//                 <div className="grid gap-4 py-4">
//                   <div className="grid gap-2">
//                     <Label htmlFor="name">Name</Label>
//                     <Input
//                       id="name"
//                       value={formData.name}
//                       onChange={(e) =>
//                         setFormData({ ...formData, name: e.target.value })
//                       }
//                       placeholder="Category Name"
//                       required
//                     />
//                   </div>
//                   <div className="grid gap-2">
//                     <Label htmlFor="label">Label</Label>
//                     <Input
//                       id="label"
//                       value={formData.label}
//                       onChange={(e) =>
//                         setFormData({ ...formData, label: e.target.value })
//                       }
//                       placeholder="Category Label"
//                       required
//                     />
//                   </div>
//                   <div className="grid gap-2">
//                     <Label htmlFor="img_link">Image URL</Label>
//                     <Input
//                       id="img_link"
//                       value={formData.img_link}
//                       onChange={(e) =>
//                         setFormData({ ...formData, img_link: e.target.value })
//                       }
//                       placeholder="https://example.com/image.png"
//                     />
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <Switch
//                       checked={formData.is_active}
//                       onCheckedChange={(checked) =>
//                         setFormData({ ...formData, is_active: checked })
//                       }
//                     />
//                     <span className="text-sm">Active</span>
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
//                     {editingCategory ? "Update" : "Add"} Category
//                   </Button>
//                 </DialogFooter>
//               </form>
//             </DialogContent>
//           </Dialog>
//         </div>

//         {isLoading ? (
//           <p>Loading categories...</p>
//         ) : (
//           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//             {categories.map((category) => (
//               <Card key={category.id} className="relative">
//                 {category.img_link && (
//                   <img
//                     src={category.img_link}
//                     alt={category.name}
//                     className="w-full h-40 object-cover rounded-t-lg"
//                   />
//                 )}
//                 <CardContent>
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <CardTitle className="text-xl">{category.name}</CardTitle>
//                       <CardDescription className="text-sm">
//                         {category.label}
//                       </CardDescription>
//                       <p className="text-xs text-muted-foreground">
//                         {category.is_active ? "Active" : "Inactive"}
//                       </p>
//                     </div>
//                     <div className="flex gap-2">
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => handleEdit(category)}
//                       >
//                         <Edit className="h-4 w-4" />
//                       </Button>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => handleDelete(category.id)}
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

// export default Categories;

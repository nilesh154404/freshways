import { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Upload } from "lucide-react";

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

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get<Category[]>(
        "http://192.168.1.36:3064/categories/get-categories"
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
        "http://192.168.1.36:3064/files/upload",
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
          `http://192.168.1.36:3064/categories/${editingCategory.id}`,
          formData
        );
        toast.success("Category updated successfully");
      } else {
        // Create
        await axios.post(
          "http://192.168.1.36:3064/categories",
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
        `http://192.168.1.36:3064/categories/${id}`
      );
      setCategories(categories.filter((c) => c.id !== id));
      toast.success("Category deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete category");
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
              <Card key={category.id} className="relative">
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
                        onClick={() => handleEdit(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
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
//         "http://192.168.1.36:3064/categories/get-categories"
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
//           `http://192.168.1.36:3064/categories/${editingCategory.id}`,
//           formData
//         );
//         toast.success("Category updated successfully");
//       } else {
//         // Create
//         await axios.post(
//           "http://192.168.1.36:3064/categories",
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
//         `http://192.168.1.36:3064/categories/${id}`
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
import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, MapPin, Percent, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

// API type returned from backend
type APICommunity = {
  id: number;
  name: string;
  slug: string;
  address: string;
  type?: string;
};

// Frontend type
type Community = {
  id: string;
  name: string;
  location: string;
  description: string;
  memberCount: number;
  discount: number;
  deliveryZone: string;
};

const Communities = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCommunity, setEditingCommunity] = useState<Community | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    discount: "",
    deliveryZone: "",
  });

  // Fetch communities from API
  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const response = await axios.get<APICommunity[]>(
        "http://localhost:3064/community/"
      );
      const mapped = response.data.map((item) => ({
        id: item.id.toString(),
        name: item.name,
        location: item.address,
        description: "",
        memberCount: 0,
        discount: 0,
        deliveryZone: "",
      }));
      setCommunities(mapped);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load communities");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      location: "",
      description: "",
      discount: "",
      deliveryZone: "",
    });
    setEditingCommunity(null);
  };

  // Add or update community
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCommunity) {
        // UPDATE COMMUNITY (PATCH)
        await axios.patch<APICommunity>(
          `http://localhost:3064/community/${editingCommunity.id}`,
          {
            name: formData.name,
            slug: formData.name.toLowerCase().replace(/\s+/g, "-"),
            type: "COMMERCIAL",
            address: formData.location,
          }
        );

        setCommunities((prev) =>
          prev.map((c) =>
            c.id === editingCommunity.id
              ? { ...c, ...formData, discount: parseFloat(formData.discount) }
              : c
          )
        );
        toast.success("Community updated successfully");
      } else {
        // CREATE COMMUNITY (POST)
        const response = await axios.post<APICommunity>(
          "http://localhost:3064/community/",
          {
            name: formData.name,
            slug: formData.name.toLowerCase().replace(/\s+/g, "-"),
            type: "COMMERCIAL",
            address: formData.location,
          }
        );

        const newCommunity: Community = {
          id: response.data.id.toString(),
          name: response.data.name,
          location: response.data.address,
          description: formData.description,
          discount: parseFloat(formData.discount),
          memberCount: 0,
          deliveryZone: formData.deliveryZone,
        };

        setCommunities([...communities, newCommunity]);
        toast.success("Community added successfully");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save community");
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (community: Community) => {
    setEditingCommunity(community);
    setFormData({
      name: community.name,
      location: community.location,
      description: community.description,
      discount: community.discount.toString(),
      deliveryZone: community.deliveryZone,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete<void>(`http://localhost:3064/community/${id}`);
      setCommunities(communities.filter((c) => c.id !== id));
      toast.success("Community deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete community");
    }
  };

  const totalMembers = communities.reduce((sum, c) => sum + c.memberCount, 0);

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Communities</h2>
            <p className="text-muted-foreground">
              Manage communities and group discounts
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
                Add Community
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingCommunity ? "Edit Community" : "Add New Community"}
                </DialogTitle>
                <DialogDescription>
                  {editingCommunity
                    ? "Update community details"
                    : "Create a new community group"}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Community Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g., Green Valley Apartments"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder="e.g., Sector 21, Gurgaon"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Brief description of the community"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="discount">Community Discount (%)</Label>
                      <Input
                        id="discount"
                        type="number"
                        step="0.01"
                        value={formData.discount}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            discount: e.target.value,
                          })
                        }
                        placeholder="10.00"
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="zone">Delivery Zone</Label>
                      <Input
                        id="zone"
                        value={formData.deliveryZone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            deliveryZone: e.target.value,
                          })
                        }
                        placeholder="e.g., Zone A"
                        required
                      />
                    </div>
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
                    {editingCommunity ? "Update" : "Add"} Community
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Communities</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{communities.length}</div>
              <p className="text-xs text-muted-foreground">Active groups</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMembers}</div>
              <p className="text-xs text-muted-foreground">
                Across all communities
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Discount</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {communities.length > 0
                  ? (
                    communities.reduce((sum, c) => sum + c.discount, 0) /
                    communities.length
                  ).toFixed(1)
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground">Community average</p>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <p>Loading communities...</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {communities.map((community) => (
              <Card key={community.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">
                        {community.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 pt-1">
                        <MapPin className="h-3 w-3" />
                        {community.location}
                      </CardDescription>
                    </div>

                    <Badge variant="secondary" className="gap-1">
                      <Percent className="h-3 w-3" />
                      {community.discount}% OFF
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {community.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Users className="h-4 w-4" />
                        Members
                      </div>
                      <div className="text-2xl font-bold">
                        {community.memberCount}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <MapPin className="h-4 w-4" />
                        Zone
                      </div>
                      <Badge variant="outline" className="text-base">
                        {community.deliveryZone}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => handleEdit(community)}
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>

                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => handleDelete(community.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                      Delete
                    </Button>
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

export default Communities;

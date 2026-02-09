import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_BASE_URL } from "@/lib/api";

type Category = {
  id: number;
  name: string;
};

type VendorProfile = {
  id: number;
  businessName: string;
  gstNumber?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  ownerName?: string;
  address?: string;
  website?: string;
  categories?: Category[];
};

export const DashboardHeader = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [vendor, setVendor] = useState<VendorProfile | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [categorySearch, setCategorySearch] = useState("");

  const [ownerName, setOwnerName] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");

  const role = localStorage.getItem("role");
  const profileId = localStorage.getItem("profileId");
  const isVendor = role?.toLowerCase() === "vendor";

  const authHeaders = useMemo(() => {
    const token = localStorage.getItem("accessToken");
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  }, []);

  useEffect(() => {
    if (!isProfileOpen || !profileId || !isVendor) return;

    const fetchData = async () => {
      try {
        setLoadingProfile(true);
        const [vendorRes, categoryRes] = await Promise.all([
          axios.get<VendorProfile>(`${API_BASE_URL}/vendors/${profileId}`, {
            headers: authHeaders,
          }),
          axios.get<Category[]>(`${API_BASE_URL}/categories/get-categories`),
        ]);

        setVendor(vendorRes.data);
        setOwnerName(vendorRes.data.ownerName || "");
        setAddress(vendorRes.data.address || "");
        setWebsite(vendorRes.data.website || "");
        setSelectedCategories(
          vendorRes.data.categories?.map((cat) => cat.id) || []
        );
        setCategories(categoryRes.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load vendor profile");
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchData();
  }, [authHeaders, isProfileOpen, isVendor, profileId]);

  const toggleCategory = (id: number) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const handleSaveProfile = async () => {
    if (!profileId) {
      toast.error("Profile not found");
      return;
    }

    setSavingProfile(true);
    try {
      const payload = {
        ownerName,
        address,
        website,
        categories: selectedCategories,
      };

      const res = await axios.patch<VendorProfile>(
        `${API_BASE_URL}/vendors/${profileId}/profile`,
        payload,
        { headers: authHeaders }
      );

      setVendor(res.data);
      toast.success("Profile updated successfully");
      setIsProfileOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-card px-6">
      <SidebarTrigger />
      
      <div className="flex-1" />
      
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5" />
        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
      </Button>

      {isVendor ? (
        <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Vendor Profile</DialogTitle>
              <DialogDescription>
                Business name, GST, and bank details are read-only.
              </DialogDescription>
            </DialogHeader>

            {loadingProfile ? (
              <p className="text-sm text-muted-foreground">Loading profile...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Business Name</Label>
                  <Input value={vendor?.businessName || ""} disabled />
                </div>

                <div>
                  <Label>GST Number</Label>
                  <Input value={vendor?.gstNumber || ""} disabled />
                </div>

                <div>
                  <Label>Bank Name</Label>
                  <Input value={vendor?.bankName || ""} disabled />
                </div>

                <div>
                  <Label>Account Number</Label>
                  <Input value={vendor?.accountNumber || ""} disabled />
                </div>

                <div>
                  <Label>IFSC Code</Label>
                  <Input value={vendor?.ifscCode || ""} disabled />
                </div>

                <div>
                  <Label>Owner Name</Label>
                  <Input
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Business Address</Label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Website</Label>
                  <Input
                    placeholder="https://example.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Categories</Label>
                  <Input
                    placeholder="Search categories..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="mt-2"
                  />

                  {selectedCategories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedCategories.map((id) => {
                        const cat = categories.find((c) => c.id === id);
                        return (
                          <span
                            key={id}
                            className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                          >
                            {cat?.name}
                            <button
                              type="button"
                              onClick={() => toggleCategory(id)}
                              className="ml-1 font-bold hover:text-blue-900"
                            >
                              ×
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  <div className="border rounded-lg mt-3 max-h-48 overflow-y-auto">
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => toggleCategory(cat.id)}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                            selectedCategories.includes(cat.id)
                              ? "bg-blue-50 font-medium"
                              : ""
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))
                    ) : (
                      <p className="px-4 py-3 text-sm text-gray-500">
                        No categories found
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsProfileOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveProfile}
                disabled={savingProfile || loadingProfile}
              >
                {savingProfile ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : (
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      )}
    </header>
  );
};

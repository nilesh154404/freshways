import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, MapPin, Mail, Building2, LogOut, Globe, Tag } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/DashboardHeader";

const API_BASE = "http://localhost:3064";

interface Category {
    id: number;
    name: string;
}

const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const navigate = useNavigate();

    // Form Data
    const [formData, setFormData] = useState({
        businessName: "",
        ownerName: "",
        gstNumber: "",
        address: "",
        website: "",
        fullName: "",
        phone: "",
        nickname: "", // New
        bio: "", // New
        whatsapp: "", // New
        telegram: "", // New
        displayName: "", // New (Frontend only for now, mapping to ownerName/fullName)
        oldPassword: "", // New (Visual only)
        newPassword: "", // New (Visual only)
    });

    // Categories State (Vendor Only)
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
    const [categorySearch, setCategorySearch] = useState("");


    const getLocalStorageCtx = () => {
        if (typeof window === 'undefined') return { token: null };
        let rawToken = localStorage.getItem("token") || localStorage.getItem("accessToken");
        return {
            token: rawToken?.replace(/^"|"$/g, '')
        };
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${API_BASE}/categories/get-categories`);
            setAllCategories(res.data);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const { token } = getLocalStorageCtx();
            const role = localStorage.getItem("role");
            const profileId = localStorage.getItem("profileId");

            if (!token || !profileId) {
                navigate("/login");
                return;
            }

            const config = { headers: { Authorization: `Bearer ${token}` } };
            let url = "";

            if (role === "Vendor") {
                url = `${API_BASE}/vendors/${profileId}`;
                fetchCategories(); // Fetch categories if vendor
            } else {
                url = `${API_BASE}/user/${profileId}`;
            }

            const res = await axios.get(url, config);
            const userData: any = res.data;
            setData({ ...userData, role });

            // Normalize data for form
            if (role === "Vendor") {
                setFormData({
                    businessName: userData.businessName || "",
                    ownerName: userData.ownerName || "",
                    gstNumber: userData.gstNumber || "",
                    address: userData.address || "",
                    website: userData.website || "",
                    fullName: "",
                    phone: "",
                    nickname: userData.nickname || "",
                    bio: userData.bio || "",
                    whatsapp: userData.whatsapp || "",
                    telegram: userData.telegram || "",
                    displayName: userData.ownerName || "", // Default mapping
                    oldPassword: "",
                    newPassword: "",
                });
                if (userData.categories) {
                    setSelectedCategoryIds(userData.categories.map((c: any) => c.id));
                }
            } else {
                setFormData({
                    businessName: "",
                    ownerName: "",
                    gstNumber: "",
                    address: "",
                    website: userData.website || "",
                    fullName: userData.fullName || "",
                    phone: userData.phone || "",
                    nickname: userData.nickname || "",
                    bio: userData.bio || "",
                    whatsapp: userData.whatsapp || "",
                    telegram: userData.telegram || "",
                    displayName: userData.fullName || "", // Default mapping
                    oldPassword: "",
                    newPassword: "",
                });
            }

        } catch (error) {
            console.error(error);
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const { token } = getLocalStorageCtx();
            const role = localStorage.getItem("role");
            const profileId = localStorage.getItem("profileId");
            const config = { headers: { Authorization: `Bearer ${token}` } };

            let payload: any = {};
            let url = "";

            if (role === "Vendor") {
                url = `${API_BASE}/vendors/${profileId}`;
                payload = {
                    businessName: formData.businessName,
                    ownerName: formData.ownerName,
                    gstNumber: formData.gstNumber,
                    address: formData.address,
                    website: formData.website,
                    nickname: formData.nickname,
                    bio: formData.bio,
                    whatsapp: formData.whatsapp,
                    telegram: formData.telegram,
                    categories: selectedCategoryIds, // Send category IDs
                    userTypeId: 3 // Vendor Type ID
                };
            } else {
                url = `${API_BASE}/user/${profileId}`;
                payload = {
                    fullName: formData.fullName,
                    phone: formData.phone,
                    nickname: formData.nickname,
                    bio: formData.bio,
                    whatsapp: formData.whatsapp,
                    telegram: formData.telegram,
                    website: formData.website,
                    userTypeId: 2 // User Type ID
                };
                if (data?.userType?.id) {
                    payload.userTypeId = data.userType.id;
                }
            }
            if (role === "Vendor" && data?.userType?.id) {
                payload.userTypeId = data.userType.id;
            }


            await axios.patch(url, payload, config);

            toast.success("Profile updated successfully");
            setIsEditing(false);
            fetchProfile(); // Refresh
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile");
        }
    };

    const toggleCategory = (id: number) => {
        if (!isEditing) return;
        setSelectedCategoryIds(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const filteredCategories = allCategories.filter(c =>
        c.name.toLowerCase().includes(categorySearch.toLowerCase())
    );


    if (loading) return <div className="p-10">Loading profile...</div>;

    const roleLabel = data?.role === 'Vendor' ? 'Vendor' : 'User';

    return (
        <div className="flex flex-col min-h-screen">
            <DashboardHeader />
            <div className="flex-1 space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">Account Management</h2>
                        <p className="text-muted-foreground mt-2">Manage your account information and preferences.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <>
                                <Button variant="outline" onClick={() => { setIsEditing(false); fetchProfile(); }}>Cancel</Button>
                                <Button onClick={handleSave}>Save Changes</Button>
                            </>
                        ) : (
                            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-8 md:grid-cols-12 lg:gap-12">
                    {/* LEFT COLUMN - Avatar, Password, Logout */}
                    <div className="md:col-span-4 space-y-8 flex flex-col">
                        {/* Avatar Section */}
                        <div className="space-y-4">
                            <div className="aspect-square w-full rounded-2xl bg-[#F3EFEA] relative overflow-hidden flex items-center justify-center">
                                {/* Placeholder generic image or Initials if no image */}
                                <div className="text-6xl font-bold text-gray-300">
                                    {data?.role === 'Vendor' ? formData.ownerName?.charAt(0) : formData.fullName?.charAt(0)}
                                </div>
                                {/* Mock Close Button */}
                                <div className="absolute top-4 right-4 h-8 w-8 bg-black/10 rounded-full flex items-center justify-center cursor-pointer text-white">
                                    <span className="text-lg">×</span>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full h-12 text-base font-normal border-gray-200" disabled={!isEditing}>
                                Upload Photo
                            </Button>
                        </div>

                        {/* Password Section */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-gray-500 font-medium">Old Password</Label>
                                <Input
                                    type="password"
                                    placeholder="*******"
                                    className="h-11 bg-gray-50/50 border-gray-200"
                                    disabled={!isEditing}
                                    value={formData.oldPassword}
                                    onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-500 font-medium">New Password</Label>
                                <Input
                                    type="password"
                                    placeholder="*******"
                                    className="h-11 bg-gray-50/50 border-gray-200"
                                    disabled={!isEditing}
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                />
                            </div>
                            <Button variant="outline" className="w-full h-12 text-base font-normal border-gray-200" disabled={!isEditing}>
                                Change Password
                            </Button>
                        </div>

                        {/* Spacer to push Logout to bottom */}
                        <div className="flex-1"></div>

                        {/* Logout Button */}
                        <Button
                            variant="destructive"
                            className="w-full h-12 font-medium bg-red-500 hover:bg-red-600 border-red-500 text-white"
                            onClick={handleLogout}
                        >
                            Log Out
                        </Button>
                    </div>

                    {/* RIGHT COLUMN - Profile Information */}
                    <div className="md:col-span-8 space-y-8">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-500 mb-6 uppercase tracking-wide">Profile Information</h3>

                            <div className="grid gap-x-6 gap-y-6 md:grid-cols-2">
                                {/* Username (Read Only - Email/BusinessName) */}
                                <div className="space-y-2">
                                    <Label className="text-gray-500 font-medium">Username</Label>
                                    <Input
                                        value={data?.email || ""} // Using email as username for now as per logic
                                        disabled={true}
                                        className="h-11 border-gray-200 bg-gray-50 text-gray-500"
                                    />
                                </div>

                                {/* First Name / Owner Name */}
                                <div className="space-y-2">
                                    <Label className="text-gray-500 font-medium">
                                        {data?.role === 'Vendor' ? 'Owner Name' : 'Full Name'}
                                    </Label>
                                    <Input
                                        value={data?.role === 'Vendor' ? formData.ownerName : formData.fullName}
                                        onChange={(e) => data?.role === 'Vendor'
                                            ? setFormData({ ...formData, ownerName: e.target.value })
                                            : setFormData({ ...formData, fullName: e.target.value })
                                        }
                                        disabled={!isEditing}
                                        className="h-11 border-gray-200"
                                    />
                                </div>

                                {/* Nickname */}
                                <div className="space-y-2">
                                    <Label className="text-gray-500 font-medium">Nickname</Label>
                                    <Input
                                        value={formData.nickname}
                                        onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                                        disabled={!isEditing}
                                        className="h-11 border-gray-200"
                                    />
                                </div>

                                {/* Role (Read Only) */}
                                <div className="space-y-2">
                                    <Label className="text-gray-500 font-medium">Role</Label>
                                    <Input
                                        value={roleLabel}
                                        disabled={true}
                                        className="h-11 border-gray-200 bg-gray-50 text-gray-500"
                                    />
                                </div>

                                {/* Last Name (Conditional / Optional) - Using Business Name for Vendor */}
                                {data?.role === 'Vendor' && (
                                    <div className="space-y-2">
                                        <Label className="text-gray-500 font-medium">Business Name</Label>
                                        <Input
                                            value={formData.businessName}
                                            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                            disabled={!isEditing}
                                            className="h-11 border-gray-200"
                                        />
                                    </div>
                                )}

                                {/* Display Name Publicly as */}
                                <div className="space-y-2">
                                    <Label className="text-gray-500 font-medium">Display Name Publicly as</Label>
                                    <Input
                                        value={formData.displayName}
                                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                        disabled={!isEditing}
                                        className="h-11 border-gray-200"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-500 mb-6 uppercase tracking-wide">Contact Info</h3>
                            <div className="grid gap-x-6 gap-y-6 md:grid-cols-2">
                                {/* Email */}
                                <div className="space-y-2">
                                    <Label className="text-gray-500 font-medium">Email (required)</Label>
                                    <Input
                                        value={data?.email || ""}
                                        disabled={true}
                                        className="h-11 border-gray-200 bg-gray-50 text-gray-500"
                                    />
                                </div>

                                {/* WhatsApp */}
                                <div className="space-y-2">
                                    <Label className="text-gray-500 font-medium">WhatsApp</Label>
                                    <Input
                                        value={formData.whatsapp}
                                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                        disabled={!isEditing}
                                        placeholder="@username"
                                        className="h-11 border-gray-200"
                                    />
                                </div>

                                {/* Website */}
                                <div className="space-y-2">
                                    <Label className="text-gray-500 font-medium">Website</Label>
                                    <Input
                                        value={formData.website}
                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        disabled={!isEditing}
                                        placeholder="https://"
                                        className="h-11 border-gray-200"
                                    />
                                </div>

                                {/* Telegram */}
                                <div className="space-y-2">
                                    <Label className="text-gray-500 font-medium">Telegram</Label>
                                    <Input
                                        value={formData.telegram}
                                        onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                                        disabled={!isEditing}
                                        placeholder="@username"
                                        className="h-11 border-gray-200"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* About the User / Bio */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-500 mb-6 uppercase tracking-wide">About the User</h3>

                            <div className="space-y-2">
                                <Label className="text-gray-500 font-medium">Biographical Info</Label>
                                <Textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    disabled={!isEditing}
                                    className="min-h-[150px] border-gray-200 resize-none p-4 leading-relaxed"
                                />
                            </div>
                        </div>


                        {/* VENDOR ONLY EXTRA SECTIONS (Address & Categories) - Kept but styled simply at bottom */}
                        {data?.role === 'Vendor' && (
                            <div className="pt-6 border-t">
                                <h3 className="text-lg font-semibold text-gray-500 mb-6 uppercase tracking-wide">Business Details</h3>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-gray-500 font-medium">Business Address</Label>
                                        <Textarea
                                            className="min-h-[80px] border-gray-200"
                                            disabled={!isEditing}
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-500 font-medium">GST Number</Label>
                                        <Input
                                            disabled={!isEditing}
                                            value={formData.gstNumber}
                                            onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                                            className="max-w-[300px]"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-500 font-medium">Product Categories</Label>
                                        <div className="p-4 border rounded-lg bg-gray-50/50">
                                            {isEditing ? (
                                                <div className="space-y-4">
                                                    <Input
                                                        placeholder="Search categories..."
                                                        value={categorySearch}
                                                        onChange={(e) => setCategorySearch(e.target.value)}
                                                        className="bg-white"
                                                    />
                                                    <div className="max-h-60 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-2">
                                                        {filteredCategories.map(cat => (
                                                            <div
                                                                key={cat.id}
                                                                onClick={() => toggleCategory(cat.id)}
                                                                className={`cursor-pointer px-3 py-2 rounded-md text-sm border flex items-center gap-2 transition-colors bg-white ${selectedCategoryIds.includes(cat.id)
                                                                    ? 'bg-primary/10 border-primary text-primary font-medium'
                                                                    : 'hover:bg-gray-50'
                                                                    }`}
                                                            >
                                                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedCategoryIds.includes(cat.id) ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                                                                    {selectedCategoryIds.includes(cat.id) && <span className="text-white text-xs">✓</span>}
                                                                </div>
                                                                {cat.name}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedCategoryIds.length > 0 ? (
                                                        selectedCategoryIds.map(id => {
                                                            const cat = allCategories.find(c => c.id === id) || data.categories?.find((c: any) => c.id === id);
                                                            return (
                                                                <span key={id} className="bg-white border text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                                                                    {cat ? cat.name : 'Unknown Category'}
                                                                </span>
                                                            )
                                                        })
                                                    ) : (
                                                        <p className="text-sm text-gray-500 italic">No categories selected.</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;

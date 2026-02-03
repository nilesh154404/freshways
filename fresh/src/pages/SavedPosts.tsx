"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/DashboardHeader";
import { MarketingCard, MarketingItem } from "@/components/MarketingCard";

const API_BASE = "http://localhost:3064";

const SavedPosts = () => {
    const [items, setItems] = useState<MarketingItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Helper to safely get from localStorage
    const getLocalStorageCtx = () => {
        if (typeof window === 'undefined') return { role: null, profileId: null, token: null };
        let rawToken = localStorage.getItem("token") || localStorage.getItem("accessToken");
        return {
            role: localStorage.getItem("role"),
            profileId: localStorage.getItem("profileId"),
            token: rawToken?.replace(/^"|"$/g, '')
        };
    };

    const { role, profileId, token } = getLocalStorageCtx();

    // Set Auth Header
    const authConfig = {
        headers: { Authorization: `Bearer ${token}` }
    };

    useEffect(() => {
        fetchSavedItems();
    }, []);

    const fetchSavedItems = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE}/marketing/saved`, authConfig);

            const normalized: MarketingItem[] = res.data.map((item: any) => ({
                id: item.id,
                category_id: item.category?.id,
                category_name: item.category?.name,
                product_id: item.product?.id,
                product_name: item.product?.label,
                description: item.description,
                media_urls: (item.media as any[])?.map((m: any) => m.fileUrl) || [],
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
            toast.error("Failed to load saved posts");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: number) => {
        // Not saving functionality on this page, but if user is admin they might want to delete.
        // For saved posts view, usually we don't delete the post itself, just unsave.
        // But MarketingCard requires onDelete prop for Admin Actions.
        // We can just pass a dummy or actual delete if we want admins to delete even from here.
        // Safe to pass a function that errors or warns, or actual delete.
        // Given it's a "Saved Posts" view, standard behavior is usually just removing from saved.
        // But MarketingCard "Delete" button is for "Deleting the Post entirely".
        // Let's implement actual delete but maybe warn? Or just pass refetch.
        toast.info("Go to main Feed to delete posts.");
    };

    const handleEdit = (item: MarketingItem) => {
        toast.info("Go to main Feed to edit posts.");
    }

    return (
        <div className="flex flex-col min-h-screen">
            <DashboardHeader />

            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Saved Posts
                    </h1>
                </div>

                {loading ? (
                    <div className="text-center py-10">Loading...</div>
                ) : items.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                        <p>You haven't saved any posts yet.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {items.map((item) => (
                            <MarketingCard
                                key={item.id}
                                item={item}
                                role={role}
                                token={token}
                                onDelete={handleDelete}
                                onEdit={handleEdit}
                                refresh={fetchSavedItems} // Refreshing will re-fetch list, likely removing unsaved items if filter applies
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedPosts;

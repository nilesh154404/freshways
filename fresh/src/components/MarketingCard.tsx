"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

/* ================= TYPES ================= */

export type Comment = {
    id: number;
    user_name?: string;
    user?: { firstName: string; lastName: string; role: string };
    user_role?: string;
    content: string;
    created_at: string;
};

export type MarketingItem = {
    id: number;
    category_id: number;
    category_name: string;
    product_id?: number;
    product_name?: string;
    description: string;
    media_urls: string[];
    likes_count: number;
    comments_count: number;
    shares_count: number;
    saves_count: number;
    liked_by_me: boolean;
    saved_by_me: boolean;
    comments: Comment[];
    vendorId?: string;
    vendor_name?: string;
};

type Liker = {
    id: number;
    firstName: string;
    lastName: string;
    role: string;
};

const API_BASE = "http://localhost:3064";

interface MarketingCardProps {
    item: MarketingItem;
    role: string | null;
    token: string | null;
    onDelete: (id: number) => void;
    onEdit: (item: MarketingItem) => void;
    refresh: () => void;
}

export const MarketingCard = ({
    item,
    role,
    token,
    onDelete,
    onEdit,
    refresh
}: MarketingCardProps) => {
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [showDetails, setShowDetails] = useState(false);
    const [likers, setLikers] = useState<Liker[]>([]);

    // Optimistic UI state
    const [liked, setLiked] = useState(item.liked_by_me);
    const [likesCount, setLikesCount] = useState(item.likes_count);
    const [saved, setSaved] = useState(item.saved_by_me);
    const [savesCount, setSavesCount] = useState(item.saves_count);
    const [sharesCount, setSharesCount] = useState(item.shares_count);

    useEffect(() => {
        setLiked(item.liked_by_me);
        setLikesCount(item.likes_count);
        setSaved(item.saved_by_me);
        setSavesCount(item.saves_count);
        setSharesCount(item.shares_count);
    }, [item]);

    const authConfig = {
        headers: { Authorization: `Bearer ${token}` }
    };

    // const handleLike = async () => {
    //     if (role?.toLowerCase() !== 'customer') {
    //         toast.error("Only customers can like posts");
    //         return;
    //     }

    //     const newVal = !liked;
    //     setLiked(newVal);
    //     setLikesCount(prev => newVal ? prev + 1 : Math.max(0, prev - 1));

    //     try {
    //         await axios.post(`${API_BASE}/marketing/${item.id}/like`, {}, authConfig);
    //     } catch (e: any) {
    //         console.error("Like failed:", e);
    //         toast.error(e.response?.data?.message || "Failed to like post");
    //         setLiked(!newVal);
    //         setLikesCount(prev => newVal ? Math.max(0, prev - 1) : prev + 1);
    //     }
    // };

    const handleSave = async () => {
        const newVal = !saved;
        setSaved(newVal);
        setSavesCount(prev => newVal ? prev + 1 : Math.max(0, prev - 1));

        try {
            await axios.post(`${API_BASE}/marketing/${item.id}/save`, {}, authConfig);
        } catch (e: any) {
            console.error("Save failed:", e);
            toast.error(e.response?.data?.message || "Failed to save post");
            setSaved(!newVal);
            setSavesCount(prev => newVal ? Math.max(0, prev - 1) : prev + 1);
        }
    };

    const handleShare = async () => {
        setSharesCount(prev => prev + 1);
        try {
            axios.post(`${API_BASE}/marketing/${item.id}/share`, {}, authConfig);
        } catch (e) { console.error("Share log failed"); }

        const shareUrl = `http://192.168.1.44:8080/share/marketing/${item.id}`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: item.product_name || item.category_name || 'Freshways Post',
                    text: item.description,
                    url: shareUrl,
                });
                toast.success("Shared successfully");
            } catch (err) {
                if ((err as Error).name !== 'AbortError') copyToClipboard(shareUrl);
            }
        } else {
            copyToClipboard(shareUrl);
        }
    };

    const copyToClipboard = async (text: string) => {
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(text);
                toast.success("Link copied to clipboard");
            } else {
                throw new Error("No clipboard API");
            }
        } catch {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                toast.success("Link copied to clipboard");
            } catch (err) {
                toast.error("Failed to copy link");
            }
            document.body.removeChild(textArea);
        }
    };

    const handlePostComment = async () => {
        if (!commentText.trim()) return;

        try {
            await axios.post(`${API_BASE}/marketing/${item.id}/comments`, { content: commentText }, authConfig);
            toast.success("Comment posted");
            setCommentText("");
            refresh();
        } catch (e) {
            toast.error("Failed to post comment");
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        try {
            await axios.delete(`${API_BASE}/marketing/comments/${commentId}`, authConfig);
            toast.success("Comment deleted");
            refresh();
        } catch (e) {
            toast.error("Failed to delete comment");
        }
    };

    const fetchLikers = async () => {
        try {
            const res = await axios.get<Liker[]>(`${API_BASE}/marketing/${item.id}/likes`, authConfig);
            setLikers(res.data);
        } catch (e) {
            toast.error("Failed to load likes");
        }
    };

    const isAdminOrVendor = role === "Admin" || role === "Vendor";

    const openLikesDialog = () => {
        setShowDetails(true);
        fetchLikers();
    };

    return (
        <>
            <Card className="flex flex-col overflow-hidden border-0 shadow-sm ring-1 ring-slate-100 rounded-xl bg-white mb-6">
                {/* 1. Image Section with Overlay Badge */}
                <div className="relative h-64 w-full bg-slate-50">
                    {item.media_urls[0] ? (
                        <img
                            src={item.media_urls[0]}
                            className="h-full w-full object-cover"
                            alt="Post media"
                        />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-400">No Image</div>
                    )}

                    {/* Category Badge Overlay - Top Left */}
                    <div className="absolute top-4 left-4">
                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                            {item.category_name}
                        </span>
                    </div>

                    {/* Like Button Overlay - Floating (Commented out as per request) */}
                    {/* 
                    <div className="absolute top-1/2 right-4 -translate-y-1/2">
                         <Button variant="secondary" size="icon" className="h-10 w-10 rounded-full shadow-md bg-white hover:bg-white" onClick={handleLike}>
                            <Heart className={`h-5 w-5 ${liked ? "fill-red-500 text-red-500" : "text-slate-400"}`} />
                        </Button>
                    </div> 
                    */}
                </div>

                <CardContent className="flex-1 flex flex-col p-5 pb-3">
                    {/* 2. Title & Description */}
                    <div className="mb-4">
                        <h3 className="font-bold text-lg text-slate-900 mb-1">
                            {item.product_name || item.category_name}
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
                            {item.description}
                        </p>
                    </div>

                    {/* 3. Author Row */}
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <div className="h-9 w-9 bg-slate-200 rounded-full flex items-center justify-center text-slate-500">
                                {/* Placeholder Avatar Icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="text-sm text-slate-500 font-medium">
                                Posted by {item.vendor_name || "Freshways"}
                            </span>
                        </div>
                        <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-md font-medium">
                            Marketing
                        </span>
                    </div>

                    {/* 4. Footer Actions */}
                    <div className="flex items-center justify-between text-slate-500">
                        <div className="flex items-center gap-6">
                            <button
                                className="flex items-center gap-2 hover:text-slate-800 transition-colors text-sm font-medium"
                                onClick={() => setShowComments(true)}
                            >
                                <MessageCircle className="h-5 w-5" />
                                Comment
                            </button>

                            <button
                                className="flex items-center gap-2 hover:text-slate-800 transition-colors text-sm font-medium"
                                onClick={handleShare}
                            >
                                <Share2 className="h-5 w-5" />
                                Share
                            </button>
                        </div>

                        <button
                            className="hover:text-slate-800 transition-colors"
                            onClick={handleSave}
                        >
                            <Bookmark className={`h-6 w-6 ${saved ? "fill-slate-800 text-slate-800" : ""}`} />
                        </button>
                    </div>

                    {/* Admin Actions */}
                    {isAdminOrVendor && (
                        <div className="flex items-center justify-end gap-2 mt-4 pt-2 border-t border-slate-100">
                            <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => onEdit(item)}>Edit</Button>
                            <Button size="sm" variant="ghost" className="h-8 text-xs text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => onDelete(item.id)}>Delete</Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={showComments} onOpenChange={setShowComments}>
                <DialogContent className="max-w-md h-[80vh] flex flex-col p-0 gap-0">
                    <DialogHeader className="p-4 border-b">
                        <DialogTitle className="text-center text-base font-semibold">Comments</DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {item.comments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm">
                                <p>No comments yet.</p>
                                <p>Start the conversation.</p>
                            </div>
                        ) : (
                            item.comments.map(c => (
                                <div key={c.id} className="flex gap-3 text-sm">
                                    <div className="h-8 w-8 bg-slate-200 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs">
                                        {(c.user?.firstName?.[0] || 'U')}
                                    </div>
                                    <div className="flex-1 space-y-0.5">
                                        <p>
                                            <span className="font-semibold mr-2 truncate">{c.user?.firstName || c.user_name || "User"}</span>
                                            <span className="font-light">{c.content}</span>
                                        </p>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span>{new Date(c.created_at).toLocaleDateString()}</span>
                                            {isAdminOrVendor && <span className="text-red-500 cursor-pointer font-semibold" onClick={() => handleDeleteComment(c.id)}>Delete</span>}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {!isAdminOrVendor && (
                        <div className="p-3 border-t bg-background">
                            <div className="flex items-center gap-2">
                                <Input
                                    value={commentText}
                                    onChange={e => setCommentText(e.target.value)}
                                    placeholder="Add a comment..."
                                    className="border-none focus-visible:ring-0 shadow-none px-0"
                                />
                                <Button
                                    variant="ghost"
                                    className="text-blue-500 font-semibold hover:bg-transparent hover:text-blue-700"
                                    disabled={!commentText.trim()}
                                    onClick={handlePostComment}
                                >
                                    Post
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={showDetails} onOpenChange={setShowDetails}>
                <DialogContent className="max-w-sm h-[400px] flex flex-col p-0">
                    <DialogHeader className="p-4 border-b">
                        <DialogTitle className="text-center text-base font-semibold">Likes</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {likers.length === 0 ? <p className="text-muted-foreground text-center text-sm">No likes yet.</p> :
                            likers.map((user, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-slate-200 rounded-full flex items-center justify-center text-sm font-bold text-slate-600">
                                        {user.firstName?.[0]}{user.lastName?.[0]}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold">{user.firstName} {user.lastName}</p>
                                        <p className="text-xs text-muted-foreground">{user.role}</p>
                                    </div>
                                </div>
                            ))}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

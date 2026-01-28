// "use client";

// import { useState, useEffect } from "react";
// import axios from "axios";
// import { toast } from "sonner";
// import { DashboardHeader } from "@/components/DashboardHeader";
// import { Heart, MessageCircle, Share2, Bookmark, Trash2 } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// /* ================= TYPES ================= */

// type MarketingItem = {
//     id: number;
//     category_id: number;
//     category_name: string;
//     product_id?: number;
//     product_name?: string;
//     description: string;
//     media_urls: string[];
//     // Social fields 
//     likes_count: number;
//     comments_count: number;
//     shares_count: number;
//     saves_count: number;
//     liked_by_me: boolean;
//     saved_by_me: boolean;
//     comments: Comment[];
// };

// type Comment = {
//     id: number;
//     user_name: string;
//     user_role: string;
//     content: string;
//     created_at: string;
// };

// const API_BASE = "http://localhost:3064";

// /* ================= COMPONENT ================= */

// const Posts = () => {
//     const [items, setItems] = useState<MarketingItem[]>([]);
//     const role = localStorage.getItem("role");

//     useEffect(() => {
//         fetchPosts();
//     }, []);

//     const fetchPosts = async () => {
//         try {
//             // Fetch all marketing items for the customer feed
//             const res = await axios.get(`${API_BASE}/marketing?page=1&limit=500`);

//             const normalized: MarketingItem[] = res.data.map((item: any) => ({
//                 id: item.id,
//                 category_id: item.category?.id,
//                 category_name: item.category?.name,
//                 product_id: item.product?.id,
//                 product_name: item.product?.label,
//                 description: item.description,
//                 media_urls: item.media?.map((m: any) => m.fileUrl) || [],

//                 // Mock data
//                 likes_count: Math.floor(Math.random() * 50),
//                 comments_count: 5,
//                 shares_count: Math.floor(Math.random() * 20),
//                 saves_count: Math.floor(Math.random() * 10),
//                 comments: [
//                     { id: 1, user_name: "John Doe", user_role: "Customer", content: "Great product!", created_at: new Date().toISOString() },
//                     { id: 2, user_name: "Jane Smith", user_role: "Customer", content: "Love the quality.", created_at: new Date().toISOString() }
//                 ]
//             }));

//             setItems(normalized);
//         } catch {
//             toast.error("Failed to load posts");
//         }
//     };

//     return (
//         <div className="flex flex-col min-h-screen">
//             <DashboardHeader />

//             <div className="flex-1 space-y-6 p-6">
//                 <div className="flex items-center justify-between">
//                     <h2 className="text-3xl font-bold">Posts</h2>
//                     {/* Customers don't add posts */}
//                 </div>

//                 {/* LIST */}
//                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//                     {items.map((item) => (
//                         <MarketingCard
//                             key={item.id}
//                             item={item}
//                             role={role}
//                         />
//                     ))}
//                 </div>
//             </div>
//         </div >
//     );
// };

// /* ================= SHARED CARD COMPONENT ================= */
// // Copied from Marketing.tsx to ensure consistency, stripping admin edit/delete controls

// const MarketingCard = ({
//     item,
//     role
// }: {
//     item: MarketingItem;
//     role: string | null;
// }) => {
//     const [showComments, setShowComments] = useState(false);
//     const [commentText, setCommentText] = useState("");
//     const [comments, setComments] = useState<Comment[]>(item.comments || []);
//     const [showDetails, setShowDetails] = useState(false);

//     // Admin/Vendor check for delete permissions ( Customers can only delete their own check logic later if needed)
//     const isAdminOrVendor = role === "Admin" || role === "Vendor";

//     const handlePostComment = () => {
//         if (!commentText.trim()) return;
//         const newComment: Comment = {
//             id: Date.now(),
//             user_name: "Current User",
//             user_role: role || "Customer",
//             content: commentText,
//             created_at: new Date().toISOString(),
//         };
//         setComments([...comments, newComment]);
//         setCommentText("");
//         toast.success("Comment posted");
//     };

//     const handleDeleteComment = (commentId: number) => {
//         setComments(comments.filter(c => c.id !== commentId));
//         toast.success("Comment deleted");
//     };

//     const [showShareDialog, setShowShareDialog] = useState(false);
//     const [shareUrl, setShareUrl] = useState("");

//     // const handleShare = async () => {
//     //     const deepLink = `freshwayz://marketing-content?id=${item.id}`;
//     //     setShareUrl(deepLink);

//     //     try {
//     //         if (navigator.clipboard) {
//     //             await navigator.clipboard.writeText(deepLink);
//     //             toast.success("Link copied to clipboard");
//     //         } else {
//     //             // Fallback
//     //             const textArea = document.createElement("textarea");
//     //             textArea.value = deepLink;
//     //             document.body.appendChild(textArea);
//     //             textArea.select();
//     //             document.execCommand('copy');
//     //             document.body.removeChild(textArea);
//     //             toast.success("Link copied to clipboard");
//     //         }
//     //         // Open the "Open in App" dialog
//     //         setShowShareDialog(true);
//     //     } catch (err) {
//     //         toast.error("Failed to copy link");
//     //     }
//     // };
//     const handleShare = async () => {
//     try {
//         const res = await axios.post(`${API_BASE}/marketing/${item.id}/share`);

//         const link = res.data.deepLink; // now web URL
//         setShareUrl(link);

//         await navigator.clipboard.writeText(link);
//         toast.success("Link copied to clipboard");
//         setShowShareDialog(true);

//     } catch {
//         toast.error("Failed to share post");
//     }
// };





//     // const handleOpenApp = () => {
//     //     window.location.href = shareUrl;
//     //     setShowShareDialog(false);
//     // };
//     const handleOpenApp = () => {
//     window.location.href = shareUrl; // now it works (web link)
// };


//     return (
//         <>
//             <Card className="flex flex-col h-[500px] overflow-hidden group">
//                 {/* IMAGE */}
//                 <div className="relative h-64 w-full bg-muted">
//                     {item.media_urls[0] ? (
//                         <img
//                             src={item.media_urls[0]}
//                             className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
//                         />
//                     ) : (
//                         <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground">
//                             No Image
//                         </div>
//                     )}
//                     {/* BADGE */}
//                     <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold shadow-sm">
//                         {item.category_name}
//                     </div>
//                 </div>

//                 {/* CONTENT */}
//                 <CardContent className="flex-1 flex flex-col p-4">
//                     <div className="mb-2">
//                         <h3 className="font-bold text-lg leading-tight line-clamp-1" title={item.product_name}>
//                             {item.product_name}
//                         </h3>
//                     </div>

//                     <div className="flex-1">
//                         <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
//                             {item.description}
//                         </p>
//                     </div>

//                     {/* INTERACTIONS */}
//                     <div className="flex items-center gap-4 text-muted-foreground mt-4 text-sm">
//                         <div className="flex items-center gap-1">
//                             <Heart className="h-4 w-4" />
//                             <span>{item.likes_count}</span>
//                         </div>

//                         <div
//                             className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"
//                             onClick={() => setShowComments(!showComments)}
//                         >
//                             <MessageCircle className="h-4 w-4" />
//                             <span>{comments.length}</span>
//                         </div>

//                         <div
//                             className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"
//                             onClick={handleShare}
//                         >
//                             <Share2 className="h-4 w-4" />
//                             <span>{item.shares_count}</span>
//                         </div>

//                         <div className="flex items-center gap-1">
//                             <Bookmark className="h-4 w-4" />
//                             <span>{item.saves_count}</span>
//                         </div>
//                     </div>

//                     {/* FOOTER */}
//                     <div className="flex items-center gap-2 mt-4 pt-3 border-t">
//                         <Button
//                             variant="secondary"
//                             className="flex-1 h-8 text-xs bg-muted/50 hover:bg-muted"
//                             onClick={() => setShowDetails(true)}
//                         >
//                             Details
//                         </Button>
//                     </div>
//                 </CardContent>
//             </Card>

//             {/* COMMENTS DIALOG */}
//             {showComments && (
//                 <Dialog open={showComments} onOpenChange={setShowComments}>
//                     <DialogContent>
//                         <DialogHeader>
//                             <DialogTitle>Comments</DialogTitle>
//                         </DialogHeader>
//                         <div className="space-y-3 max-h-[60vh] overflow-y-auto">
//                             {comments.length === 0 ? <p className="text-center text-sm text-muted">No comments</p> :
//                                 comments.map(c => (
//                                     <div key={c.id} className="text-sm border-b pb-2">
//                                         <div className="flex justify-between">
//                                             <span className="font-semibold">{c.user_name}</span>
//                                             <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
//                                         </div>
//                                         <p>{c.content}</p>
//                                         {isAdminOrVendor && (
//                                             <Button variant="link" className="text-red-500 h-auto p-0 text-xs" onClick={() => handleDeleteComment(c.id)}>Delete</Button>
//                                         )}
//                                     </div>
//                                 ))
//                             }
//                         </div>

//                         {/* Customer Input */}
//                         {!isAdminOrVendor && (
//                             <div className="flex gap-2">
//                                 <Input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Add a comment..." />
//                                 <Button onClick={handlePostComment}>Post</Button>
//                             </div>
//                         )}
//                     </DialogContent>
//                 </Dialog>
//             )}

//             {/* SHARE DIALOG (Open in App) */}
//             <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
//                 <DialogContent className="max-w-sm">
//                     <DialogHeader>
//                         <DialogTitle>Link Copied!</DialogTitle>
//                         <DialogDescription>
//                             Would you like to open this content in the Freshways App?
//                         </DialogDescription>
//                     </DialogHeader>
//                     <div className="flex flex-col gap-3 mt-4">
//                         <Button onClick={handleOpenApp} className="w-full">
//                             Open in App
//                         </Button>
//                         <Button variant="outline" onClick={() => setShowShareDialog(false)} className="w-full">
//                             Cancel
//                         </Button>
//                     </div>
//                 </DialogContent>
//             </Dialog>

//             {/* DETAILS DIALOG */}
//             <Dialog open={showDetails} onOpenChange={setShowDetails}>
//                 <DialogContent className="max-w-xl h-[500px] flex flex-col">
//                     <DialogHeader>
//                         <DialogTitle>Post Interactions</DialogTitle>
//                     </DialogHeader>

//                     <Tabs defaultValue="likes" className="flex-1 flex flex-col overflow-hidden">
//                         <TabsList className="grid w-full grid-cols-4">
//                             <TabsTrigger value="likes">Likes ({item.likes_count})</TabsTrigger>
//                             <TabsTrigger value="comments">Comments ({comments.length})</TabsTrigger>
//                             <TabsTrigger value="shares">Shares ({item.shares_count})</TabsTrigger>
//                             <TabsTrigger value="saves">Saves ({item.saves_count})</TabsTrigger>
//                         </TabsList>

//                         <div className="flex-1 mt-4 overflow-hidden">
//                             <TabsContent value="likes" className="h-full overflow-y-auto pr-2 space-y-2">
//                                 {[...Array(10)].map((_, i) => (
//                                     <div key={i} className="flex items-center gap-3 p-2 bg-muted/30 rounded hover:bg-muted/50 transition-colors">
//                                         <div className="h-8 w-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-500">
//                                             U{i + 1}
//                                         </div>
//                                         <div className="flex-1">
//                                             <p className="text-sm font-medium">User {i + 1}</p>
//                                             <p className="text-xs text-muted-foreground">Liked this post</p>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </TabsContent>

//                             <TabsContent value="comments" className="h-full overflow-y-auto pr-2 space-y-3">
//                                 {comments.length === 0 ? (
//                                     <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
//                                         <MessageCircle className="h-8 w-8 mb-2 opacity-50" />
//                                         <p>No comments yet</p>
//                                     </div>
//                                 ) : (
//                                     comments.map(c => (
//                                         <div key={c.id} className="flex gap-3 items-start p-3 bg-muted/30 rounded hover:bg-muted/50">
//                                             <div className="h-8 w-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
//                                                 {c.user_name.charAt(0)}
//                                             </div>
//                                             <div className="flex-1">
//                                                 <div className="flex justify-between items-center mb-1">
//                                                     <span className="text-sm font-semibold">{c.user_name}</span>
//                                                     <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
//                                                 </div>
//                                                 <p className="text-sm break-all">{c.content}</p>
//                                             </div>
//                                             {isAdminOrVendor && (
//                                                 <button className="text-destructive hover:bg-destructive/10 p-1.5 rounded" onClick={() => handleDeleteComment(c.id)}>
//                                                     <Trash2 className="h-4 w-4" />
//                                                 </button>
//                                             )}
//                                         </div>
//                                     ))
//                                 )}
//                             </TabsContent>

//                             <TabsContent value="shares" className="h-full overflow-y-auto pr-2 space-y-2">
//                                 {[...Array(3)].map((_, i) => (
//                                     <div key={i} className="flex items-center gap-3 p-2 bg-muted/30 rounded">
//                                         <div className="h-8 w-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-500">
//                                             S{i + 1}
//                                         </div>
//                                         <div className="flex-1">
//                                             <p className="text-sm font-medium">User {i + 1}</p>
//                                             <p className="text-xs text-muted-foreground">Shared to Facebook</p>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </TabsContent>

//                             <TabsContent value="saves" className="h-full overflow-y-auto pr-2 space-y-2">
//                                 {[...Array(2)].map((_, i) => (
//                                     <div key={i} className="flex items-center gap-3 p-2 bg-muted/30 rounded">
//                                         <div className="h-8 w-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-500">
//                                             B{i + 1}
//                                         </div>
//                                         <div className="flex-1">
//                                             <p className="text-sm font-medium">User {i + 1}</p>
//                                             <p className="text-xs text-muted-foreground">Saved to collection</p>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </TabsContent>
//                         </div>
//                     </Tabs>
//                 </DialogContent>
//             </Dialog>
//         </>
//     );
// };

// export default Posts;
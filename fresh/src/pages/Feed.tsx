import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Bookmark, MessageCircle, Share2, Send, MoreVertical, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MarketingContent {
  id: number;
  description: string;
  shareCount: number;
  saveCount: number;
  createdAt?: string;
  vendor?: { id: number; name?: string; businessName?: string; ownerName?: string; };
  category?: { id: number; name: string; };
  product?: { id: number; name: string; };
  media?: { id: number; fileUrl: string; fileName: string; }[];
  saves?: { id: number; userId: number; userType: string; user?: { id: number; fullName: string; }; }[];
  comments?: MarketingComment[];
}

interface MarketingComment {
  id: number;
  text: string;
  userId: number;
  userType: string;
  createdAt: string;
}

const Feed = () => {
  const [posts, setPosts] = useState<MarketingContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState<{ [key: number]: string }>({});
  const [savesOpen, setSavesOpen] = useState<number | null>(null);
  const { toast } = useToast();
  
  const userId = parseInt(localStorage.getItem("profileId") || "0");
  const userRole = localStorage.getItem("role") || "Customer";

  console.log("User Role:", userRole, "User ID (profileId):", userId);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("http://localhost:3064/marketing", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Fetched marketing content:", data);
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load posts",
        variant: "destructive",
      });
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (!userId) {
      toast({
        title: "Error",
        description: "User not found. Please login again.",
        variant: "destructive",
      });
    }
  }, [userId, toast]);

  const handleSave = async (postId: number) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "Please login to save posts",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const token = localStorage.getItem("accessToken");
      console.log("Saving post:", postId, "User ID:", userId);
      
      const response = await fetch(`http://localhost:3064/marketing/${postId}/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Save response:", data);
      
      await fetchPosts();
      
      toast({
        title: data.saved ? "Saved!" : "Unsaved",
        description: data.saved ? "Post saved successfully" : "Post removed from saved",
      });
    } catch (error) {
      console.error("Error saving post:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save post",
        variant: "destructive",
      });
    }
  };

  const handleComment = async (postId: number) => {
    const comment = commentText[postId];
    if (!comment?.trim()) {
      toast({
        title: "Error",
        description: "Please enter a comment",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      
      const response = await fetch(`http://localhost:3064/marketing/${postId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: comment, userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      if (response.ok) {
        setCommentText({ ...commentText, [postId]: "" });
        await fetchPosts();
        toast({
          title: "Success",
          description: "Comment added successfully",
        });
      }
    } catch (error) {
      console.error("Error commenting:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`http://localhost:3064/marketing/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchPosts();
        toast({
          title: "Success",
          description: "Post deleted successfully",
        });
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`http://localhost:3064/marketing/comment/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchPosts();
        toast({
          title: "Success",
          description: "Comment deleted successfully",
        });
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  const isCustomer = userRole === "Customer";
  const isAdminOrVendor = userRole === "Admin" || userRole === "Vendor" || userRole === "PathalogyVendor";

  const handleShare = async (postId: number) => {
    try {
      // Generate the shareable deep link
      const baseUrl = window.location.origin;
      const deepLink = `${baseUrl}/post/${postId}`;
      
      // Copy the link to clipboard
      await navigator.clipboard.writeText(deepLink);
      
      // Call the backend API to increment share count
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`http://localhost:3064/marketing/${postId}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        fetchPosts();
        toast({
          title: "Link Copied!",
          description: "Share link has been copied to clipboard",
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast({
        title: "Error",
        description: "Failed to copy share link",
        variant: "destructive",
      });
    }
  };

  const getAuthorName = (post: MarketingContent) => {
    if (post.vendor) {
      return post.vendor.businessName || post.vendor.ownerName || post.vendor.name || "Vendor";
    }
    return "Admin";
  };

  const isSavedByUser = (post: MarketingContent) => {
    return post.saves?.some(save => save.user?.id === userId) || false;
  };

  const getAuthorInitials = (name: string | undefined) => {
    if (!name) return "A";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <DashboardHeader />
        <div className="flex-1 p-6 flex items-center justify-center">
          <p className="text-muted-foreground">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <DashboardHeader />
      
      <div className="flex-1 p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-green-100">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Feed</h2>
            <p className="text-gray-600 mt-1">Discover fresh content from your community</p>
          </div>

          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-6 pr-4">
              {posts.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
                  </CardContent>
                </Card>
              ) : (
                posts.map((post) => (
                  <Card key={post.id} className="overflow-hidden bg-white border-2 border-gray-200 shadow-sm hover:shadow-lg hover:border-green-300 transition-all duration-300">
                    <CardHeader className="pb-3 bg-gradient-to-r from-green-50 to-emerald-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="ring-2 ring-green-200">
                            <AvatarFallback className="bg-gradient-to-br from-green-600 to-emerald-600 text-white font-semibold">
                              {getAuthorInitials(getAuthorName(post))}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm text-gray-900">{getAuthorName(post)}</p>
                            <p className="text-xs text-gray-600 flex items-center gap-1">
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500"></span>
                              {post.vendor ? "Vendor" : "Admin"}
                              {post.category && (
                                <>
                                  <span className="text-gray-400">•</span>
                                  <span className="text-green-600 font-medium">{post.category.name}</span>
                                </>
                              )}
                              {post.createdAt && (
                                <>
                                  <span className="text-gray-400">•</span>
                                  <span className="text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</span>
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                        {isAdminOrVendor && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleDeletePost(post.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Post
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="pb-3 px-6">
                      <p className="text-sm mb-4 whitespace-pre-wrap leading-relaxed text-gray-700">{post.description}</p>
                      {post.media && post.media.length > 0 && (
                        <div className="grid gap-2">
                          {post.media.slice(0, 1).map((media) => (
                            <img
                              key={media.id}
                              src={media.fileUrl}
                              alt={media.fileName}
                              className="w-full rounded-xl object-cover max-h-96 border border-green-100 shadow-sm"
                            />
                          ))}
                          {post.media.length > 1 && (
                            <p className="text-xs text-muted-foreground">
                              +{post.media.length - 1} more image{post.media.length > 2 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="flex flex-col gap-3 pb-4 px-6">
                      {/* Stats Display */}
                      {isAdminOrVendor && (
                        <div className="flex items-center gap-2 pb-2 border-b border-green-100">
                          <button 
                            onClick={() => setSavesOpen(post.id)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-all hover:shadow-md border border-emerald-200"
                          >
                            <Bookmark className="h-4 w-4" />
                            <span className="font-semibold text-sm">{post.saves?.length || 0}</span>
                            <span className="text-xs">Saves</span>
                          </button>
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-teal-50 border border-teal-200">
                            <Share2 className="h-4 w-4 text-teal-700" />
                            <span className="font-semibold text-sm text-teal-700">{post.shareCount || 0}</span>
                            <span className="text-xs text-teal-700">Shares</span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200">
                            <MessageCircle className="h-4 w-4 text-green-700" />
                            <span className="font-semibold text-sm text-green-700">{post.comments?.length || 0}</span>
                            <span className="text-xs text-green-700">Comments</span>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 w-full">
                        {isCustomer && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`flex-1 ${isSavedByUser(post) ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200" : "hover:bg-green-50 hover:text-green-700"}`}
                              onClick={() => handleSave(post.id)}
                            >
                              <Bookmark className={`h-4 w-4 mr-2 ${isSavedByUser(post) ? "fill-emerald-600" : ""}`} />
                              {isSavedByUser(post) ? "Saved" : "Save"}
                            </Button>
                            <Button variant="ghost" size="sm" className="flex-1 hover:bg-green-50 hover:text-green-700">
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Comment
                            </Button>
                            <Button variant="ghost" size="sm" className="flex-1 hover:bg-teal-50 hover:text-teal-700" onClick={() => handleShare(post.id)}>
                              <Share2 className="h-4 w-4 mr-2" />
                              Share
                            </Button>
                          </>
                        )}
                        {isAdminOrVendor && (
                          <Button variant="ghost" size="sm" className="w-full hover:bg-green-50 hover:text-green-700">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            View Comments
                          </Button>
                        )}
                      </div>

                      <Separator />

                      {/* Comments Section */}
                      {post.comments && post.comments.length > 0 && (
                        <div className="w-full space-y-3 pt-3 border-t border-green-100">
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Comments:</p>
                          {post.comments.slice(0, 3).map((comment) => (
                            <div key={comment.id} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg hover:bg-green-50 transition-colors">
                              <Avatar className="h-8 w-8 ring-1 ring-gray-200">
                                <AvatarFallback className="bg-gradient-to-br from-gray-400 to-gray-500 text-white text-xs">
                                  {getAuthorInitials(`User ${comment.userId}`)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-gray-700">{comment.userType} #{comment.userId}</p>
                                <p className="text-sm text-gray-600 mt-0.5">{comment.text}</p>
                              </div>
                              {isAdminOrVendor && (
                                <button
                                  className="h-7 w-7 rounded-full flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-all"
                                  onClick={() => handleDeleteComment(comment.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          ))}
                          {post.comments.length > 3 && (
                            <p className="text-xs text-muted-foreground">
                              +{post.comments.length - 3} more comment{post.comments.length > 4 ? 's' : ''}
                            </p>
                          )}
                          <Separator />
                        </div>
                      )}

                      {/* Comment Input - Only for customers */}
                      {isCustomer && (
                        <div className="flex items-center gap-2 w-full pt-2 border-t border-green-100">
                          <Avatar className="h-8 w-8 ring-2 ring-green-100">
                            <AvatarFallback className="bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 text-xs font-semibold">
                              {getAuthorInitials("You")}
                            </AvatarFallback>
                          </Avatar>
                          <Input
                            placeholder="Write a comment..."
                            value={commentText[post.id] || ""}
                            onChange={(e) =>
                              setCommentText({ ...commentText, [post.id]: e.target.value })
                            }
                            onKeyPress={(e) => {
                              if (e.key === "Enter") handleComment(post.id);
                            }}
                            className="flex-1"
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleComment(post.id)}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
      {/* SAVES DIALOG */}
      <Dialog open={savesOpen !== null} onOpenChange={(o) => !o && setSavesOpen(null)}>
        <DialogContent className="max-w-md border-green-200">
          <DialogHeader>
            <DialogTitle className="text-green-700">Saved By ({posts.find(p => p.id === savesOpen)?.saves?.length || 0})</DialogTitle>
            <DialogDescription>Users who saved this post</DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto space-y-2 p-2">
            {posts.find(p => p.id === savesOpen)?.saves?.map(s => (
              <div key={s.id} className="flex items-center gap-3 p-3 border border-green-100 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                    <Bookmark className="h-5 w-5 text-green-600 fill-green-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {s.user?.fullName || `${s.userType} #${s.userId}`}
                  </p>
                  <p className="text-xs text-gray-500">{s.userType}</p>
                </div>
              </div>
            ))}
            {posts.find(p => p.id === savesOpen)?.saves?.length === 0 && (
              <div className="text-center py-12">
                <Bookmark className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500 text-sm">No saves yet</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>    </div>
  );
};

export default Feed;

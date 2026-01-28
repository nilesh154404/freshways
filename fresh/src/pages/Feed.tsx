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

interface MarketingContent {
  id: number;
  description: string;
  shareCount: number;
  saveCount: number;
  vendor?: { id: number; name: string; };
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
          title: "Success",
          description: "Post shared successfully",
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast({
        title: "Error",
        description: "Failed to share post",
        variant: "destructive",
      });
    }
  };

  const getAuthorName = (post: MarketingContent) => {
    if (post.vendor && post.vendor.name) {
      return post.vendor.name;
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
    <div className="flex flex-col min-h-screen bg-background">
      <DashboardHeader />
      
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Feed</h2>
            <p className="text-muted-foreground">See what's happening in your community</p>
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
                  <Card key={post.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {getAuthorInitials(getAuthorName(post))}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm">{getAuthorName(post)}</p>
                            <p className="text-xs text-muted-foreground">
                              {post.vendor ? "Vendor" : "Admin"}
                              {post.category && ` • ${post.category.name}`}
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

                    <CardContent className="pb-3">
                      <p className="text-sm mb-3 whitespace-pre-wrap">{post.description}</p>
                      {post.media && post.media.length > 0 && (
                        <div className="grid gap-2">
                          {post.media.slice(0, 1).map((media) => (
                            <img
                              key={media.id}
                              src={`http://localhost:3064${media.fileUrl}`}
                              alt={media.fileName}
                              className="w-full rounded-lg object-cover max-h-96"
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

                    <CardFooter className="flex flex-col gap-3 pb-3">
                      {/* Stats Display */}
                      <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
                        {isAdminOrVendor && (
                          <>
                            <span>{post.shareCount || 0} shares</span>
                            <span>{post.comments?.length || 0} comments</span>
                          </>
                        )}
                        {isCustomer && (
                          <span>{post.comments?.length || 0} comments</span>
                        )}
                      </div>

                      <Separator />

                      {/* Action Buttons */}
                      <div className="flex items-center justify-around w-full">
                        {isCustomer && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={isSavedByUser(post) ? "text-blue-500" : ""}
                              onClick={() => handleSave(post.id)}
                            >
                              <Bookmark className={`h-4 w-4 mr-2 ${isSavedByUser(post) ? "fill-blue-500" : ""}`} />
                              {isSavedByUser(post) ? "Saved" : "Save"}
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Comment
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleShare(post.id)}>
                              <Share2 className="h-4 w-4 mr-2" />
                              Share
                            </Button>
                          </>
                        )}
                        {isAdminOrVendor && (
                          <Button variant="ghost" size="sm">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            View Comments
                          </Button>
                        )}
                      </div>

                      <Separator />

                      {/* Comments Section */}
                      {post.comments && post.comments.length > 0 && (
                        <div className="w-full space-y-2">
                          <p className="text-sm font-semibold">Comments:</p>
                          {post.comments.slice(0, 3).map((comment) => (
                            <div key={comment.id} className="flex gap-2 items-start">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="bg-muted text-xs">
                                  {getAuthorInitials(`User ${comment.userId}`)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="text-xs font-medium">{comment.userType} #{comment.userId}</p>
                                <p className="text-sm">{comment.text}</p>
                              </div>
                              {isAdminOrVendor && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleDeleteComment(comment.id)}
                                >
                                  <Trash2 className="h-3 w-3 text-red-600" />
                                </Button>
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
                        <div className="flex items-center gap-2 w-full">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-muted text-xs">
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
    </div>
  );
};

export default Feed;

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Heart, MessageCircle, Share2, Bookmark, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MarketingContent {
  id: number;
  description: string;
  shareCount: number;
  saveCount: number;
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

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<MarketingContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`http://localhost:3064/marketing/${id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setPost(data);
      } catch (error) {
        console.error("Error fetching post:", error);
        toast({
          title: "Error",
          description: "Failed to load post",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id, toast]);

  const handleOpenInApp = () => {
    // Try to open the deep link
    const deepLink = `freshways://post/${id}`;
    
    // For web, redirect to login or feed if user has token
    const token = localStorage.getItem("accessToken");
    if (token) {
      navigate(`/feed`);
    } else {
      navigate(`/login`);
    }
    
    // Attempt to open the app (for mobile web browsers)
    window.location.href = deepLink;
  };

  const getAuthorName = (post: MarketingContent) => {
    if (post.vendor) {
      return post.vendor.businessName || post.vendor.ownerName || post.vendor.name || "Vendor";
    }
    return "Admin";
  };

  const getAuthorInitials = (post: MarketingContent) => {
    const name = getAuthorName(post);
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading post...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Post not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Open in App Banner */}
      {showBanner && (
        <div className="sticky top-0 z-50 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                  <rect width="24" height="24" rx="5" fill="white"/>
                  <path d="M12 6L8 10H11V16H13V10H16L12 6Z" fill="#059669"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">FreshWays App</p>
                <p className="text-xs opacity-90 truncate">Get the full experience</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleOpenInApp}
                size="sm"
                className="bg-white text-emerald-600 hover:bg-emerald-50 font-semibold"
              >
                Open in App
              </Button>
              <Button
                onClick={() => setShowBanner(false)}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-emerald-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Post Content */}
      <div className="max-w-2xl mx-auto p-4 py-6">
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getAuthorInitials(post)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{getAuthorName(post)}</p>
                  {post.category && (
                    <p className="text-xs text-muted-foreground">{post.category.name}</p>
                  )}
                </div>
              </div>
            </div>

            {post.description && (
              <p className="text-sm whitespace-pre-wrap">{post.description}</p>
            )}
          </CardHeader>

          <CardContent className="space-y-4 p-0">
            {/* Media Display */}
            {post.media && post.media.length > 0 && (
              <div className="relative w-full">
                {post.media.map((mediaItem) => (
                  <img
                    key={mediaItem.id}
                    src={mediaItem.fileUrl}
                    alt={mediaItem.fileName}
                    className="w-full object-cover"
                  />
                ))}
              </div>
            )}

            {/* Engagement Stats */}
            <div className="px-6">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-4">
                  {/* <span className="flex items-center">
                    <Heart className="h-4 w-4 mr-1" />
                    Likes
                  </span> */}
                  <span className="flex items-center">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {post.comments?.length || 0} comments
                  </span>
                  <span>{post.shareCount || 0} shares</span>
                </div>
                <span>{post.saveCount || 0} saves</span>
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="px-6 pb-6">
              <div className="grid grid-cols-3 gap-2">
                {/* <Button variant="ghost" size="sm" className="w-full">
                  <Heart className="h-4 w-4 mr-2" />
                  Like
                </Button> */}
                <Button variant="ghost" size="sm" className="w-full">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Comment
                </Button>
                <Button variant="ghost" size="sm" className="w-full">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="ghost" size="sm" className="w-full">
                  <Share2 className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>

            {/* Comments Section */}
            {post.comments && post.comments.length > 0 && (
              <div className="px-6 pb-6 space-y-4">
                <Separator />
                <h3 className="font-semibold">Comments</h3>
                {post.comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        U
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted rounded-lg p-3">
                        <p className="text-sm font-medium">User {comment.userId}</p>
                        <p className="text-sm">{comment.text}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Call to action */}
        <div className="mt-6 text-center">
          <Button
            onClick={handleOpenInApp}
            size="lg"
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
          >
            Open FreshWays App for More
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;

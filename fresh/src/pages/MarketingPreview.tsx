
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface MarketingItem {
    id: number;
    description: string;
    media: { fileUrl: string; fileType: string }[];
    category: { name: string };
    product?: { label: string };
    vendor?: { businessName: string };
}

export default function MarketingPreview() {
    const { id } = useParams<{ id: string }>();
    const [item, setItem] = useState<MarketingItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | boolean>(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`http://192.168.1.44:3064/marketing/${id}`);
                setItem(res.data);
            } catch (err: any) {
                console.error(err);
                setError(err.message + (err.response ? ` - ${err.response.status}` : ""));
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    const handleOpenApp = () => {
        const deepLink = `freshwayz://marketing-content?id=${id}`;
        window.location.href = deepLink;
    };



    if (loading) {
        return (
            <div className="h-[100dvh] w-full flex items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className="h-[100dvh] w-full flex flex-col items-center justify-center p-6 text-center bg-gray-50">
                <div className="bg-white p-8 rounded-2xl shadow-sm border max-w-sm w-full">
                    <h1 className="text-xl font-bold mb-2 text-gray-900">Post Unavailable</h1>
                    <p className="text-gray-500 mb-4">{typeof error === 'string' ? error : "This content may have been deleted or moved."}</p>
                    <Button onClick={() => window.location.reload()} variant="outline">Try Again</Button>
                </div>
            </div>
        );
    }

    const firstMedia = item.media?.[0]?.fileUrl;
    const isVideo = item.media?.[0]?.fileType?.startsWith("video") || firstMedia?.endsWith(".mp4");
    const title = item.product?.label || item.category?.name || "Freshways Update";
    const fullDesc = item.description || "";
    const truncatedDesc = fullDesc.length > 150 ? fullDesc.slice(0, 150) + "..." : fullDesc;

    const imageUrl = !isVideo ? firstMedia : "https://freshways.in/default-video-thumbnail.jpg";
    const vendorName = item.vendor?.businessName || "Freshways Partner";

    return (
        <>
            <Helmet>
                <title>{title} | Freshways</title>
                <meta property="og:title" content={title} />
                <meta property="og:description" content={truncatedDesc} />
                {imageUrl && <meta property="og:image" content={imageUrl} />}
                <meta property="og:type" content="article" />
                <meta name="twitter:card" content="summary_large_image" />
            </Helmet>

            {/* Main Container - NO SCROLL, Dynamic Viewport Height */}
            <div className="h-[100dvh] bg-gray-100 flex items-center justify-center md:p-4 font-sans overflow-hidden fixed inset-0">

                <div className="bg-white w-full md:max-w-md md:rounded-2xl md:shadow-xl overflow-hidden h-full flex flex-col relative">

                    {/* Header */}
                    <div className="px-4 py-3 border-b flex items-center justify-between bg-white z-20 shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                                {vendorName?.charAt(0) || "F"}
                            </div>
                            <span className="font-bold text-lg text-primary tracking-tight hidden sm:inline">{vendorName}</span>
                        </div>
                    </div>

                    {/* Content - Hidden Overflow, Flex Column */}
                    <div className="flex-1 flex flex-col overflow-hidden relative">

                        {/* Media Section - Takes available space */}
                        <div
                            className="w-full bg-black relative group flex-1 flex items-center justify-center overflow-hidden"
                            onClick={handleOpenApp}
                        >
                            {isVideo ? (
                                <div className="relative w-full h-full">
                                    <video
                                        src={firstMedia}
                                        className="w-full h-full object-contain"
                                        poster={imageUrl}
                                        playsInline
                                        controls
                                    />
                                </div>
                            ) : (
                                <img
                                    src={firstMedia}
                                    alt={title}
                                    className="w-full h-full object-contain"
                                />
                            )}
                        </div>

                        {/* Details Section - Fixed at absolute bottom of CONTENT area (behind footer) or just flowed?
                  To ensure content sits BEHIND footer and footer overlaps:
                  We put Details in normal flow, but add padding-bottom to ensure text isn't hidden.
                  But user wants "scroll disabled". So text shouldn't scroll.
                  So details should be visible but truncated.
                  We'll put it in a shrink-0 container.
              */}
                        <div className="p-5 pb-32 shrink-0 bg-white" onClick={handleOpenApp}>
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <h2 className="font-bold text-xl text-gray-900 mb-1 line-clamp-1">{title}</h2>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <span className="font-medium text-gray-700">{vendorName}</span>
                                        <span>•</span>
                                        <span>{item.category?.name}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Description - Unselectable */}
                            <div className="relative">
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap select-none line-clamp-3">
                                    {truncatedDesc}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer Overlay - Fade Effect + CTA - PINNED TO BOTTOM OF CONTAINER (Screen) */}
                    <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none">

                        {/* Gradient Fade */}
                        <div className="h-32 bg-gradient-to-t from-white via-white/95 to-transparent w-full" />

                        {/* Solid White Base with Button + Safe Area */}
                        <div className="bg-white px-4 pt-0 pointer-events-auto pb-[env(safe-area-inset-bottom,20px)]">
                            <Button
                                className="w-full h-12 text-base font-semibold shadow-lg rounded-full mb-4"
                                onClick={handleOpenApp}
                            >
                                Open in Freshways
                            </Button>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}

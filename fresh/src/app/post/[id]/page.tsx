// "use client";

// import { useEffect, useState } from "react";
// import axios from "axios";
// import { useParams } from "next/navigation";

// export default function PostPage() {
//   const { id } = useParams();
//   const [post, setPost] = useState<any>(null);

//   useEffect(() => {
//     axios.get(`http://localhost:3064/marketing/${id}`)
//       .then(res => setPost(res.data))
//       .catch(() => alert("Post not found"));
//   }, [id]);

//   if (!post) return <div className="p-10">Loading...</div>;

//   return (
//     <div className="p-10">
//       <h1 className="text-2xl font-bold">{post.product?.label}</h1>
//       <img src={post.media?.[0]?.fileUrl} className="w-96 mt-4 rounded" />
//       <p className="mt-4 text-lg">{post.description}</p>
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";

const API_BASE = API_BASE_URL; // your backend

export default function PostDetails({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`${API_BASE}/marketing/${params.id}`);
        setPost(res.data);
      } catch (err) {
        console.error("Failed to load post");
      }
    };

    fetchPost();
  }, [params.id]);

  if (!post) return <div className="p-10 text-center">Loading post...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{post.product?.label}</h1>

      {post.media?.[0]?.fileUrl && (
        <img
          src={post.media[0].fileUrl}
          className="w-full rounded-lg mb-6"
        />
      )}

      <p className="text-lg text-gray-700">{post.description}</p>
    </div>
  );
}

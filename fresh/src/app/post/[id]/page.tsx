"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";

export default function PostPage() {
  const { id } = useParams();
  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    axios.get(`http://localhost:3064/marketing/${id}`)
      .then(res => setPost(res.data))
      .catch(() => alert("Post not found"));
  }, [id]);

  if (!post) return <div className="p-10">Loading...</div>;

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">{post.product?.label}</h1>
      <img src={post.media?.[0]?.fileUrl} className="w-96 mt-4 rounded" />
      <p className="mt-4 text-lg">{post.description}</p>
    </div>
  );
}

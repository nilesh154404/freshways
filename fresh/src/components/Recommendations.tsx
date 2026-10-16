import React, { useEffect, useState } from 'react';
import { getRecommendations } from '../lib/freshAIService.js';

type Product = { ID?: number; Name?: string; [key: string]: any };

export default function Recommendations({ userId }: { userId: number | string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getRecommendations(userId);
        if (mounted) setProducts(res || []);
      } catch (err: any) {
        if (mounted) setError(err?.message || 'Failed to load recommendations');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [userId]);

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-3">Product Recommendations</h3>

      {loading && <div className="text-sm text-gray-600">Loading recommendations…</div>}
      {error && <div className="text-red-600">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-3">
        {products.length === 0 && !loading && <div className="text-gray-500">No recommendations found.</div>}

        {products.map((p, i) => {
          const isStr = typeof p === 'string';
          const title = isStr ? (p.includes(':') ? p.split(':')[0] : p) : (p.Name ?? p.title ?? 'Unnamed product');
          const description = isStr ? (p.includes(':') ? p.substring(p.indexOf(':') + 1).trim() : '') : (p.reason ?? p.Description ?? '');
          return (
            <div key={i} className="border rounded p-3 shadow-sm">
              <div className="font-semibold">{title}</div>
              {!isStr && p?.ID && <div className="text-xs text-gray-500">ID: {p.ID}</div>}
              {description && <div className="text-sm mt-2 text-gray-700">{description}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

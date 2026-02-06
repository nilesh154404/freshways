import { Fragment, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const API_BASE = "http://localhost:3064";

type DailyPrice = {
  id: number;
  amount: number;
  mrp_amount: number;
  date: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  product: { id: number; label: string };
  vendor: { id: number; businessName: string };
};

type PriceLog = {
  id: number;
  old_amount: number | null;
  new_amount: number;
  old_mrp: number | null;
  new_mrp: number;
  changedAt: string;
  product: { id: number; label: string };
  vendor: { id: number; businessName: string };
};

export default function ProductPriceLog() {
  const [prices, setPrices] = useState<DailyPrice[]>([]);
  const [priceLogs, setPriceLogs] = useState<Map<string, PriceLog[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [productFilter, setProductFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  const role = localStorage.getItem("role");
  const profileId = localStorage.getItem("profileId");
  const isVendor = role === "Vendor" || role === "PathalogyVendor";

  const fetchPrices = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (role === "Vendor" || role === "PathalogyVendor") {
        if (profileId) params.vendorId = profileId;
      }

      const response = await axios.get(`${API_BASE}/daily-price`, { params });
      setPrices(response.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load product price log");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  const products = useMemo(() => {
    const map = new Map<number, string>();
    prices.forEach((p) => map.set(p.product.id, p.product.label));
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [prices]);

  const baseFiltered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return prices.filter((p) => {
      if (productFilter !== "all" && p.product.id.toString() !== productFilter) return false;
      if (isVendor && !p.isActive) return false;
      if (!keyword) return true;
      const vendorName = p.vendor?.businessName?.toLowerCase() || "";
      const productName = p.product?.label?.toLowerCase() || "";
      return vendorName.includes(keyword) || productName.includes(keyword);
    });
  }, [prices, productFilter, search, isVendor]);

  const toggleExpanded = async (key: string, productId: number, vendorId: number) => {
    const wasExpanded = expandedKeys.has(key);
    
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

    // Fetch price logs if expanding and not already loaded
    if (!wasExpanded && !priceLogs.has(key)) {
      try {
        const params = role === "Admin" ? {} : { vendorId };
        console.log(`Fetching price history for product ${productId}, vendor ${vendorId}`, params);
        const response = await axios.get(
          `${API_BASE}/daily-price/product/${productId}/history`,
          { params }
        );
        console.log(`Price history response:`, response.data);
        setPriceLogs((prev) => new Map(prev).set(key, response.data || []));
      } catch (error) {
        console.error("Error fetching price history:", error);
        toast.error("Failed to load price history");
      }
    }
  };

  const rowsWithPrevious = useMemo(() => {
    const grouped = new Map<string, DailyPrice[]>();
    baseFiltered.forEach((item) => {
      const key = `${item.product.id}-${item.vendor.id}`;
      const list = grouped.get(key) ?? [];
      list.push(item);
      grouped.set(key, list);
    });

    const result: Array<DailyPrice & { key: string }> = [];

    grouped.forEach((list) => {
      list.sort((a, b) => {
        const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateDiff !== 0) return dateDiff;
        return new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime();
      });

      const current = list[0];
      const key = `${current.product.id}-${current.vendor.id}`;
      result.push({
        ...current,
        key,
      });
    });

    return result;
  }, [baseFiltered]);

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      <div className="flex-1 space-y-6 p-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Product Price Log</h2>
          <p className="text-muted-foreground">Date-wise price history for all products</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Price History</CardTitle>
            <CardDescription>Track historical prices, including previous and current active entries</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`grid gap-4 ${isVendor ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Filter by product</label>
                <Select value={productFilter} onValueChange={setProductFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All products" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All products</SelectItem>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className={`grid gap-2 ${isVendor ? "md:col-span-1" : "md:col-span-2"}`}>
                <label className="text-sm font-medium">Search</label>
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search product or vendor" />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Updated At</TableHead>
                    <TableHead>Product</TableHead>
                    {(role === "Admin") && <TableHead>Vendor</TableHead>}
                    <TableHead>Current Amount</TableHead>
                    <TableHead>Current MRP</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>History</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={role === "Admin" ? 8 : 7} className="text-center text-muted-foreground">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : rowsWithPrevious.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={role === "Admin" ? 8 : 7} className="text-center text-muted-foreground">
                        No price history found
                      </TableCell>
                    </TableRow>
                  ) : (
                    rowsWithPrevious.map((p) => {
                      const logs = priceLogs.get(p.key) || [];
                      
                      return (
                        <Fragment key={p.key}>
                          <TableRow key={p.id}>
                            <TableCell>{p.date?.toString().split("T")[0]}</TableCell>
                            <TableCell>{(p.updatedAt || p.createdAt || "").toString().replace("T", " ").slice(0, 19)}</TableCell>
                            <TableCell>{p.product?.label}</TableCell>
                            {role === "Admin" && <TableCell>{p.vendor?.businessName}</TableCell>}
                            <TableCell>₹ {Number(p.amount).toFixed(2)}</TableCell>
                            <TableCell>₹ {Number(p.mrp_amount).toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge variant={p.isActive ? "default" : "secondary"}>
                                {p.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => toggleExpanded(p.key, p.product.id, p.vendor.id)}
                              >
                                {expandedKeys.has(p.key) ? "Hide" : "View"}
                              </Button>
                            </TableCell>
                          </TableRow>
                          {expandedKeys.has(p.key) && (
                            <TableRow>
                              <TableCell colSpan={role === "Admin" ? 8 : 7} className="bg-muted/30">
                                <div className="space-y-2">
                                  <div className="text-sm font-medium">Complete Price Change History</div>
                                  <div className="rounded-md border bg-background">
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Changed At</TableHead>
                                          <TableHead>Old Amount</TableHead>
                                          <TableHead>New Amount</TableHead>
                                          <TableHead>Old MRP</TableHead>
                                          <TableHead>New MRP</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {!logs || logs.length === 0 ? (
                                          <TableRow>
                                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                              {priceLogs.has(p.key) ? "No price change history found" : "Loading..."}
                                            </TableCell>
                                          </TableRow>
                                        ) : (
                                          logs.map((log) => (
                                            <TableRow key={log.id}>
                                              <TableCell>
                                                {new Date(log.changedAt).toLocaleString()}
                                              </TableCell>
                                              <TableCell>
                                                {log.old_amount !== null ? `₹ ${Number(log.old_amount).toFixed(2)}` : "—"}
                                              </TableCell>
                                              <TableCell>
                                                ₹ {Number(log.new_amount).toFixed(2)}
                                              </TableCell>
                                              <TableCell>
                                                {log.old_mrp !== null ? `₹ ${Number(log.old_mrp).toFixed(2)}` : "—"}
                                              </TableCell>
                                              <TableCell>
                                                ₹ {Number(log.new_mrp).toFixed(2)}
                                              </TableCell>
                                            </TableRow>
                                          ))
                                        )}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

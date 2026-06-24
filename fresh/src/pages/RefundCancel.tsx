import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { RefreshCw, Ban, Upload, HelpCircle, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface OrderedItem {
  orderId: number;
  productId: number | null;
  productName: string;
  quantity: number | null;
  amount: number | null;
  createdAt: string;
}

interface RefundCancelRequest {
  id: number;
  contactName: string;
  reason: string;
  imageUrl: string | null;
  status: string;
  createdAt: string;
  productName: string | null;
  order: {
    id: number;
    createdAt: string;
  };
}

const RefundCancel = () => {
  const [requests, setRequests] = useState<RefundCancelRequest[]>([]);
  const [orderedItems, setOrderedItems] = useState<OrderedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    contactName: '',
    selectedItemKey: '', // "orderId:productId:productName"
    reason: '',
    imageUrl: '',
  });

  const filteredOrderedItems = orderedItems.filter((item) => {
    // Check if there is already a return request with the same orderId AND (same productId OR same productName)
    const hasRequest = requests.some((req) => {
      const sameOrder = req.order?.id === item.orderId;
      if (!sameOrder) return false;
      
      if (item.productId && req.product) {
        return req.product.id === item.productId;
      }
      return req.productName === item.productName;
    });
    return !hasRequest;
  });

  const getUserId = () => {
    try {
      const profileId = localStorage.getItem('profileId');
      if (profileId) return parseInt(profileId);
      
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id || 1;
      }
      return 1;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return 1;
    }
  };

  const customerId = getUserId();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    fetchRequests();
    fetchOrderHistory();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get<RefundCancelRequest[]>(
        `${API_BASE_URL}/order-return/customer/${customerId}`,
        { headers: getAuthHeaders() }
      );
      setRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch requests', error);
      toast.error('Failed to load cancellation requests history');
    }
  };

  const fetchOrderHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get<any[]>(
        `${API_BASE_URL}/orders/customer/${customerId}`,
        { headers: getAuthHeaders() }
      );
      
      const parsedItems: OrderedItem[] = [];
      response.data.forEach((order: any) => {
        if (order.listedOrders) {
          order.listedOrders.forEach((item: any) => {
            parsedItems.push({
              orderId: order.id,
              productId: item.product?.id || null,
              productName: item.productName || item.product?.label || 'Custom Product',
              quantity: item.quantity,
              amount: item.amount,
              createdAt: order.createdAt,
            });
          });
        }
      });
      setOrderedItems(parsedItems);
    } catch (error) {
      console.error('Failed to fetch order history', error);
      // Just keep orderedItems empty, don't break page
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('customerId', customerId.toString());

    try {
      setUploading(true);
      const response = await axios.post<{ fileUrl: string }>(
        `${API_BASE_URL}/files/upload`,
        uploadData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setFormData((prev) => ({ ...prev, imageUrl: response.data.fileUrl }));
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Failed to upload image', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.selectedItemKey) {
      toast.error('Please select a product from your order history');
      return;
    }

    setSubmitLoading(true);
    try {
      // Split target key
      const [orderIdStr, productIdStr, productName] = formData.selectedItemKey.split('|');
      const orderId = parseInt(orderIdStr, 10);
      const parsedProductId = productIdStr ? parseInt(productIdStr, 10) : NaN;
      const productId = isNaN(parsedProductId) ? undefined : parsedProductId;

      const payload = {
        customerId,
        orderId: isNaN(orderId) ? 0 : orderId,
        productId,
        productName,
        contactName: formData.contactName,
        reason: formData.reason,
        imageUrl: formData.imageUrl || undefined,
      };

      await axios.post(`${API_BASE_URL}/order-return`, payload, {
        headers: getAuthHeaders(),
      });

      toast.success('Refund and cancellation request submitted successfully');
      setIsDialogOpen(false);
      setFormData({
        contactName: '',
        selectedItemKey: '',
        reason: '',
        imageUrl: '',
      });
      fetchRequests();
    } catch (error) {
      console.error('Failed to submit request', error);
      toast.error('Failed to submit cancellation request');
    } finally {
      setSubmitLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'CANCELLED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <RefreshCw className="h-8 w-8 text-green-600 animate-spin-slow" />
            Refund and Cancellation
          </h1>
          <p className="text-gray-500 mt-1">
            Request a refund or cancellation for your ordered items and check request status.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white shadow-md">
              <Ban className="h-4 w-4" />
              Cancel and Refund
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Cancel & Refund Request
              </DialogTitle>
              <DialogDescription>
                Fill out this form to submit your cancellation or refund request.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contactName" className="text-sm font-semibold">Your Name *</Label>
                <Input
                  id="contactName"
                  value={formData.contactName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, contactName: e.target.value }))}
                  placeholder="Enter contact name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="productSelect" className="text-sm font-semibold">Select Product (From Order History) *</Label>
                {loading ? (
                  <p className="text-sm text-gray-500">Loading order history...</p>
                ) : filteredOrderedItems.length === 0 ? (
                  <p className="text-sm text-rose-500">No products available for cancellation (or requests already submitted).</p>
                ) : (
                  <Select
                    value={formData.selectedItemKey}
                    onValueChange={(val) => setFormData((prev) => ({ ...prev, selectedItemKey: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product to cancel" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredOrderedItems.map((item, idx) => (
                        <SelectItem
                          key={idx}
                          value={`${item.orderId}|${item.productId || ''}|${item.productName}`}
                        >
                          Order #{item.orderId} - {item.productName} ({new Date(item.createdAt).toLocaleDateString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason" className="text-sm font-semibold">Reason of Cancellation *</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
                  placeholder="Tell us why you want to cancel or request a refund..."
                  required
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fileUpload" className="text-sm font-semibold">Attach Product Image (Optional)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="fileUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="cursor-pointer"
                  />
                </div>
                {uploading && <p className="text-xs text-muted-foreground">Uploading image...</p>}
                {formData.imageUrl && (
                  <div className="mt-2 border rounded p-1 w-20 h-20 overflow-hidden">
                    <img src={formData.imageUrl} alt="preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <DialogFooter className="pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitLoading || uploading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {submitLoading ? 'Saving...' : 'Confirm & Save'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Guidelines Policy Card */}
      <Card className="border border-green-100 bg-gradient-to-br from-green-50 to-white shadow-sm overflow-hidden rounded-xl">
        <div className="p-6 flex flex-col md:flex-row items-start gap-4">
          <div className="p-3 bg-green-500 rounded-lg text-white">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-gray-900">Refund and Cancellation Policy Guidelines</h2>
            <div className="grid gap-2 text-sm text-gray-600 md:grid-cols-3">
              <div className="flex gap-2 items-start">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>Orders can be cancelled before confirmation for a full instant refund.</span>
              </div>
              <div className="flex gap-2 items-start">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>Refund requests must contain clear reasoning and an optional proof image.</span>
              </div>
              <div className="flex gap-2 items-start">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>Approved requests will instantly change status to Cancelled.</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* History section status pending */}
      <Card className="border shadow-md rounded-xl overflow-hidden bg-white">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-xl font-bold flex items-center gap-2 text-gray-800">
            <FileText className="h-5 w-5 text-gray-500" />
            Request History
          </CardTitle>
          <CardDescription>
            Track your refund and cancellation submissions.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <AlertCircle className="h-12 w-12 text-gray-300 mb-2" />
              <p className="text-gray-500 font-medium">No cancellation requests found</p>
              <p className="text-sm text-gray-400">Your refund and cancel requests will show up here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 uppercase text-xs font-semibold border-b">
                    <th className="px-6 py-4">Request ID</th>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Product Name</th>
                    <th className="px-6 py-4">Contact Name</th>
                    <th className="px-6 py-4">Reason</th>
                    <th className="px-6 py-4">Proof Image</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900">#{req.id}</td>
                      <td className="px-6 py-4">Order #{req.order?.id}</td>
                      <td className="px-6 py-4 font-medium text-gray-800">{req.productName || 'Unknown Product'}</td>
                      <td className="px-6 py-4">{req.contactName}</td>
                      <td className="px-6 py-4 max-w-xs truncate" title={req.reason}>
                        {req.reason}
                      </td>
                      <td className="px-6 py-4">
                        {req.imageUrl ? (
                          <a
                            href={req.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block border border-gray-200 rounded p-0.5 bg-white hover:border-green-500 transition-colors"
                          >
                            <img
                              src={req.imageUrl}
                              alt="Proof"
                              className="w-10 h-10 object-cover rounded"
                            />
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No image</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${getStatusColor(req.status)}`}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RefundCancel;

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Ban, CheckCircle2, ClipboardList, RefreshCw, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface RefundCancelRequest {
  id: number;
  contactName: string;
  reason: string;
  imageUrl: string | null;
  status: string;
  createdAt: string;
  productName: string | null;
  customer: {
    id: number;
    name: string;
  };
  order: {
    id: number;
    createdAt: string;
  };
}

const CancelRequests = () => {
  const [requests, setRequests] = useState<RefundCancelRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const role = localStorage.getItem('role');
      const profileId = localStorage.getItem('profileId');
      
      let url = `${API_BASE_URL}/order-return`;
      if ((role === 'Vendor' || role === 'PathalogyVendor') && profileId) {
        url = `${API_BASE_URL}/order-return/vendor/${profileId}`;
      }

      const response = await axios.get<RefundCancelRequest[]>(
        url,
        { headers: getAuthHeaders() }
      );
      setRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch requests', error);
      toast.error('Failed to load cancellation requests');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancel = async (id: number) => {
    if (!confirm('Are you sure you want to approve and confirm this cancellation? This will change the order status to CANCELLED.')) {
      return;
    }

    try {
      setActionLoading(id);
      await axios.patch(
        `${API_BASE_URL}/order-return/${id}/confirm-cancel`,
        {},
        { headers: getAuthHeaders() }
      );
      toast.success(`Cancellation request #${id} approved and order cancelled.`);
      fetchRequests();
    } catch (error) {
      console.error('Failed to confirm cancel request', error);
      toast.error('Failed to confirm cancellation');
    } finally {
      setActionLoading(null);
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
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ClipboardList className="h-8 w-8 text-rose-600" />
            Cancellation Requests
          </h1>
          <p className="text-gray-500 mt-1">
            Review and approve customer refund and order cancellation requests.
          </p>
        </div>

        <Button
          onClick={fetchRequests}
          variant="outline"
          className="gap-2 border-gray-200"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Main List */}
      <Card className="border shadow-md rounded-xl overflow-hidden bg-white">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-xl font-bold flex items-center gap-2 text-gray-800">
            <Ban className="h-5 w-5 text-gray-500" />
            Active Cancellation & Refund Requests
          </CardTitle>
          <CardDescription>
            Approve requests to automatically mark associated orders as Cancelled.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
              <span className="ml-2 text-gray-500 font-medium">Loading requests...</span>
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <AlertCircle className="h-12 w-12 text-gray-300 mb-2" />
              <p className="text-gray-500 font-medium font-semibold">No cancellation requests</p>
              <p className="text-sm text-gray-400">All caught up! Customer requests will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 uppercase text-xs font-semibold border-b">
                    <th className="px-6 py-4">Request ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Product Name</th>
                    <th className="px-6 py-4">Contact Name</th>
                    <th className="px-6 py-4">Reason</th>
                    <th className="px-6 py-4">Proof Image</th>
                    <th className="px-6 py-4">Submitted Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900">#{req.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800">
                          {req.customer?.fullName || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-400">ID: #{req.customer?.id}</div>
                      </td>
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
                            className="inline-block border border-gray-200 rounded p-0.5 bg-white hover:border-rose-500 transition-colors"
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
                      <td className="px-6 py-4 text-center">
                        {req.status.toUpperCase() === 'PENDING' ? (
                          <Button
                            onClick={() => handleConfirmCancel(req.id)}
                            size="sm"
                            disabled={actionLoading === req.id}
                            className="bg-rose-500 hover:bg-rose-600 text-white gap-1 flex items-center justify-center mx-auto"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Confirm Cancel
                          </Button>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Processed</span>
                        )}
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

export default CancelRequests;

import { useState, useEffect } from 'react';
import { Store, MapPin, Star, Package, Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { API_BASE_URL } from '@/lib/api';

const API_URL = API_BASE_URL;

interface Vendor {
  id: number;
  businessName: string;
  ownerName?: string;
  businessAddress?: string;
  gstNumber?: string;
  email?: string;
  user?: {
    id: number;
    username: string;
    email: string;
    phoneNumber: string;
  };
}

interface VendorPlan {
  id: number;
  planName: string;
  description: string;
  price: number;
  duration: string;
  vendorId: number;
}

interface Subscription {
  vendorId: number;
}

const BrowseVendors = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorPlans, setVendorPlans] = useState<{ [key: number]: VendorPlan[] }>({});
  const [mySubscriptions, setMySubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

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

  useEffect(() => {
    fetchVendors();
    fetchMySubscriptions();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await fetch(`${API_URL}/vendors`);
      if (response.ok) {
        const data = await response.json();
        setVendors(Array.isArray(data) ? data : []);
        
        // Fetch plans for each vendor
        data.forEach((vendor: Vendor) => {
          fetchVendorPlans(vendor.id);
        });
      }
    } catch (error) {
      console.error('Failed to fetch vendors', error);
      toast({
        title: 'Info',
        description: 'Could not load vendors. Make sure backend is running.',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorPlans = async (vendorId: number) => {
    try {
      const response = await fetch(`${API_URL}/vendor-subscription-plans/vendor/${vendorId}`);
      if (response.ok) {
        const data = await response.json();
        setVendorPlans(prev => ({
          ...prev,
          [vendorId]: Array.isArray(data) ? data : []
        }));
      }
    } catch (error) {
      console.error(`Failed to fetch plans for vendor ${vendorId}`, error);
    }
  };

  const fetchMySubscriptions = async () => {
    try {
      const response = await fetch(`${API_URL}/subscriptions/customer/${customerId}`);
      if (response.ok) {
        const data = await response.json();
        setMySubscriptions(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch subscriptions', error);
    }
  };

  const isSubscribed = (vendorId: number) => {
    return mySubscriptions.some(sub => sub.vendorId === vendorId);
  };

  const handleSubscribe = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setSelectedPlan('');
    setIsDialogOpen(true);
  };

  const handleConfirmSubscription = async () => {
    if (!selectedPlan) {
      toast({
        title: 'Error',
        description: 'Please select a subscription plan',
        variant: 'destructive',
      });
      return;
    }

    try {
      const planId = parseInt(selectedPlan);
      
      // Validate planId is a valid number
      if (isNaN(planId) || planId <= 0) {
        throw new Error('Invalid plan selected. Please select a valid subscription plan.');
      }

      console.log('Subscribing with planId:', planId, 'customerId:', customerId);
      
      // Create subscription with correct payload
      const response = await fetch(`${API_URL}/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: customerId,
          planId: planId,
          active: true,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Successfully subscribed to ${selectedVendor?.businessName}!`,
        });
        setIsDialogOpen(false);
        setSelectedVendor(null);
        setSelectedPlan('');
        fetchMySubscriptions();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to subscribe`);
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create subscription. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading vendors...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Store className="h-8 w-8" />
            Browse Vendors
          </h1>
          <p className="text-gray-500 mt-1">
            Discover and subscribe to vendor services
          </p>
        </div>
      </div>

      {vendors.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Store className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No vendors available</h3>
            <p className="text-gray-500">
              Check back later for new vendors
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {vendors.map((vendor) => (
            <Card key={vendor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">
                      {vendor.businessName}
                    </CardTitle>
                    {(vendor.businessAddress || vendor.ownerName) && (
                      <CardDescription className="flex items-center gap-1 text-sm">
                        {vendor.businessAddress ? (
                          <>
                            <MapPin className="h-3 w-3" />
                            {vendor.businessAddress}
                          </>
                        ) : (
                          <>Owner: {vendor.ownerName}</>
                        )}
                      </CardDescription>
                    )}
                  </div>
                  {isSubscribed(vendor.id) && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      <Check className="h-3 w-3 mr-1" />
                      Subscribed
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="text-sm space-y-1">
                  {vendor.user?.phoneNumber && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="font-medium">Contact:</span>
                      <span>{vendor.user.phoneNumber}</span>
                    </div>
                  )}
                  {(vendor.user?.email || vendor.email) && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="font-medium">Email:</span>
                      <span className="truncate">{vendor.user?.email || vendor.email}</span>
                    </div>
                  )}
                </div>

                {vendorPlans[vendor.id] && vendorPlans[vendor.id].length > 0 && (
                  <div className="pt-3 border-t">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Available Plans:</span>
                    </div>
                    <div className="space-y-2 max-h-24 overflow-y-auto">
                      {vendorPlans[vendor.id].map((plan) => (
                        <div key={plan.id} className="flex justify-between items-start text-sm bg-gray-50 p-2 rounded gap-2">
                          <span className="font-medium flex-1 break-words">{plan.planName}</span>
                          <span className="text-green-600 font-bold whitespace-nowrap">₹{plan.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter>
                <Button
                  onClick={() => handleSubscribe(vendor)}
                  disabled={isSubscribed(vendor.id) || !vendorPlans[vendor.id]?.length}
                  className="w-full"
                  variant={isSubscribed(vendor.id) ? "outline" : "default"}
                >
                  {isSubscribed(vendor.id) ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Already Subscribed
                    </>
                  ) : !vendorPlans[vendor.id]?.length ? (
                    'No Plans Available'
                  ) : (
                    'Subscribe Now'
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Subscription Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Subscribe to {selectedVendor?.businessName}</DialogTitle>
            <DialogDescription>
              Choose a subscription plan to get started
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="plan">Select Plan *</Label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a subscription plan" />
                </SelectTrigger>
                <SelectContent>
                  {selectedVendor && vendorPlans[selectedVendor.id]?.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id.toString()}>
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">{plan.planName}</span>
                        <span className="ml-4 text-green-600 font-semibold">₹{plan.price}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPlan && selectedVendor && (
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <h4 className="font-semibold text-blue-900">Plan Details</h4>
                {vendorPlans[selectedVendor.id]?.find(p => p.id === parseInt(selectedPlan)) && (
                  <>
                    {(() => {
                      const plan = vendorPlans[selectedVendor.id].find(p => p.id === parseInt(selectedPlan));
                      return (
                        <>
                          {plan?.description && (
                            <p className="text-sm text-blue-800">
                              {plan.description}
                            </p>
                          )}
                          {plan?.duration && (
                            <div className="flex items-center gap-2 text-sm text-blue-700">
                              <Clock className="h-4 w-4" />
                              Duration: {plan.duration}
                            </div>
                          )}
                          {plan?.price && (
                            <div className="text-lg font-bold text-blue-900 mt-2">
                              ₹{typeof plan.price === 'string' ? plan.price : plan.price.toFixed(2)}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSubscription}>
              Confirm Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BrowseVendors;

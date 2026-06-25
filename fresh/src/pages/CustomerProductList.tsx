import { useState, useEffect } from 'react';
import { Plus, Trash2, ShoppingCart, Package } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { API_BASE_URL } from '@/lib/api';

const API_URL = API_BASE_URL;

interface CustomerProductListItem {
  id: number;
  productName: string | null;
  quantity: number | null;
  amount: number | null;
  notes: string | null;
  product: {
    id: number;
    label: string;
    dailyPrices?: { amount: number }[];
  } | null;
  vendorSubscriptionPlan: {
    id: number;
    label: string;
    vendor?: {
      businessName?: string;
      ownerName?: string;
    };
  };
}

interface VendorSubscriptionPlan {
  id: number;
  planName: string;
  price: number;
  duration: string;
  vendorId?: number;
}

interface Product {
  id: number;
  label: string;
  dailyPrices?: { amount: number }[];
  category: any;
}

const CustomerProductList = () => {
  const [productList, setProductList] = useState<CustomerProductListItem[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<VendorSubscriptionPlan[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    vendorSubscriptionPlanId: '',
    productId: '',
    productName: '',
    quantity: '',
    amount: '',
    notes: '',
  });

  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredProducts = formData.productName.trim()
    ? products.filter((product) =>
        product.label?.toLowerCase().includes(formData.productName.toLowerCase())
      )
    : [];

  const handleProductNameChange = (val: string) => {
    const matchingProduct = products.find(
      (p) => p.label?.toLowerCase() === val.trim().toLowerCase()
    );

    setFormData((prev) => ({
      ...prev,
      productName: val,
      productId: matchingProduct ? matchingProduct.id.toString() : '',
      amount: matchingProduct
        ? (matchingProduct.dailyPrices?.[0]?.amount || 0).toString()
        : prev.amount,
    }));
    setShowSuggestions(true);
  };

  // Get customer ID from localStorage
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
    fetchProductList();
    fetchSubscriptionPlans();
  }, []);

  // Fetch vendor products when a vendor is selected
  useEffect(() => {
    if (selectedVendorId) {
      console.log('Vendor ID selected:', selectedVendorId);
      fetchProducts(selectedVendorId);
    }
  }, [selectedVendorId]);

  const fetchProductList = async () => {
    try {
      const response = await fetch(`${API_URL}/customer-product-list/customer/${customerId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setProductList(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Fetch product list error:', error);
      setProductList([]);
      // Don't show error toast if it's just empty
      if (error.message !== 'HTTP 404') {
        toast({
          title: 'Info',
          description: 'Could not load product list. Make sure backend is running.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionPlans = async () => {
    try {
      const response = await fetch(`${API_URL}/subscriptions/customer/${customerId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Raw subscription data:', data);
        
        // Transform the subscription data to extract plan details
        const transformedPlans = Array.isArray(data) ? data.map((subscription: any) => ({
          id: subscription.plan?.id,
          planName: `${subscription.plan?.vendor?.businessName || subscription.plan?.vendor?.ownerName || 'Unknown Vendor'} - ${subscription.plan?.label || 'Unknown Plan'}`,
          price: subscription.plan?.price,
          duration: subscription.plan?.duration,
          vendorId: subscription.plan?.vendor?.id,
        })) : [];
        
        console.log('Transformed plans:', transformedPlans);
        setSubscriptionPlans(transformedPlans);
      } else {
        setSubscriptionPlans([]);
      }
    } catch (error) {
      console.error('Failed to fetch subscription plans', error);
      setSubscriptionPlans([]);
    }
  };

  const fetchProducts = async (vendorId?: number) => {
    try {
      const url = vendorId 
        ? `${API_URL}/products?vendorId=${vendorId}`
        : `${API_URL}/products`;
      
      console.log('Fetching products from URL:', url);
      const response = await fetch(url);
      
      console.log('Products response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Products fetched:', data);
        
        // Handle paginated response (items property) or direct array
        let productsArray: Product[] = [];
        if (Array.isArray(data)) {
          productsArray = data;
        } else if (data.items && Array.isArray(data.items)) {
          productsArray = data.items;
        } else if (data.data && Array.isArray(data.data)) {
          productsArray = data.data;
        }
        
        console.log('Products array:', productsArray);
        setProducts(productsArray);
      } else {
        console.log('Failed to fetch products, setting empty array');
        setProducts([]);
      }
    } catch (error) {
      console.error('Failed to fetch products', error);
      setProducts([]);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.vendorSubscriptionPlanId) {
      toast({
        title: 'Error',
        description: 'Please select a subscription plan',
        variant: 'destructive',
      });
      return;
    }

    try {
      const payload = {
        customerId: customerId,
        vendorSubscriptionPlanId: parseInt(formData.vendorSubscriptionPlanId),
        productId: formData.productId ? parseInt(formData.productId) : undefined,
        productName: formData.productName || undefined,
        quantity: formData.quantity ? parseFloat(formData.quantity) : undefined,
        amount: formData.amount ? parseFloat(formData.amount) : undefined,
        notes: formData.notes || undefined,
      };

      console.log('Adding product with payload:', payload);
      console.log('Customer ID:', customerId);
      console.log('Posting to:', `${API_URL}/customer-product-list`);

      const response = await fetch(`${API_URL}/customer-product-list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);
      
      const responseText = await response.text();
      console.log('Response body:', responseText);

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Product added to your list',
        });
        setIsDialogOpen(false);
        setFormData({
          vendorSubscriptionPlanId: '',
          productId: '',
          productName: '',
          quantity: '',
          amount: '',
          notes: '',
        });
        fetchProductList();
      } else {
        console.error('Failed to add product, status:', response.status);
        throw new Error(`Failed to add product: ${response.status}`);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: 'Error',
        description: 'Failed to add product to list',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/customer-product-list/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Product removed from list',
        });
        fetchProductList();
      } else {
        throw new Error('Failed to delete product');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove product',
        variant: 'destructive',
      });
    }
  };

  const handlePlaceOrder = async (vendorSubscriptionPlanId: number) => {
    try {
      const communityId = 1; // Default to main community (Geras)

      const payload = {
        customerId,
        vendorSubscriptionPlanId,
        communityId,
      };

      console.log('Placing order with payload:', payload);

      const response = await fetch(`${API_URL}/orders/place-from-product-list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Order response status:', response.status);

      if (response.ok) {
        const orderData = await response.json();
        console.log('Order created:', orderData);
        toast({
          title: 'Success',
          description: `Order #${orderData.id} placed successfully!`,
        });
        // Refresh the product list
        fetchProductList();
      } else {
        const errorText = await response.text();
        console.error('Failed to place order:', errorText);
        throw new Error(`Failed to place order: ${response.status}`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to place order',
        variant: 'destructive',
      });
    }
  };

  const handleProductSelect = (productId: string) => {
    try {
      const selectedProduct = products.find((p) => p.id.toString() === productId);
      if (selectedProduct) {
        console.log('Selected product:', selectedProduct);
        setFormData({
          ...formData,
          productId,
          productName: selectedProduct.label || '',
          amount: (selectedProduct.dailyPrices?.[0]?.amount || 0).toString(),
        });
      } else {
        console.log('Product not found for ID:', productId);
        setFormData({ ...formData, productId });
      }
    } catch (error) {
      console.error('Error selecting product:', error);
      setFormData({ ...formData, productId });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading your product lists...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-8 w-8" />
            My Product Lists
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your recurring product lists for subscriptions
          </p>
        </div>

        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Product to List</DialogTitle>
              <DialogDescription>
                Add a product to your subscription list
              </DialogDescription>
            </DialogHeader>

            {subscriptionPlans.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-500 mb-4">
                  You need an active subscription to add products.
                </p>
                <p className="text-sm text-gray-400">
                  Please subscribe to a vendor plan first.
                </p>
              </div>
            ) : (
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subscription">Subscription Plan *</Label>
                  <Select
                    value={formData.vendorSubscriptionPlanId}
                    onValueChange={(value) => {
                      console.log('Plan selected, value:', value);
                      const selectedPlan = subscriptionPlans.find(p => p.id.toString() === value);
                      console.log('Selected plan object:', selectedPlan);
                      console.log('Vendor ID from plan:', selectedPlan?.vendorId);
                      setFormData({ ...formData, vendorSubscriptionPlanId: value, productId: '', productName: '' });
                      if (selectedPlan?.vendorId) {
                        console.log('Setting vendor ID to:', selectedPlan.vendorId);
                        setSelectedVendorId(selectedPlan.vendorId);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subscription plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {subscriptionPlans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id.toString()}>
                          {plan.planName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product">Product (Optional)</Label>
                  <Select value={formData.productId} onValueChange={handleProductSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select from catalog" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500">No products available</div>
                      ) : (
                        products.map((product) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.label || 'Unknown'} - ₹{product.dailyPrices?.[0]?.amount || '0'}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 relative">
                  <Label htmlFor="productName">Product Name</Label>
                  <Input
                    id="productName"
                    value={formData.productName}
                    onChange={(e) => handleProductNameChange(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setShowSuggestions(false)}
                    placeholder="Custom product name"
                    autoComplete="off"
                  />
                  {showSuggestions && filteredProducts.length > 0 && (
                    <div className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-md border border-input bg-popover text-popover-foreground shadow-lg">
                      <div className="py-1">
                        {filteredProducts.map((product) => (
                          <div
                            key={product.id}
                            onMouseDown={(e) => {
                              e.preventDefault(); // Prevents blur event on input
                              handleProductSelect(product.id.toString());
                              setShowSuggestions(false);
                            }}
                            className="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground flex justify-between items-center transition-colors"
                          >
                            <span className="font-medium">{product.label}</span>
                            <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                              ₹{product.dailyPrices?.[0]?.amount || '0'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.1"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Any special instructions..."
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button type="submit" className="w-full">
                  Add to List
                </Button>
              </DialogFooter>
            </form>
            )}
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {productList.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No products in your list</h3>
            <p className="text-gray-500 mb-4">
              Start building your recurring product lists
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {productList.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <span className="text-lg">
                    {item.product?.label || item.productName || 'Custom Product'}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteProduct(item.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardTitle>
                <CardDescription>
                  {item.vendorSubscriptionPlan
                    ? `${item.vendorSubscriptionPlan.vendor?.businessName || item.vendorSubscriptionPlan.vendor?.ownerName || 'Vendor'} - ${item.vendorSubscriptionPlan.label || 'Plan'}`
                    : 'No Plan'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {item.quantity && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium">{item.quantity}</span>
                  </div>
                )}
                {item.amount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">₹{item.amount}</span>
                  </div>
                )}
                {item.notes && (
                  <div className="text-sm mt-2 pt-2 border-t">
                    <span className="text-gray-600">Notes:</span>
                    <p className="text-gray-800 mt-1">{item.notes}</p>
                  </div>
                )}
                <div className="pt-4 flex gap-2">
                  <Button
                    onClick={() => handlePlaceOrder(item.vendorSubscriptionPlan.id)}
                    className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Place Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerProductList;

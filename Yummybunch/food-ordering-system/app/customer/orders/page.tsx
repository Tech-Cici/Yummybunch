'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CustomerHeader } from "@/components/customer-header";
import { useAuth } from '@/app/providers';
import { toast } from "sonner";
import { Clock, MapPin, Phone, ShoppingBag, AlertCircle, CheckCircle2, XCircle, Loader2, Eye, Plus, Minus, LogOut, Utensils, ChefHat, Receipt } from "lucide-react";
import { Input } from "@/components/ui/input";

interface OrderItem {
  id: string;
  menuItemId: string;
  itemName: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
}

interface Order {
  id: string | number;
  restaurantId: string | number;
  restaurantName: string;
  restaurantImage: string;
  items: OrderItem[];
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  specialInstructions?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [editedItems, setEditedItems] = useState<OrderItem[]>([]);
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && token) {
      fetchOrders();
    } else if (!authLoading && !token) {
      router.push('/auth/login');
    }
  }, [authLoading, token]);

  const fetchOrders = async () => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/orders/customer', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else if (response.status === 404) {
        // Handle case when customer has no orders yet
        setOrders([]);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch orders:', errorText);
        throw new Error('Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;

    try {
      const response = await fetch(`http://localhost:8080/api/orders/${selectedOrder.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to cancel order');
      }

      toast.success('Order cancelled successfully');
      setIsCancelDialogOpen(false);
      fetchOrders(); // Refresh orders list
    } catch (err) {
      toast.error('Failed to cancel order. Please try again.');
      console.error('Error cancelling order:', err);
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setEditedItems([...order.items]);
    setIsDetailsDialogOpen(true);
  };

  const handleQuantityChange = (itemId: string, change: number) => {
    setEditedItems(prevItems => 
      prevItems.map(item => {
        if (item.id === itemId) {
          const newQuantity = Math.max(1, item.quantity + change);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder || !token) return;

    try {
      const response = await fetch(`http://localhost:8080/api/orders/${selectedOrder.id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'PENDING'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update order');
      }

      toast.success('Order updated successfully');
      setIsDetailsDialogOpen(false);
      fetchOrders(); // Refresh orders list
    } catch (err) {
      toast.error('Failed to update order. Please try again.');
      console.error('Error updating order:', err);
    }
  };

  const calculateTotal = (items: OrderItem[]) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      PENDING: { variant: 'secondary', icon: Clock, label: 'Pending' },
      CONFIRMED: { variant: 'default', icon: CheckCircle2, label: 'Confirmed' },
      PREPARING: { variant: 'default', icon: Loader2, label: 'Preparing' },
      READY: { variant: 'default', icon: ShoppingBag, label: 'Ready' },
      DELIVERED: { variant: 'success', icon: CheckCircle2, label: 'Delivered' },
      CANCELLED: { variant: 'destructive', icon: XCircle, label: 'Cancelled' }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLogout = () => {
    // Clear auth token and user data
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <CustomerHeader />
        <main className="flex-1 p-6">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center py-8">Loading orders...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <CustomerHeader />
        <main className="flex-1 p-6">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center text-red-500 py-8">{error}</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-orange-50 to-white">
      <CustomerHeader />
      <main className="flex-1 p-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Receipt className="h-6 w-6 text-orange-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800">Your Orders</h1>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/customer/restaurants')}
                  className="flex items-center gap-2 hover:bg-orange-50"
                >
                  <Utensils className="h-4 w-4" />
                  Order Food
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>

            {orders.length === 0 ? (
              <Card className="border-2 border-dashed border-orange-200 bg-orange-50/50">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="p-4 bg-orange-100 rounded-full mb-4">
                    <ShoppingBag className="h-12 w-12 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-medium mb-2 text-gray-800">No orders yet</h3>
                  <p className="text-gray-600 text-center mb-4">
                    Start ordering from your favorite restaurants
                  </p>
                  <Button 
                    onClick={() => router.push('/customer/restaurants')}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Browse Restaurants
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {orders.map(order => (
                  <Card key={order.id} className="overflow-hidden border-orange-100 hover:border-orange-200 transition-colors">
                    <CardHeader className="pb-4 bg-gradient-to-r from-orange-50 to-white">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative h-16 w-16">
                            <img
                              src={order.restaurantImage || "/placeholder.svg"}
                              alt={order.restaurantName}
                              className="h-full w-full object-cover rounded-md shadow-sm"
                            />
                          </div>
                          <div>
                            <CardTitle className="text-gray-800">{order.restaurantName}</CardTitle>
                            <CardDescription className="flex items-center gap-2">
                              <ChefHat className="h-4 w-4 text-orange-500" />
                              Order #{typeof order.id === 'string' ? order.id.slice(0, 8) : order.id.toString().slice(0, 8)}
                            </CardDescription>
                          </div>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="h-4 w-4 text-orange-500" />
                              {formatDate(order.createdAt)}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <ShoppingBag className="h-4 w-4 text-orange-500" />
                              {order.items.length} items
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-medium text-gray-800">
                              ${order.totalAmount?.toFixed(2) ?? '0.00'}
                            </div>
                            <div className="text-sm text-gray-600">
                              Total Amount
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-orange-100 pt-4">
                          <div className="space-y-2">
                            {order.items.map(item => (
                              <div key={item.id} className="flex justify-between text-sm">
                                <span className="text-gray-800">
                                  {item.quantity}x {item.itemName}
                                </span>
                                <span className="text-gray-600">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {order.status === 'PENDING' && (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => handleViewDetails(order)}
                              className="hover:bg-orange-50"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedOrder(order);
                                setIsCancelDialogOpen(true);
                              }}
                              className="hover:bg-red-50 text-red-600"
                            >
                              Cancel Order
                            </Button>
                            <Button
                              onClick={() => {
                                if (order.restaurantId) {
                                  router.push(`/customer/restaurants/${order.restaurantId}`);
                                } else {
                                  toast.error('Restaurant information not available');
                                }
                              }}
                              className="bg-orange-600 hover:bg-orange-700"
                            >
                              Order Again
                            </Button>
                          </div>
                        )}

                        {order.status === 'DELIVERED' && (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => handleViewDetails(order)}
                              className="hover:bg-orange-50"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            <Button
                              onClick={() => {
                                if (order.restaurantId) {
                                  router.push(`/customer/restaurants/${order.restaurantId}`);
                                } else {
                                  toast.error('Restaurant information not available');
                                }
                              }}
                              className="bg-orange-600 hover:bg-orange-700"
                            >
                              Order Again
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Order Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-orange-500" />
              Order Details
            </DialogTitle>
            <DialogDescription>
              {selectedOrder?.restaurantName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid gap-4">
              {editedItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg bg-orange-50/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-800">{item.itemName}</h4>
                      <span className="text-sm text-gray-600">
                        (Item ID: {item.menuItemId})
                      </span>
                    </div>
                    <div className="mt-1 space-y-1">
                      <p className="text-sm text-gray-600">
                        Price: ${item.price.toFixed(2)} each
                      </p>
                      {item.specialInstructions && (
                        <p className="text-sm text-gray-600">
                          Special Instructions: {item.specialInstructions}
                        </p>
                      )}
                    </div>
                  </div>
                  {selectedOrder?.status === 'PENDING' ? (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(item.id, -1)}
                        className="hover:bg-orange-50"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(item.id, 1)}
                        className="hover:bg-orange-50"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-gray-600">
                        Quantity: {item.quantity}
                      </span>
                      <span className="font-medium text-gray-800">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-orange-100 pt-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">Order Status</span>
                  <Badge variant={selectedOrder?.status === 'PENDING' ? 'default' : 'secondary'}>
                    {selectedOrder?.status}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">Order Time</span>
                  <span className="text-gray-600">
                    {selectedOrder?.createdAt ? formatDate(selectedOrder.createdAt) : 'N/A'}
                  </span>
                </div>
                {selectedOrder?.specialInstructions && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800">Special Instructions</span>
                    <span className="text-gray-600">
                      {selectedOrder.specialInstructions}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">Total Amount</span>
                  <span className="text-lg font-bold text-gray-800">
                    ${calculateTotal(editedItems).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {selectedOrder?.status === 'PENDING' && (
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDetailsDialogOpen(false)}
                  className="hover:bg-orange-50"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateOrder}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Update Order
                </Button>
              </DialogFooter>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Cancel Order
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCancelDialogOpen(false)}
              className="hover:bg-orange-50"
            >
              Keep Order
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelOrder}
              className="bg-red-600 hover:bg-red-700"
            >
              Cancel Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
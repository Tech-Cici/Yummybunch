"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Clock, CheckCircle, XCircle, AlertCircle, Bell, Plus, ChefHat, UtensilsCrossed } from "lucide-react"
import { RestaurantSidebar } from "@/components/restaurant-sidebar"
import { RestaurantHeader } from "@/components/restaurant-header"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/app/providers"
import Image from "next/image"
import { useRouter } from "next/navigation"
// import { useSession } from "next-auth/react"
// import { useAuth } from "@/app/providers"

// Sample data
// const orders = [ ... ] - Remove this entire block

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PREPARING: "bg-blue-100 text-blue-800",
  READY: "bg-green-100 text-green-800",
  COMPLETED: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-red-100 text-red-800",
}

const statusIcons: Record<string, React.ReactNode> = {
  PENDING: <Clock className="h-4 w-4" />,
  PREPARING: <AlertCircle className="h-4 w-4" />,
  READY: <CheckCircle className="h-4 w-4" />,
  COMPLETED: <CheckCircle className="h-4 w-4" />,
  CANCELLED: <XCircle className="h-4 w-4" />,
}

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  available: boolean;
  category: string;
}

interface Menu {
  id: number;
  name: string;
  description: string;
  items: MenuItem[];
  active: boolean;
  pdfUrl: string;
}

interface Order {
  id: number;
  customer: {
    id: number;
    name: string;
    email: string;
    phoneNumber: string;
  };
  items: {
    id: number;
    name: string;
    quantity: number;
    price: number;
  }[];
  status: 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  total: number;
  orderTime: string;
  deliveryAddress: string;
  specialInstructions: string;
}

interface Notification {
  id: string;
  type: 'new_order';
  orderId: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export default function RestaurantDashboard() {
  // const { data: session } = useSession();
  const { user, token, loading: contextLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("new")
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: ''
  })
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [restaurantData, setRestaurantData] = useState<any>(null);
  const [restaurantError, setRestaurantError] = useState<string>("");
  const filteredOrders = orders.filter((order) => {
    if (activeTab === "new") return order.status === "PENDING"
    if (activeTab === "preparing") return order.status === "PREPARING"
    if (activeTab === "ready") return order.status === "READY"
    if (activeTab === "history") return order.status === "COMPLETED" || order.status === "CANCELLED"
    return true
  })

  const router = useRouter();

  useEffect(() => {
    if (!contextLoading) {
      setLoading(true);
      const fetchData = async () => {
        try {
          if (!user || !token) {
            throw new Error("User not authenticated");
          }

          // First fetch restaurant data
          const restaurantResponse = await fetch("http://localhost:8080/api/restaurants/me", {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          });

          if (!restaurantResponse.ok) {
            throw new Error("Failed to fetch restaurant data");
          }

          const restaurantData = await restaurantResponse.json();
          setRestaurantData(restaurantData);

          // Then fetch menu items
          try {
            const menuResponse = await fetch(`http://localhost:8080/api/restaurants/menu`, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
            });

            if (menuResponse.ok) {
              const menuData = await menuResponse.json();
              // Extract items from the first active menu
              const activeMenu = Array.isArray(menuData) ? menuData.find(menu => menu.active) : null;
              setMenuItems(activeMenu?.items || []);
            } else if (menuResponse.status === 404) {
              // No menu yet - that's okay
              setMenuItems([]);
            } else {
              throw new Error("Failed to fetch menu items");
            }
          } catch (menuErr) {
            console.warn("Menu fetch warning:", menuErr);
            setMenuItems([]);
          }

          // Fetch orders
          const ordersResponse = await fetch(`http://localhost:8080/api/restaurants/orders`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          });

          if (ordersResponse.ok) {
            const ordersData = await ordersResponse.json();
            setOrders(ordersData);
          } else {
            throw new Error("Failed to fetch orders");
          }

        } catch (err) {
          console.error("Error fetching data:", err);
          setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [user, token, contextLoading]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!user || !token) {
        throw new Error("User not authenticated");
      }

      const response = await fetch("http://localhost:8080/api/restaurants/menu", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newItem),
      });

      if (!response.ok) {
        throw new Error("Failed to add menu item");
      }

      const addedItem = await response.json();
      setMenuItems(prev => [...prev, addedItem]);
      setNewItem({ name: '', description: '', price: '', imageUrl: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add menu item");
      console.error("Error adding menu item:", err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, newStatus: Order['status']) => {
    try {
      const response = await fetch(`http://localhost:8080/api/restaurants/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus }
          : order
      ));

    } catch (err) {
      console.error('Error updating order status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update order status');
    }
  };

  // const handleNotificationClick = async (notification: Notification) => {
  //   try {
  //     if (!user || !token) {
  //       throw new Error("User not authenticated");
  //     }

  //     // Mark notification as read
  //     await fetch(`http://localhost:8080/api/restaurants/notifications/${notification.id}/read`, {
  //       method: "PUT",
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         "Content-Type": "application/json",
  //       },
  //     });

  //     // Update local state
  //     setNotifications(prev =>
  //       prev.map(n =>
  //         n.id === notification.id ? { ...n, read: true } : n
  //       )
  //     );
  //     setUnreadCount(prev => prev - 1);

  //     // Navigate to the order if it's a new order notification
  //     if (notification.type === 'new_order') {
  //       setActiveTab('new');
  //     }
  //   } catch (err) {
  //     console.error("Error handling notification:", err);
  //     setError(err instanceof Error ? err.message : "Failed to handle notification");
  //   }
  // };

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50">
        <RestaurantHeader />
        <div className="flex">
          <RestaurantSidebar />
          <main className="flex-1 p-6">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || restaurantError) {
    return (
      <div className="min-h-screen bg-orange-50">
        <RestaurantHeader />
        <div className="flex">
          <RestaurantSidebar />
          <main className="flex-1 p-6">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                {error || restaurantError}
              </div>
              <Button 
                onClick={() => window.location.reload()}
                className="bg-orange-500 hover:bg-orange-600"
              >
                Try Again
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!restaurantData) {
    return (
      <div className="min-h-screen bg-orange-50">
        <RestaurantHeader />
        <div className="flex">
          <RestaurantSidebar />
          <main className="flex-1 p-6">
            <div className="text-center">
              <div className="text-orange-500 mb-4">
                No restaurant data found. Please set up your restaurant profile first.
              </div>
              <Button 
                onClick={() => router.push('/restaurant/settings')}
                className="bg-orange-500 hover:bg-orange-600"
              >
                Set Up Restaurant
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Update the revenue calculation to handle NaN
  const totalRevenue = orders.reduce((sum, order) => {
    const amount = order.total || 0;
    return sum + amount;
  }, 0);

  const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  return (
    <div className="flex h-screen">
      <RestaurantSidebar />
      <div className="flex-1 flex flex-col">
        <RestaurantHeader />
        <main className="flex-1 overflow-y-auto bg-orange-50/50">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-white/80 backdrop-blur-sm border-orange-200 hover:shadow-lg transition-shadow">
                <CardHeader className="border-b border-orange-100">
                  <CardTitle className="text-orange-700">Total Orders</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-4xl font-bold text-orange-600">{orders.length}</p>
                  <p className="text-sm text-orange-500 mt-2">All-time orders</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur-sm border-orange-200 hover:shadow-lg transition-shadow">
                <CardHeader className="border-b border-orange-100">
                  <CardTitle className="text-orange-700">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-4xl font-bold text-green-600">
                    ${totalRevenue.toFixed(2)}
                  </p>
                  <p className="text-sm text-green-500 mt-2">Total earnings</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur-sm border-orange-200 hover:shadow-lg transition-shadow">
                <CardHeader className="border-b border-orange-100">
                  <CardTitle className="text-orange-700">Average Order Value</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-4xl font-bold text-amber-600">
                    ${averageOrderValue.toFixed(2)}
                  </p>
                  <p className="text-sm text-amber-500 mt-2">Per order</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="new" className="space-y-4">
              <TabsList>
                <TabsTrigger value="new">New Orders</TabsTrigger>
                <TabsTrigger value="preparing">Preparing</TabsTrigger>
                <TabsTrigger value="ready">Ready</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              {['new', 'preparing', 'ready', 'history'].map((tab) => (
                <TabsContent key={tab} value={tab} className="space-y-4">
                  <div className="grid gap-4">
                    {filteredOrders.map((order) => (
                      <Card key={order.id} className="bg-white/80 backdrop-blur-sm border-orange-200">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                              <CardDescription>
                                {new Date(order.orderTime).toLocaleString()}
                              </CardDescription>
                            </div>
                            <Badge className={statusColors[order.status]}>
                              <span className="flex items-center gap-1">
                                {statusIcons[order.status]}
                                {order.status}
                              </span>
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Customer</h4>
                              <p>{order.customer.name}</p>
                              <p className="text-sm text-gray-500">{order.customer.email}</p>
                              <p className="text-sm text-gray-500">{order.customer.phoneNumber}</p>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Items</h4>
                              <ul className="space-y-1">
                                {order.items.map((item, index) => (
                                  <li key={index} className="flex justify-between">
                                    <span>{item.quantity}x {item.name}</span>
                                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t">
                              <div>
                                <p className="font-medium">Total</p>
                                <p className="text-2xl font-bold text-orange-600">${order.total.toFixed(2)}</p>
                              </div>
                              {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                                <div className="space-x-2">
                                  {order.status === 'PENDING' && (
                                    <Button
                                      onClick={() => handleUpdateOrderStatus(order.id, 'PREPARING')}
                                      className="bg-blue-600 hover:bg-blue-700"
                                    >
                                      Start Preparing
                                    </Button>
                                  )}
                                  {order.status === 'PREPARING' && (
                                    <Button
                                      onClick={() => handleUpdateOrderStatus(order.id, 'READY')}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      Mark Ready
                                    </Button>
                                  )}
                                  {order.status === 'READY' && (
                                    <Button
                                      onClick={() => handleUpdateOrderStatus(order.id, 'COMPLETED')}
                                      className="bg-gray-600 hover:bg-gray-700"
                                    >
                                      Complete Order
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}

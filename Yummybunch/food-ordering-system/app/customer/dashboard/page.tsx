"use client"

import { useState, useEffect } from 'react'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, XCircle, Search, LogOut, MapPin, Phone, ShoppingBag, Star, ArrowRight } from "lucide-react"
import { CustomerHeader } from "@/components/customer-header"
import { useRouter } from "next/navigation"
import { useAuth } from '@/app/providers'
import Cookies from 'js-cookie'

interface Order {
  id: string;
  restaurantId: string;
  restaurantName: string;
  restaurantImage: string;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  createdAt: string;
}

interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  phoneNumber: string;
  rating: number;
  imageUrl: string;
  cuisine: string;
}

const statusColors: Record<string, string> = {
  "in-progress": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

const statusIcons: Record<string, React.ReactNode> = {
  "in-progress": <Clock className="h-4 w-4" />,
  delivered: <CheckCircle className="h-4 w-4" />,
  cancelled: <XCircle className="h-4 w-4" />,
}

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState("orders")
  const router = useRouter()
  const { setUser, setToken, token } = useAuth()
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [favoriteRestaurants, setFavoriteRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (token) {
      fetchDashboardData()
    } else {
      router.push('/auth/login')
    }
  }, [token])

  const fetchDashboardData = async () => {
    try {
      if (!token) {
        throw new Error('No authentication token available');
      }

      // Fetch recent orders
      const ordersResponse = await fetch('http://localhost:8080/api/customers/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!ordersResponse.ok) {
        if (ordersResponse.status === 401) {
          throw new Error('Session expired. Please log in again.');
        }
        const errorData = await ordersResponse.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch orders');
      }

      const ordersData = await ordersResponse.json();
      setRecentOrders(Array.isArray(ordersData) ? ordersData.slice(0, 3) : []);

      // Fetch favorite restaurants
      const restaurantsResponse = await fetch('http://localhost:8080/api/customers/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!restaurantsResponse.ok) {
        if (restaurantsResponse.status === 401) {
          throw new Error('Session expired. Please log in again.');
        }
        const errorData = await restaurantsResponse.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch favorite restaurants');
      }

      const restaurantsData = await restaurantsResponse.json();
      setFavoriteRestaurants(Array.isArray(restaurantsData) ? restaurantsData : []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      if (err instanceof Error) {
        if (err.message.includes('Session expired') || err.message.includes('authentication')) {
          setUser(null);
          setToken(null);
          Cookies.remove('token');
          Cookies.remove('user');
          router.push('/auth/login');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to load dashboard data. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear auth context
    setUser(null)
    setToken(null)
    
    // Clear cookies
    Cookies.remove('token')
    Cookies.remove('user')
    
    // Redirect to home
    router.push('/')
  }

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      PENDING: { variant: 'secondary', label: 'Pending' },
      CONFIRMED: { variant: 'default', label: 'Confirmed' },
      PREPARING: { variant: 'default', label: 'Preparing' },
      READY: { variant: 'default', label: 'Ready' },
      DELIVERED: { variant: 'success', label: 'Delivered' },
      CANCELLED: { variant: 'destructive', label: 'Cancelled' }
    }

    const config = statusConfig[status]
    return (
      <Badge variant={config.variant as any}>
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <CustomerHeader />
        <main className="flex-1 p-6">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center py-8">Loading dashboard...</div>
          </div>
        </main>
      </div>
    )
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
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <CustomerHeader />
      <main className="flex-1 p-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">My Dashboard</h1>
              <div className="flex gap-4">
                <Link href="/restaurants">
                  <Button>
                    <Search className="mr-2 h-4 w-4" />
                    Find Restaurants
                  </Button>
                </Link>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">Lifetime orders</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1</div>
                  <p className="text-xs text-muted-foreground">Currently in progress</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Favorite Restaurants</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">Saved for quick ordering</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="orders" onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="orders">My Orders</TabsTrigger>
                <TabsTrigger value="favorites">Favorite Restaurants</TabsTrigger>
              </TabsList>

              <TabsContent value="orders" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>View and manage your recent food orders</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recentOrders.length === 0 ? (
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center py-8">
                          <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                          <p className="text-muted-foreground text-center mb-4">
                            Start ordering from your favorite restaurants
                          </p>
                          <Button onClick={() => router.push('/customer/restaurants')}>
                            Browse Restaurants
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {recentOrders.map(order => (
                          <Card key={order.id} className="overflow-hidden">
                            <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="relative h-12 w-12">
                                    <img
                                      src={order.restaurantImage || "/placeholder.svg"}
                                      alt={order.restaurantName || 'Restaurant'}
                                      className="h-full w-full object-cover rounded-md"
                                    />
                                  </div>
                          <div>
                                    <CardTitle className="text-base">{order.restaurantName || 'Unknown Restaurant'}</CardTitle>
                                    <CardDescription>
                                      {order.createdAt ? formatDate(order.createdAt) : 'Date not available'}
                                    </CardDescription>
                          </div>
                        </div>
                                {order.status && getStatusBadge(order.status)}
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="flex justify-between items-center">
                                <div className="text-lg font-medium">
                                  ${(order.totalAmount || 0).toFixed(2)}
                        </div>
                                {order.restaurantId && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.push(`/customer/restaurants/${order.restaurantId}`)}
                                  >
                                    Order Again
                            </Button>
                          )}
                        </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => router.push('/customer/orders')}>
                      View All Orders
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="favorites" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Favorite Restaurants</CardTitle>
                    <CardDescription>Your saved restaurants for quick ordering</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {favoriteRestaurants.map(restaurant => (
                        <Card key={restaurant.id} className="overflow-hidden">
                          <div className="relative h-48">
                            <img
                              src={restaurant.imageUrl || "/placeholder.svg"}
                              alt={restaurant.name || 'Restaurant'}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center text-white">
                                <h3 className="text-xl font-bold mb-2">{restaurant.name || 'Unknown Restaurant'}</h3>
                                <p className="text-sm">{restaurant.cuisine || 'Cuisine not specified'}</p>
                              </div>
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span className="font-medium">{(restaurant.rating || 0).toFixed(1)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span className="truncate">{restaurant.address || 'Address not available'}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-4 w-4" />
                                <span>{restaurant.phoneNumber || 'Phone not available'}</span>
                              </div>
                            </div>
                            <Button
                              className="w-full mt-4"
                              onClick={() => router.push(`/customer/restaurants/${restaurant.id}`)}
                            >
                              View Menu
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => router.push('/customer/restaurants')}>
                      Explore More Restaurants
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}

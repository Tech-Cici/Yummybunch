"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Phone, Clock, ShoppingBag } from "lucide-react"
import { CustomerHeader } from "@/components/customer-header"
import { useAuth } from '@/app/providers'
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import PdfMenuViewer from "@/app/components/PdfMenuViewer"

interface MenuItem {
  id: number;
  menuId: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  available: boolean;
}

interface Menu {
  id: number;
  restaurantId: number;
  name: string;
  description: string;
  pdfUrl: string;
  active: boolean;
  items: MenuItem[];
}

interface Restaurant {
  id: number;
  name: string;
  description: string;
  address: string;
  phoneNumber: string;
  rating: number;
  imageUrl: string;
  cuisine: string;
  openingHours: string;
  menuItems: Menu[];
}

interface CartItem extends MenuItem {
  quantity: number;
}

export default function RestaurantDetailPage() {
  const params = useParams()
  const restaurantId = params.id as string
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { token, loading: authLoading } = useAuth()
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [isMenuViewerOpen, setIsMenuViewerOpen] = useState(false)

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        // Debug logs
        console.log('Token status:', token ? 'Present' : 'Missing');
        console.log('Restaurant ID:', restaurantId);

        // Wait for both auth loading to complete and token to be available
        if (authLoading) {
          console.log('Auth still loading...');
          return;
        }

        if (!token) {
          console.log('No token available');
          setLoading(false)
          setError('Please log in to view restaurant details')
          return
        }

        console.log('Fetching restaurant data...');
        const response = await fetch(`http://localhost:8080/api/restaurants/${restaurantId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        console.log('Response status:', response.status);
        if (!response.ok) {
          if (response.status === 401) {
            console.log('Unauthorized response received');
            // Redirect to login page if unauthorized
            window.location.href = '/auth/login'
            return
          }
          const errorData = await response.json().catch(() => ({}))
          console.log('Error data:', errorData);
          throw new Error(errorData.message || 'Failed to fetch restaurant data')
        }

        const data = await response.json()
        console.log('Restaurant data received:', data);
        setRestaurant(data)
      } catch (err) {
        console.error('Error fetching restaurant data:', err)
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Failed to load restaurant data. Please try again later.')
        }
      } finally {
        setLoading(false)
      }
    }

    if (restaurantId) {
      fetchRestaurantData()
    }
  }, [restaurantId, token, authLoading])

  const addToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id)
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      }
      return [...prevCart, { ...item, quantity: 1 }]
    })
    setIsCartOpen(true)
  }

  const removeFromCart = (itemId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId))
  }

  const updateQuantity = (itemId: number, change: number) => {
    setCart(prevCart =>
      prevCart.map(item => {
        if (item.id === itemId) {
          const newQuantity = Math.max(1, item.quantity + change)
          return { ...item, quantity: newQuantity }
        }
        return item
      })
    )
  }

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const handlePlaceOrder = async () => {
    if (!token || !restaurant) return

    setIsPlacingOrder(true)
    try {
      const response = await fetch('http://localhost:8080/api/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          restaurantId: restaurant.id,
          items: cart.map(item => ({
            menuItemId: item.id,
            quantity: item.quantity,
            price: item.price
          })),
          totalAmount: calculateTotal()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to place order')
      }

      // Clear cart and show success message
      setCart([])
      setIsCartOpen(false)
      alert('Order placed successfully!')
    } catch (err) {
      console.error('Error placing order:', err)
      alert('Failed to place order. Please try again.')
    } finally {
      setIsPlacingOrder(false)
    }
  }

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <CustomerHeader />
        <main className="flex-1 p-6">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center py-8">Initializing...</div>
          </div>
        </main>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <CustomerHeader />
        <main className="flex-1 p-6">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center py-8">Loading restaurant details...</div>
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
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              {error.includes('log in') && (
                <Button 
                  onClick={() => window.location.href = '/auth/login'}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Go to Login
                </Button>
              )}
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="flex min-h-screen flex-col">
        <CustomerHeader />
        <main className="flex-1 p-6">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center py-8">Restaurant not found</div>
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
            <div className="relative h-64 md:h-96 rounded-lg overflow-hidden">
              <Image
                src={restaurant.imageUrl || "/images/restaurant/logo.png"}
                alt={restaurant.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <h1 className="text-4xl font-bold mb-2">{restaurant.name}</h1>
                  <p className="text-lg">{restaurant.cuisine}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    <span className="text-2xl font-bold">{restaurant.rating.toFixed(1)}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <span className="text-sm">{restaurant.address}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <span className="text-sm">{restaurant.openingHours}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Menu</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full"
                    onClick={() => setIsMenuViewerOpen(true)}
                  >
                    View Menu
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Menu Items</CardTitle>
                <CardDescription>Browse our delicious offerings</CardDescription>
              </CardHeader>
              <CardContent>
                {!restaurant.menuItems ? (
                  <div className="text-center py-8 text-gray-500">Loading menu...</div>
                ) : restaurant.menuItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No menu items available</div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {restaurant.menuItems[0]?.items?.map((item) => (
                      <Card key={item.id} className="overflow-hidden">
                        <div className="relative h-48">
                          <Image
                            src={item.imageUrl || "/placeholder.svg"}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold">{item.name}</h3>
                                <p className="text-sm text-gray-500">{item.description}</p>
                              </div>
                              <span className="font-bold">${item.price?.toFixed(2) || '0.00'}</span>
                            </div>
                            <Button 
                              className="w-full" 
                              disabled={!item.available}
                              onClick={() => addToCart(item)}
                            >
                              {item.available ? 'Add to Cart' : 'Not Available'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Menu Viewer Dialog */}
          <Dialog open={isMenuViewerOpen} onOpenChange={setIsMenuViewerOpen}>
            <DialogContent className="max-w-4xl h-[80vh]">
              <DialogHeader>
                <DialogTitle>{restaurant?.name} - Menu</DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-hidden">
                {restaurant && <PdfMenuViewer restaurantId={restaurant.id} />}
              </div>
            </DialogContent>
          </Dialog>

          {/* Cart Sidebar */}
          {isCartOpen && (
            <div className="fixed inset-0 bg-black/50 z-50">
              <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-lg">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold">Your Cart</h2>
                      <Button variant="ghost" onClick={() => setIsCartOpen(false)}>
                        Close
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4">
                    {cart.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        Your cart is empty
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {cart.map(item => (
                          <div key={item.id} className="flex items-center gap-4">
                            <div className="flex-1">
                              <h3 className="font-medium">{item.name}</h3>
                              <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => updateQuantity(item.id, -1)}
                              >
                                -
                              </Button>
                              <span>{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => updateQuantity(item.id, 1)}
                              >
                                +
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFromCart(item.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-4 border-t">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-medium">Total:</span>
                      <span className="text-lg font-bold">${calculateTotal().toFixed(2)}</span>
                    </div>
                    <Button
                      className="w-full"
                      disabled={cart.length === 0 || isPlacingOrder}
                      onClick={handlePlaceOrder}
                    >
                      {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 

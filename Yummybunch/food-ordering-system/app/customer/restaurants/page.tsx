'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Star, MapPin, Phone, Utensils, ChefHat, LogOut } from "lucide-react";
import { CustomerHeader } from "@/components/customer-header";
import { useAuth } from '@/app/providers';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import PdfMenuViewer from "@/app/components/PdfMenuViewer"

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

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { token, setToken, setUser } = useAuth();
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [isMenuViewerOpen, setIsMenuViewerOpen] = useState(false)

  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchRestaurants();
  }, [token]);

  const fetchRestaurants = async () => {
    try {
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch('http://localhost:8080/api/restaurants', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid or expired
          setToken(null);
          setUser(null);
          router.push('/auth/login');
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch restaurants');
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format from server');
      }
      setRestaurants(data);
    } catch (err) {
      console.error('Error fetching restaurants:', err);
      if (err instanceof Error) {
        if (err.message.includes('authentication') || err.message.includes('token')) {
          setToken(null);
          setUser(null);
          router.push('/auth/login');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to load restaurants. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    // Clear auth token and user data
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/auth/login');
  };

  const handleViewMenu = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant)
    setIsMenuViewerOpen(true)
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
                  <Utensils className="h-6 w-6 text-orange-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800">Restaurants</h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-orange-500" />
                  <Input
                    placeholder="Search restaurants..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 border-orange-200 focus:border-orange-500"
                  />
                </div>
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

            {loading ? (
              <div className="text-center py-8 text-gray-600">Loading restaurants...</div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">{error}</div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredRestaurants.map((restaurant) => (
                  <Card key={restaurant.id} className="overflow-hidden border-orange-100 hover:border-orange-200 transition-all hover:shadow-lg">
                    <div className="relative h-48">
                      <img
                        src={restaurant.imageUrl || "/placeholder.svg"}
                        alt={restaurant.name || 'Restaurant'}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl text-gray-800">{restaurant.name || 'Unnamed Restaurant'}</CardTitle>
                          <CardDescription className="mt-1 flex items-center gap-2">
                            <ChefHat className="h-4 w-4 text-orange-500" />
                            {restaurant.cuisine || 'Cuisine not specified'}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star className="h-4 w-4 fill-current" />
                          <span>{(restaurant.rating || 0).toFixed(1)}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-orange-500" />
                          <span>{restaurant.address || 'Address not available'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-orange-500" />
                          <span>{restaurant.phoneNumber || 'Phone not available'}</span>
                        </div>
                        {restaurant.description && (
                          <div className="mt-2 text-sm">
                            <p className="line-clamp-2 text-gray-600">{restaurant.description}</p>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button 
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleViewMenu(restaurant)}
                        >
                          View Menu
                        </Button>
                        <Button 
                          className="flex-1 bg-orange-600 hover:bg-orange-700"
                          onClick={() => router.push(`/customer/restaurants/${restaurant.id}`)}
                        >
                          Order Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!loading && !error && filteredRestaurants.length === 0 && (
              <Card className="border-2 border-dashed border-orange-200 bg-orange-50/50">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="p-4 bg-orange-100 rounded-full mb-4">
                    <Utensils className="h-12 w-12 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-medium mb-2 text-gray-800">No restaurants found</h3>
                  <p className="text-gray-600 text-center mb-4">
                    Try adjusting your search criteria
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Menu Viewer Dialog */}
      <Dialog open={isMenuViewerOpen} onOpenChange={setIsMenuViewerOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedRestaurant?.name} - Menu</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            {selectedRestaurant && <PdfMenuViewer restaurantId={parseInt(selectedRestaurant.id)} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Phone, Heart, Utensils, ChefHat, LogOut } from "lucide-react";
import { CustomerHeader } from "@/components/customer-header";
import { useAuth } from '@/app/providers';
import { toast } from "sonner";

interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  phoneNumber: string;
  rating: number;
  imageUrl: string;
  cuisine: string;
  isFavorite: boolean;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { token } = useAuth();

  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchFavorites();
  }, [token]);

  const fetchFavorites = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch favorites');
      }

      const data = await response.json();
      setFavorites(data);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError('Failed to load favorites. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (restaurantId: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/favorites/restaurant/${restaurantId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to update favorite status');
      }

      const newStatus = await response.json();
      if (!newStatus) {
        // Remove the restaurant from the favorites list if it was unfavorited
        setFavorites(prev => prev.filter(r => r.id !== restaurantId));
        toast.success('Removed from favorites');
      }
    } catch (err) {
      console.error('Error updating favorite status:', err);
      toast.error('Failed to update favorite status');
    }
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
            <div className="text-center py-8">Loading favorites...</div>
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Heart className="h-6 w-6 text-orange-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800">Your Favorite Restaurants</h1>
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
          
          {favorites.length === 0 ? (
            <Card className="border-2 border-dashed border-orange-200 bg-orange-50/50">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="p-4 bg-orange-100 rounded-full mb-4">
                  <Heart className="h-12 w-12 text-orange-600" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-gray-800">No favorites yet</h3>
                <p className="text-gray-600 text-center mb-4">
                  Start adding your favorite restaurants
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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {favorites.map(restaurant => (
                <Card key={restaurant.id} className="overflow-hidden border-orange-100 hover:border-orange-200 transition-all hover:shadow-lg">
                  <div className="relative h-48">
                    <img
                      src={restaurant.imageUrl || "/placeholder.svg"}
                      alt={restaurant.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-white"
                      onClick={() => toggleFavorite(restaurant.id)}
                    >
                      <Heart className="h-6 w-6 fill-red-500 text-red-500" />
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">{restaurant.name}</h3>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <ChefHat className="h-4 w-4 text-orange-500" />
                          {restaurant.cuisine}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span>{(restaurant.rating || 0).toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-orange-500" />
                        <span className="text-sm text-gray-600">{restaurant.address || 'Address not available'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-orange-500" />
                        <span className="text-sm text-gray-600">{restaurant.phoneNumber || 'Phone not available'}</span>
                      </div>
                    </div>
                    <Button
                      className="w-full mt-4 bg-orange-600 hover:bg-orange-700"
                      onClick={() => router.push(`/customer/restaurants/${restaurant.id}`)}
                    >
                      View Menu
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 
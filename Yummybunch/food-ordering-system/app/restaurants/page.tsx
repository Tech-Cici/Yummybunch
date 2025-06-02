"use client"

import React, { useEffect, useState } from 'react';
import { RestaurantCard } from '../components/RestaurantCard';
import { restaurantApi } from '../api/restaurants/api';
import { useRouter } from 'next/navigation';

interface Restaurant {
    id: number;
    name: string;
    description: string;
    imageUrl: string | null;
    cuisineType: string;
    rating?: number;
}

export default function RestaurantsPage() {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const data = await restaurantApi.getAllRestaurants();
                setRestaurants(data);
            } catch (err) {
                setError('Failed to load restaurants');
                console.error('Error fetching restaurants:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurants();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Restaurants</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurants.map((restaurant) => (
                    <RestaurantCard
                        key={restaurant.id}
                        {...restaurant}
                        onClick={() => router.push(`/restaurant/${restaurant.id}`)}
                    />
                ))}
            </div>
        </div>
    );
}

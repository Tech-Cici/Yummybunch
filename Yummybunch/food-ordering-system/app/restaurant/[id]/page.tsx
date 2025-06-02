"use client"

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { getImageUrl } from '../../utils/imageUtils';
import { restaurantApi } from '../../api/restaurants/api';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { CustomerHeader } from "@/components/customer-header"
import { MapPin, Clock, Phone, Star, Heart, Plus, Minus, ShoppingCart, Info } from "lucide-react"

interface Restaurant {
    id: number;
    name: string;
    description: string;
    imageUrl: string | null;
    cuisineType: string;
    rating?: number;
    address: string;
    phoneNumber: string;
    openingHours: string;
    closingHours: string;
    categories: Array<{
        id: string;
        name: string;
    }>;
}

export default function RestaurantDetailPage(): JSX.Element {
    const { id } = useParams();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<string>("");
    const [cart, setCart] = useState<{
        items: {
            id: string
            name: string
            price: number
            quantity: number
        }[]
        total: number
    }>({
        items: [],
        total: 0,
    })
    const [isCartOpen, setIsCartOpen] = useState(false)

    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                const data = await restaurantApi.getRestaurantById(Number(id));
                setRestaurant(data);
                // Set active category after restaurant data is loaded
                if (data.categories && data.categories.length > 0) {
                    setActiveCategory(data.categories[0].id);
                }
            } catch (err) {
                setError('Failed to load restaurant details');
                console.error('Error fetching restaurant:', err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchRestaurant();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !restaurant) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-red-500">{error || 'Restaurant not found'}</div>
            </div>
        );
    }

    const addToCart = (item: { id: string; name: string; price: number }) => {
        setCart((prevCart) => {
            const existingItem = prevCart.items.find((cartItem) => cartItem.id === item.id)

            if (existingItem) {
                // Item already in cart, increase quantity
                const updatedItems = prevCart.items.map((cartItem) =>
                    cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
                )

                return {
                    items: updatedItems,
                    total: prevCart.total + item.price,
                }
            } else {
                // Add new item to cart
                return {
                    items: [...prevCart.items, { ...item, quantity: 1 }],
                    total: prevCart.total + item.price,
                }
            }
        })

        // Open cart sheet when adding items
        setIsCartOpen(true)
    }

    const removeFromCart = (itemId: string, price: number) => {
        setCart((prevCart) => {
            const existingItem = prevCart.items.find((item) => item.id === itemId)

            if (existingItem && existingItem.quantity > 1) {
                // Decrease quantity if more than 1
                const updatedItems = prevCart.items.map((item) =>
                    item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item,
                )

                return {
                    items: updatedItems,
                    total: prevCart.total - price,
                }
            } else {
                // Remove item from cart if quantity is 1
                return {
                    items: prevCart.items.filter((item) => item.id !== itemId),
                    total: prevCart.total - price,
                }
            }
        })
    }

    const clearCart = () => {
        setCart({
            items: [],
            total: 0,
        })
    }

    return (
        <div className="flex min-h-screen flex-col">
            <CustomerHeader />
            <main className="flex-1">
                <div className="relative h-64 md:h-96 w-full mb-8">
                    <Image
                        src={getImageUrl(restaurant.imageUrl)}
                        alt={restaurant.name}
                        fill
                        className="object-cover rounded-lg"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>
                
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-4xl font-bold mb-4">{restaurant.name}</h1>
                        <p className="text-gray-600 mb-4">{restaurant.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div>
                                <h2 className="text-xl font-semibold mb-2">Details</h2>
                                <div className="space-y-2">
                                    <p><span className="font-medium">Cuisine:</span> {restaurant.cuisineType}</p>
                                    <p><span className="font-medium">Address:</span> {restaurant.address}</p>
                                    <p><span className="font-medium">Phone:</span> {restaurant.phoneNumber}</p>
                                </div>
                            </div>
                            
                            <div>
                                <h2 className="text-xl font-semibold mb-2">Hours</h2>
                                <div className="space-y-2">
                                    <p><span className="font-medium">Opening:</span> {restaurant.openingHours}</p>
                                    <p><span className="font-medium">Closing:</span> {restaurant.closingHours}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto max-w-6xl px-4 py-6">
                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="md:col-span-2">
                            <div className="sticky top-4">
                                <Tabs defaultValue={activeCategory} onValueChange={setActiveCategory}>
                                    <div className="overflow-x-auto">
                                        <TabsList className="mb-4 w-max">
                                            {restaurant.categories.map((category) => (
                                                <TabsTrigger key={category.id} value={category.id}>
                                                    {category.name}
                                                </TabsTrigger>
                                            ))}
                                        </TabsList>
                                    </div>
                                </Tabs>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

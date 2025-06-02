"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PdfMenuUpload from '@/app/components/PdfMenuUpload';
import PdfMenuViewer from '@/app/components/PdfMenuViewer';
import ImageMenuUpload from '@/app/components/ImageMenuUpload';
import ImageMenuViewer from '@/app/components/ImageMenuViewer';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RestaurantSidebar } from "@/components/restaurant-sidebar";
import { RestaurantHeader } from "@/components/restaurant-header";
import { useAuth } from "@/app/providers";
import { toast } from 'react-hot-toast';

export default function MenuManagementPage() {
    const [restaurantId, setRestaurantId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { user, token, loading: authLoading } = useAuth();

    useEffect(() => {
        const fetchRestaurantId = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/restaurants/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setRestaurantId(data.id);
                } else {
                    throw new Error('Failed to fetch restaurant data');
                }
            } catch (error) {
                console.error('Error fetching restaurant data:', error);
                toast.error('Failed to load restaurant data');
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchRestaurantId();
        }
    }, [token]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!restaurantId) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-red-500">Failed to load restaurant data</p>
            </div>
        );
    }

    return (
        <div className="flex h-screen">
            <RestaurantSidebar />
            <div className="flex-1 flex flex-col">
                <RestaurantHeader />
                <main className="flex-1 overflow-y-auto">
                    <div className="container mx-auto px-4 py-8">
                        <div className="max-w-4xl mx-auto">
                            <h1 className="text-3xl font-bold mb-8">Menu Management</h1>

                            <Tabs defaultValue="pdf" className="mb-8">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="pdf">PDF Menu</TabsTrigger>
                                    <TabsTrigger value="image">Image Menu</TabsTrigger>
                                </TabsList>

                                <TabsContent value="pdf" className="space-y-4">
                                    <Card>
                                        <CardContent className="p-6">
                                            <h2 className="text-xl font-semibold mb-4">Upload PDF Menu</h2>
                                            <p className="text-gray-600 mb-4">
                                                Upload your restaurant's menu in PDF format. This will be visible to customers on your restaurant page.
                                            </p>
                                            <PdfMenuUpload 
                                                restaurantId={restaurantId}
                                                onUploadSuccess={() => {
                                                    router.refresh();
                                                }}
                                            />
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardContent className="p-6">
                                            <h2 className="text-xl font-semibold mb-4">Current Menu</h2>
                                            <p className="text-gray-600 mb-4">
                                                Preview your current menu as it appears to customers.
                                            </p>
                                            <PdfMenuViewer restaurantId={restaurantId} />
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="image" className="space-y-4">
                                    <Card>
                                        <CardContent className="p-6">
                                            <h2 className="text-xl font-semibold mb-4">Upload Image Menu</h2>
                                            <p className="text-gray-600 mb-4">
                                                Upload your restaurant's menu as an image. This will be visible to customers on your restaurant page.
                                            </p>
                                            <ImageMenuUpload 
                                                restaurantId={restaurantId}
                                                onUploadSuccess={() => {
                                                    router.refresh();
                                                }}
                                            />
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardContent className="p-6">
                                            <h2 className="text-xl font-semibold mb-4">Current Menu</h2>
                                            <p className="text-gray-600 mb-4">
                                                Preview your current menu as it appears to customers.
                                            </p>
                                            <ImageMenuViewer restaurantId={restaurantId} />
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

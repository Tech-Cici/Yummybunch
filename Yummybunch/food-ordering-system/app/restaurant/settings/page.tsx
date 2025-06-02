"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RestaurantSidebar } from "@/components/restaurant-sidebar";
import { RestaurantHeader } from "@/components/restaurant-header";
import { useAuth } from "@/app/providers";
import { toast } from 'react-hot-toast';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PdfMenuUpload from '@/app/components/PdfMenuUpload';
import PdfMenuViewer from '@/app/components/PdfMenuViewer';
import ImageMenuUpload from '@/app/components/ImageMenuUpload';
import ImageMenuViewer from '@/app/components/ImageMenuViewer';

interface RestaurantSettings {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  openingHours: string;
  cuisineType: string;
  imageUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export default function SettingsPage() {
    const [restaurantId, setRestaurantId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [originalSettings, setOriginalSettings] = useState<RestaurantSettings | null>(null);
    const router = useRouter();
    const { user, token, loading: authLoading } = useAuth();
    const [settings, setSettings] = useState<RestaurantSettings>({
        name: '',
        description: '',
        address: '',
        phone: '',
        email: '',
        openingHours: '',
        cuisineType: ''
    });
    const [saving, setSaving] = useState(false);

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

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                if (!token) {
                    throw new Error('No authentication token found');
                }

                const response = await fetch('http://localhost:8080/api/restaurants/settings', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.status === 401) {
                    // Token is invalid or expired
                    throw new Error('Session expired. Please log in again.');
                }

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch settings');
                }

                const data = await response.json();
                // Map backend field names to frontend field names
                const mappedData = {
                    name: data.name || '',
                    description: data.description || '',
                    address: data.address || '',
                    phone: data.phoneNumber || '', // Map phoneNumber to phone
                    email: data.email || '',
                    openingHours: data.openingHours || '',
                    cuisineType: data.cuisineType || '',
                    imageUrl: data.imageUrl || ''
                };
                setSettings(mappedData);
                setOriginalSettings(mappedData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load settings');
                if (err instanceof Error && err.message.includes('Session expired')) {
                    // Redirect to login or handle session expiry
                    window.location.href = '/auth/login';
                }
            } finally {
                setLoading(false);
            }
        };

        if (token && user?.role === 'restaurant') {
            fetchSettings();
        } else {
            setLoading(false);
            if (!token) {
                setError('Please log in to view settings');
            } else if (user?.role !== 'restaurant') {
                setError('Access denied. Restaurant access required.');
            }
        }
    }, [token, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Map frontend field names to backend field names
            const backendData = {
                name: settings.name,
                description: settings.description,
                address: settings.address,
                phoneNumber: settings.phone, // Map phone to phoneNumber
                email: settings.email,
                openingHours: settings.openingHours,
                cuisineType: settings.cuisineType
            };

            const response = await fetch('http://localhost:8080/api/restaurants/settings', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(backendData)
            });

            if (response.status === 401) {
                throw new Error('Session expired. Please log in again.');
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update settings');
            }

            // Fetch the updated settings immediately after successful update
            const settingsResponse = await fetch('http://localhost:8080/api/restaurants/settings', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!settingsResponse.ok) {
                throw new Error('Failed to fetch updated settings');
            }

            const updatedData = await settingsResponse.json();
            // Map the response back to frontend field names
            const mappedData = {
                name: updatedData.name || '',
                description: updatedData.description || '',
                address: updatedData.address || '',
                phone: updatedData.phoneNumber || '', // Map phoneNumber to phone
                email: updatedData.email || '',
                openingHours: updatedData.openingHours || '',
                cuisineType: updatedData.cuisineType || '',
                imageUrl: settings.imageUrl // Preserve the image URL
            };
            
            setSettings(mappedData);
            setOriginalSettings(mappedData);
            setIsEditing(false);
            toast.success('Settings updated successfully');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update settings';
            setError(errorMessage);
            toast.error(errorMessage);
            
            if (err instanceof Error && err.message.includes('Session expired')) {
                window.location.href = '/auth/login';
            }
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        if (originalSettings) {
            setSettings(originalSettings);
        }
        setIsEditing(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !restaurantId) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`http://localhost:8080/api/restaurants/${restaurantId}/profile-image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to upload image');
            }

            const data = await response.json();
            setSettings(prev => ({
                ...prev,
                imageUrl: data.imageUrl
            }));
            setOriginalSettings(prev => prev ? {
                ...prev,
                imageUrl: data.imageUrl
            } : null);
            toast.success('Profile image updated successfully');
        } catch (error) {
            toast.error('Failed to upload profile image');
        }
    };

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
                            <h1 className="text-3xl font-bold mb-8">Restaurant Settings</h1>

                            <Tabs defaultValue="general" className="mb-8">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="general">General Settings</TabsTrigger>
                                    <TabsTrigger value="menu">Menu Management</TabsTrigger>
                                    <TabsTrigger value="appearance">Appearance</TabsTrigger>
                                </TabsList>

                                <TabsContent value="general" className="space-y-4">
                                    <Card className="border-orange-100 bg-orange-50/50">
                                        <CardContent className="p-8">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="p-2 bg-orange-100 rounded-lg">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                </div>
                                                <h2 className="text-2xl font-semibold text-orange-900">Restaurant Information</h2>
                                            </div>
                                            <form onSubmit={handleSubmit} className="space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-medium text-orange-800">Restaurant Name</label>
                                                        <input
                                                            name="name"
                                                            value={settings.name}
                                                            onChange={handleChange}
                                                            placeholder="Enter restaurant name"
                                                            required
                                                            disabled={!isEditing}
                                                            className={`w-full px-4 py-2 rounded-lg border border-orange-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white ${
                                                                !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
                                                            }`}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-medium text-orange-800">Cuisine Type</label>
                                                        <input
                                                            name="cuisineType"
                                                            value={settings.cuisineType}
                                                            onChange={handleChange}
                                                            placeholder="e.g., Italian, Japanese, Fusion"
                                                            disabled={!isEditing}
                                                            className={`w-full px-4 py-2 rounded-lg border border-orange-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white ${
                                                                !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
                                                            }`}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="block text-sm font-medium text-orange-800">Description</label>
                                                    <textarea
                                                        name="description"
                                                        value={settings.description}
                                                        onChange={handleChange}
                                                        placeholder="Tell customers about your restaurant's story, specialties, and atmosphere..."
                                                        rows={4}
                                                        disabled={!isEditing}
                                                        className={`w-full px-4 py-2 rounded-lg border border-orange-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white ${
                                                            !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
                                                        }`}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-medium text-orange-800">Address</label>
                                                        <input
                                                            name="address"
                                                            value={settings.address}
                                                            onChange={handleChange}
                                                            placeholder="Enter restaurant address"
                                                            required
                                                            disabled={!isEditing}
                                                            className={`w-full px-4 py-2 rounded-lg border border-orange-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white ${
                                                                !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
                                                            }`}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-medium text-orange-800">Phone Number</label>
                                                        <input
                                                            name="phone"
                                                            value={settings.phone}
                                                            onChange={handleChange}
                                                            placeholder="Enter contact number"
                                                            required
                                                            disabled={!isEditing}
                                                            className={`w-full px-4 py-2 rounded-lg border border-orange-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white ${
                                                                !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
                                                            }`}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="block text-sm font-medium text-orange-800">Email</label>
                                                    <input
                                                        name="email"
                                                        type="email"
                                                        value={settings.email}
                                                        onChange={handleChange}
                                                        placeholder="Enter email address"
                                                        required
                                                        disabled={!isEditing}
                                                        className={`w-full px-4 py-2 rounded-lg border border-orange-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white ${
                                                            !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
                                                        }`}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="block text-sm font-medium text-orange-800">Opening Hours</label>
                                                    <input
                                                        name="openingHours"
                                                        value={settings.openingHours}
                                                        onChange={handleChange}
                                                        placeholder="e.g., Mon-Fri: 9AM-10PM, Sat-Sun: 10AM-11PM"
                                                        required
                                                        disabled={!isEditing}
                                                        className={`w-full px-4 py-2 rounded-lg border border-orange-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white ${
                                                            !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
                                                        }`}
                                                    />
                                                </div>

                                                {error && (
                                                    <div className="p-4 rounded-lg bg-red-50 text-red-600 border border-red-200">
                                                        {error}
                                                    </div>
                                                )}

                                                <div className="flex justify-end gap-4">
                                                    {!isEditing ? (
                                                        <button
                                                            type="button"
                                                            onClick={handleEdit}
                                                            className="px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 focus:ring-4 focus:ring-orange-200 transition-colors"
                                                        >
                                                            Edit Details
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={handleCancel}
                                                                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 focus:ring-4 focus:ring-gray-200 transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                type="submit"
                                                                disabled={saving}
                                                                className="px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 focus:ring-4 focus:ring-orange-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                {saving ? (
                                                                    <span className="flex items-center gap-2">
                                                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                        </svg>
                                                                        Saving...
                                                                    </span>
                                                                ) : 'Save Changes'}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </form>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="menu" className="space-y-4">
                                    <Card>
                                        <CardContent className="p-6">
                                            <h2 className="text-xl font-semibold mb-4">Menu Management</h2>
                                            <Tabs defaultValue="pdf" className="mb-8">
                                                <TabsList className="grid w-full grid-cols-2">
                                                    <TabsTrigger value="pdf">PDF Menu</TabsTrigger>
                                                    <TabsTrigger value="image">Image Menu</TabsTrigger>
                                                </TabsList>

                                                <TabsContent value="pdf" className="space-y-4">
                                                    <Card>
                                                        <CardContent className="p-6">
                                                            <h3 className="text-lg font-semibold mb-4">Upload PDF Menu</h3>
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
                                                            <h3 className="text-lg font-semibold mb-4">Current Menu</h3>
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
                                                            <h3 className="text-lg font-semibold mb-4">Upload Image Menu</h3>
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
                                                            <h3 className="text-lg font-semibold mb-4">Current Menu</h3>
                                                            <p className="text-gray-600 mb-4">
                                                                Preview your current menu as it appears to customers.
                                                            </p>
                                                            <ImageMenuViewer restaurantId={restaurantId} />
                                                        </CardContent>
                                                    </Card>
                                                </TabsContent>
                                            </Tabs>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="appearance" className="space-y-4">
                                    <Card>
                                        <CardContent className="p-6">
                                            <h2 className="text-xl font-semibold mb-4">Restaurant Preview</h2>
                                            
                                            <div className="space-y-6">
                                                {/* Restaurant Profile Preview */}
                                                <div className="border rounded-lg p-6 bg-white shadow-sm">
                                                    <div className="flex flex-col md:flex-row gap-6">
                                                        {/* Restaurant Image */}
                                                        <div className="w-full md:w-1/3">
                                                            <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-orange-200">
                                                                <img
                                                                    src={settings.imageUrl ? `http://localhost:8080${settings.imageUrl}` : '/images/restaurant/default.jpg'}
                                                                    alt={settings.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                                {isEditing && (
                                                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                                        <label className="cursor-pointer p-2 bg-white rounded-full hover:bg-orange-100 transition-colors">
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                                            </svg>
                                                                            <input
                                                                                type="file"
                                                                                accept="image/*"
                                                                                onChange={handleImageUpload}
                                                                                className="hidden"
                                                                            />
                                                                        </label>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Restaurant Details */}
                                                        <div className="flex-1 space-y-4">
                                                            <div>
                                                                <h3 className="text-2xl font-bold text-orange-900">{settings.name}</h3>
                                                                <p className="text-orange-600 font-medium">{settings.cuisineType}</p>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <p className="text-gray-700">{settings.description}</p>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center gap-2 text-gray-600">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                        </svg>
                                                                        <span>{settings.address}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-gray-600">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                                        </svg>
                                                                        <span>{settings.phone}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-gray-600">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                                        </svg>
                                                                        <span>{settings.email}</span>
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-1">
                                                                    <div className="flex items-center gap-2 text-gray-600">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                        </svg>
                                                                        <span>{settings.openingHours}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-sm text-gray-500 italic">
                                                    This is how your restaurant appears to customers. Update your details in the General Settings tab to modify this preview.
                                                </div>
                                            </div>
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
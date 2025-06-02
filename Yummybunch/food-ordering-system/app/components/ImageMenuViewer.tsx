"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from "@/app/providers";

interface ImageMenuViewerProps {
    restaurantId: number;
}

export default function ImageMenuViewer({ restaurantId }: ImageMenuViewerProps) {
    const [menuImageUrl, setMenuImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { token } = useAuth();

    useEffect(() => {
        const fetchMenuImage = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/restaurants/${restaurantId}/menu-file`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const contentType = response.headers.get('content-type');
                    if (contentType?.includes('application/pdf')) {
                        // For PDFs, create a blob URL
                        const blob = await response.blob();
                        const url = URL.createObjectURL(blob);
                        setMenuImageUrl(url);
                    } else if (contentType?.includes('image/')) {
                        // For images, use the direct URL
                        setMenuImageUrl(`http://localhost:8080/api/restaurants/${restaurantId}/menu-file`);
                    } else {
                        throw new Error('Unsupported file type');
                    }
                } else if (response.status === 404) {
                    setMenuImageUrl(null);
                } else {
                    throw new Error('Failed to fetch menu');
                }
            } catch (error) {
                console.error('Error fetching menu:', error);
                setError('Failed to load menu');
            } finally {
                setLoading(false);
            }
        };

        fetchMenuImage();
    }, [restaurantId, token]);

    if (loading) {
        return (
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    if (!menuImageUrl) {
        return (
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">No menu uploaded yet</p>
            </div>
        );
    }

    // Check if the URL is a PDF (blob URL)
    if (menuImageUrl.startsWith('blob:')) {
        return (
            <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-100">
                <iframe
                    src={menuImageUrl}
                    className="w-full h-full"
                    title="Restaurant Menu PDF"
                />
            </div>
        );
    }

    return (
        <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-100">
            <Image
                src={menuImageUrl}
                alt="Restaurant Menu"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
        </div>
    );
} 
import React, { useState, useEffect } from 'react';
import { useAuth } from "@/app/providers";
import { Button } from "@/components/ui/button";
import { AlertCircle, FileText, Image } from "lucide-react";

interface PdfMenuViewerProps {
    restaurantId: number;
}

export default function PdfMenuViewer({ restaurantId }: PdfMenuViewerProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [fileType, setFileType] = useState<'pdf' | 'image' | null>(null);
    const { token } = useAuth();
    const [fileUrl, setFileUrl] = useState<string | null>(null);

    useEffect(() => {
        const checkFileType = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/restaurants/${restaurantId}/menu-file`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    if (response.status === 404) {
                        setError('This restaurant has not uploaded their menu yet.');
                        return;
                    }
                    throw new Error('Failed to fetch menu');
                }

                const contentType = response.headers.get('content-type');
                if (contentType === 'application/pdf') {
                    setFileType('pdf');
                } else if (contentType?.startsWith('image/')) {
                    setFileType('image');
                } else {
                    setError('Invalid file type. Please upload a PDF or image file.');
                    return;
                }

                // Create a blob URL from the response
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                setFileUrl(url);
            } catch (error) {
                console.error('Error checking file type:', error);
                setError('Failed to load menu. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        if (restaurantId && token) {
            checkFileType();
        }
    }, [restaurantId, token]);

    // Cleanup blob URL when component unmounts
    useEffect(() => {
        return () => {
            if (fileUrl) {
                URL.revokeObjectURL(fileUrl);
            }
        };
    }, [fileUrl]);

    const handleLoad = () => {
        setLoading(false);
    };

    const handleError = () => {
        setLoading(false);
        setError('Failed to load menu');
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="p-4 bg-orange-100 rounded-full mb-4">
                    <AlertCircle className="h-12 w-12 text-orange-600" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-gray-800">Menu Not Available</h3>
                <p className="text-gray-600 mb-4">
                    {error === 'This restaurant has not uploaded their menu yet.' 
                        ? 'This restaurant has not uploaded their menu yet.'
                        : 'Unable to load the menu at this time.'}
                </p>
                <p className="text-sm text-gray-500">
                    Please check back later or contact the restaurant directly.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full h-[600px] bg-gray-100 rounded-lg overflow-hidden relative">
            {fileUrl ? (
                fileType === 'pdf' ? (
                    <iframe
                        src={fileUrl}
                        className="w-full h-full"
                        onLoad={handleLoad}
                        onError={handleError}
                    />
                ) : (
                    <img
                        src={fileUrl}
                        alt="Restaurant Menu"
                        className="w-full h-full object-contain"
                        onLoad={handleLoad}
                        onError={handleError}
                    />
                )
            ) : (
                <div className="flex flex-col items-center justify-center h-full">
                    <div className="p-4 bg-orange-100 rounded-full mb-4">
                        {fileType === 'image' ? (
                            <Image className="h-12 w-12 text-orange-600" />
                        ) : (
                            <FileText className="h-12 w-12 text-orange-600" />
                        )}
                    </div>
                    <p className="text-gray-500">No menu available</p>
                </div>
            )}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                </div>
            )}
        </div>
    );
} 
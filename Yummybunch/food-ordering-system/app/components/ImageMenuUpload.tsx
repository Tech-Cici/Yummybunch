"use client";

import { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/app/providers";
import { useDropzone } from 'react-dropzone';

interface ImageMenuUploadProps {
    restaurantId: number;
    onUploadSuccess?: () => void;
}

export default function ImageMenuUpload({ restaurantId, onUploadSuccess }: ImageMenuUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();
    const { token } = useAuth();

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        console.log('Starting image upload for file:', file.name);
        console.log('File type:', file.type);
        console.log('File size:', file.size);

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast({
                title: "Invalid file type",
                description: "Please upload an image file (JPEG, PNG, etc.)",
                variant: "destructive",
            });
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "File too large",
                description: "Please upload an image smaller than 5MB",
                variant: "destructive",
            });
            return;
        }

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            console.log('Sending request to:', `http://localhost:8080/api/restaurants/${restaurantId}/upload-menu`);
            console.log('With token:', token ? 'Token present' : 'No token');

            const response = await fetch(`http://localhost:8080/api/restaurants/${restaurantId}/upload-menu`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (!response.ok) {
                throw new Error('Failed to upload menu image');
            }

            toast({
                title: "Success",
                description: "Menu image uploaded successfully",
            });

            if (onUploadSuccess) {
                onUploadSuccess();
                // Force a page refresh to show the updated menu
                window.location.reload();
            }
        } catch (error) {
            console.error('Error uploading menu image:', error);
            toast({
                title: "Error",
                description: "Failed to upload menu image. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
        }
    }, [restaurantId, token, toast, onUploadSuccess]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png']
        },
        maxFiles: 1,
        disabled: isUploading
    });

    return (
        <div className="space-y-4">
            <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                    ${isDragActive ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-orange-400'}`}
            >
                <input {...getInputProps()} />
                <p className="text-gray-600 mb-4">
                    {isDragActive
                        ? "Drop the image here"
                        : "Drag and drop your menu image here, or click to browse"}
                </p>
                <Button 
                    variant="outline" 
                    className="cursor-pointer"
                    disabled={isUploading}
                >
                    {isUploading ? 'Uploading...' : 'Select Image'}
                </Button>
            </div>
            <p className="text-sm text-gray-500">
                Supported formats: JPEG, PNG. Maximum size: 5MB
            </p>
        </div>
    );
} 
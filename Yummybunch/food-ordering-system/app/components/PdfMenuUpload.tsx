import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/app/providers";
import { toast } from 'react-hot-toast';

interface PdfMenuUploadProps {
    restaurantId: number;
    onUploadSuccess?: () => void;
}

export default function PdfMenuUpload({ restaurantId, onUploadSuccess }: PdfMenuUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { token, loading } = useAuth();

    useEffect(() => {
        if (!loading && !token) {
            router.push('/login');
        }
    }, [token, loading, router]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            const fileType = selectedFile.type;
            const isPdf = fileType === 'application/pdf';
            const isImage = fileType.startsWith('image/');
            
            if (isPdf || isImage) {
                setFile(selectedFile);
                setError(null);
            } else {
                setError('Please select a PDF or image file (PNG, JPG, JPEG)');
                setFile(null);
            }
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file to upload');
            return;
        }

        if (!token) {
            setError('You must be logged in to upload a menu');
            router.push('/login');
            return;
        }

        setUploading(true);
        setError(null);

        try {
            console.log('Starting upload for file:', file.name);
            console.log('File type:', file.type);
            console.log('File size:', file.size);

            const formData = new FormData();
            formData.append('file', file);

            console.log('Sending request to:', `http://localhost:8080/api/restaurants/${restaurantId}/upload-menu`);
            console.log('With token:', token ? 'Token present' : 'No token');

            const response = await fetch(`http://localhost:8080/api/restaurants/${restaurantId}/upload-menu`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Upload failed');
            }

            toast.success('Menu uploaded successfully');
            if (onUploadSuccess) {
                onUploadSuccess();
            }
        } catch (error) {
            console.error('Upload error:', error);
            let errorMessage = 'Upload failed';
            
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (error instanceof Response) {
                try {
                    const errorData = await error.json();
                    errorMessage = errorData.message || 'Upload failed';
                } catch (e) {
                    errorMessage = 'Failed to parse error response';
                }
            }
            
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!token) {
        return <div>Please login to upload a menu</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-4">
                <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                />
                <button
                    onClick={handleUpload}
                    disabled={!file || uploading || !token}
                    className={`px-4 py-2 rounded-md text-white font-medium
                        ${!file || uploading || !token
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                >
                    {uploading ? 'Uploading...' : 'Upload Menu'}
                </button>
            </div>
            {error && (
                <p className="text-red-500 text-sm">{error}</p>
            )}
            {file && (
                <p className="text-sm text-gray-600">
                    Selected file: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
            )}
        </div>
    );
} 
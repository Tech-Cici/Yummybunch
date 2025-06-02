const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const getImageUrl = (imagePath: string | null): string => {
    if (!imagePath) {
        return '/images/default-restaurant.png'; // Default image path
    }
    
    if (imagePath.startsWith('http')) {
        return imagePath;
    }
    
    return `${API_URL}/images/${imagePath}`;
}; 
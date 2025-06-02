import React from 'react';
import Image from 'next/image';
import { getImageUrl } from '../utils/imageUtils';

interface RestaurantCardProps {
    id: number;
    name: string;
    description: string;
    imageUrl: string | null;
    cuisineType: string;
    rating?: number;
    onClick?: () => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
    id,
    name,
    description,
    imageUrl,
    cuisineType,
    rating,
    onClick
}) => {
    return (
        <div 
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
            onClick={onClick}
        >
            <div className="relative h-48 w-full">
                <Image
                    src={getImageUrl(imageUrl)}
                    alt={name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
            </div>
            <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800">{name}</h3>
                <p className="text-sm text-gray-600 mt-1">{cuisineType}</p>
                <p className="text-gray-700 mt-2 line-clamp-2">{description}</p>
                {rating && (
                    <div className="mt-2 flex items-center">
                        <span className="text-yellow-400">★</span>
                        <span className="ml-1 text-gray-600">{rating.toFixed(1)}</span>
                    </div>
                )}
            </div>
        </div>
    );
}; 
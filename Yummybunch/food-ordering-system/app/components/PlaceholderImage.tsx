import React from 'react';

interface PlaceholderImageProps {
  category: 'home' | 'restaurant' | 'menu' | 'avatar';
  name: string;
  width?: number;
  height?: number;
  className?: string;
}

const PlaceholderImage: React.FC<PlaceholderImageProps> = ({
  category,
  name,
  width = 300,
  height = 200,
  className = '',
}) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <rect width="${width}" height="${height}" fill="#f0f0f0"/>
      <text x="50%" y="50%" font-family="Arial" font-size="${width / 12}" fill="#666" text-anchor="middle" dominant-baseline="middle">${name}</text>
    </svg>
  `;

  return (
    <div
      className={className}
      style={{
        width,
        height,
        backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    />
  );
};

export default PlaceholderImage; 
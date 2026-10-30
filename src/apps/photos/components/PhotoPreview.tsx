import React from 'react';
import { IoImageOutline } from 'react-icons/io5';
import type { PhotoItem } from '../types';

interface PhotoPreviewProps {
  photo: PhotoItem;
  className?: string;
  zoomLevel?: number;
  centerCoordinates?: { x: number; y: number };
}

export const PhotoPreview: React.FC<PhotoPreviewProps> = ({
  photo,
  className = '',
  zoomLevel = 1,
  centerCoordinates,
}) => {
  const { artwork, thumbnailUrl, highResUrl, title } = photo;
  const imageSrc = highResUrl || thumbnailUrl;

  const transformStyle: React.CSSProperties = zoomLevel > 1
    ? {
      transformOrigin: centerCoordinates
        ? `${centerCoordinates.x}% ${centerCoordinates.y}%`
        : 'center',
      transform: `scale(${zoomLevel})`,
      transition: 'transform 250ms ease-out',
    }
    : {
      transform: 'scale(1)',
      transition: 'transform 250ms ease-out',
    };

  if (imageSrc) {
    return (
      <div className={`relative flex items-center justify-center overflow-hidden bg-[#1C1C1E] ${className}`}>
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-full object-cover"
          style={transformStyle}
          loading="lazy"
        />
      </div>
    );
  }

  if (artwork) {
    return (
      <div className={`relative flex items-center justify-center overflow-hidden bg-[#1C1C1E] ${className}`}>
        <div
          aria-label={title}
          className="w-full h-full pointer-events-none"
          style={{
            backgroundImage: `url("${artwork.src}")`,
            backgroundPosition: artwork.position,
            backgroundRepeat: 'no-repeat',
            backgroundSize: '204% 204%',
            ...transformStyle,
          }}
        />
      </div>
    );
  }

  return (
    <div
      aria-label={title}
      className={`flex items-center justify-center overflow-hidden bg-[#1C1C1E] text-slate-500 ${className}`}
    >
      <IoImageOutline className="w-8 h-8 opacity-40" />
    </div>
  );
};

export default PhotoPreview;

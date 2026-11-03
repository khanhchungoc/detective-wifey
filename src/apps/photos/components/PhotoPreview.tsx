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
    const isRight = artwork.position.startsWith('100%');
    const isBottom = artwork.position.endsWith('100%');
    const x = isRight ? -627 : 0;
    const y = isBottom ? -627 : 0;

    return (
      <div className={`relative flex items-center justify-center overflow-hidden bg-[#1C1C1E] ${className}`}>
        <svg
          viewBox="0 0 627 627"
          preserveAspectRatio="xMidYMid slice"
          className="w-full h-full pointer-events-none"
          style={transformStyle}
          aria-label={title}
        >
          <image
            href={artwork.src}
            xlinkHref={artwork.src}
            x={x}
            y={y}
            width="1254"
            height="1254"
          />
        </svg>
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

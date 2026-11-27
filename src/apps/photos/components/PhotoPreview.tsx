import React, { useId } from 'react';
import { IoImageOutline } from 'react-icons/io5';
import type { PhotoItem } from '../types';

interface PhotoPreviewProps {
  photo: PhotoItem;
  className?: string;
  fit?: 'cover' | 'contain';
  zoomLevel?: number;
  centerCoordinates?: { x: number; y: number };
}

export const PhotoPreview: React.FC<PhotoPreviewProps> = ({
  photo,
  className = '',
  fit = 'cover',
  zoomLevel = 1,
  centerCoordinates,
}) => {
  const clipId = useId();
  const { artwork, thumbnailUrl, highResUrl, title } = photo;
  const imageSrc = highResUrl || thumbnailUrl;
  const isContain = fit === 'contain';
  const containerBg = isContain ? 'bg-transparent' : 'bg-[#1C1C1E]';

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
      <div className={`relative flex items-center justify-center overflow-hidden ${containerBg} ${className}`}>
        <img
          src={imageSrc}
          alt={title}
          draggable={false}
          className={`w-full h-full ${isContain ? 'object-contain' : 'object-cover'} select-none`}
          style={transformStyle}
          loading="lazy"
        />
      </div>
    );
  }

  if (artwork) {
    const tileW = artwork.tileWidth ?? 300;
    const tileH = artwork.tileHeight ?? 400;
    const isRight = artwork.position.startsWith('100%');
    const isBottom = artwork.position.endsWith('100%');
    const x = isRight ? -tileW : 0;
    const y = isBottom ? -tileH : 0;

    return (
      <div className={`relative flex items-center justify-center overflow-hidden ${containerBg} ${className}`}>
        <svg
          viewBox={`0 0 ${tileW} ${tileH}`}
          preserveAspectRatio={isContain ? 'xMidYMid meet' : 'xMidYMid slice'}
          className={isContain ? 'w-full h-full max-w-full max-h-full pointer-events-none' : 'w-full h-full pointer-events-none'}
          style={transformStyle}
          aria-label={title}
        >
          <defs>
            <clipPath id={clipId}>
              <rect x="0" y="0" width={tileW} height={tileH} />
            </clipPath>
          </defs>
          <image
            href={artwork.src}
            xlinkHref={artwork.src}
            x={x}
            y={y}
            width={tileW * 2}
            height={tileH * 2}
            preserveAspectRatio="none"
            clipPath={`url(#${clipId})`}
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

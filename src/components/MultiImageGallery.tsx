'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ProductImage } from '@/types';
import { ZoomIn, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface MultiImageGalleryProps {
  images: ProductImage[];
  title: string;
  brandThemeColor?: string;
}

export const MultiImageGallery: React.FC<MultiImageGalleryProps> = ({
  images,
  title,
  brandThemeColor = '#06B6D4',
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const safeImages = images && images.length > 0 ? images : [
    {
      id: 'fallback-img',
      catalogItemId: 'fallback',
      imageUrl: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=1200&q=80',
      altText: title,
      sortOrder: 1,
      isPrimary: true,
    }
  ];

  const currentImage = safeImages[selectedIndex] || safeImages[0];

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % safeImages.length);
  };

  const prevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Primary Preview Viewport */}
      <div className="relative aspect-[4/3] sm:aspect-square w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl group">
        <Image
          src={currentImage.imageUrl}
          alt={currentImage.altText || `${title} photo ${selectedIndex + 1}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className={`object-cover transition-all duration-300 ${
            isZoomed ? 'scale-125 cursor-zoom-out' : 'group-hover:scale-105 cursor-pointer'
          }`}
          onClick={() => setIsZoomed(!isZoomed)}
        />

        {/* Zoom trigger icon */}
        <button
          onClick={() => setIsZoomed(!isZoomed)}
          className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/80 backdrop-blur-md text-white border border-slate-700/80 hover:bg-slate-800 shadow-lg"
          aria-label="Toggle zoom preview"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Navigation arrows if multiple images */}
        {safeImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/80 backdrop-blur-md text-white border border-slate-700 hover:bg-slate-800 shadow-lg"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/80 backdrop-blur-md text-white border border-slate-700 hover:bg-slate-800 shadow-lg"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Active photo indicator */}
        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-slate-950/85 backdrop-blur-sm text-[11px] font-medium text-slate-300 border border-slate-800 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5" />
          <span>
            {selectedIndex + 1} of {safeImages.length}
          </span>
        </div>
      </div>

      {/* Thumbnail Bar */}
      {safeImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {safeImages.map((img, index) => {
            const isSelected = index === selectedIndex;
            return (
              <button
                key={img.id || index}
                onClick={() => setSelectedIndex(index)}
                className={`relative w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                  isSelected
                    ? 'border-cyan-400 ring-2 ring-cyan-500/30 scale-105'
                    : 'border-slate-800 opacity-60 hover:opacity-100'
                }`}
                aria-label={`View photo ${index + 1}`}
              >
                <Image
                  src={img.imageUrl}
                  alt={img.altText || `Thumbnail ${index + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

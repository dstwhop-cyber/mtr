import React, { useEffect } from 'react';
import { PhotoItem } from '../../types';
import { X, ChevronLeft, ChevronRight, Calendar, Tag } from 'lucide-react';

interface LightboxProps {
  photos: PhotoItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const Lightbox: React.FC<LightboxProps> = ({
  photos,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') {
        onNavigate((currentIndex - 1 + photos.length) % photos.length);
      }
      if (e.key === 'ArrowRight') {
        onNavigate((currentIndex + 1) % photos.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, currentIndex, photos.length, onClose, onNavigate]);

  if (!isOpen || !photos[currentIndex]) return null;

  const current = photos[currentIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNavigate((currentIndex - 1 + photos.length) % photos.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNavigate((currentIndex + 1) % photos.length);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 transition-all animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition focus:outline-none"
        aria-label="Close Lightbox"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation Left */}
      {photos.length > 1 && (
        <button
          onClick={handlePrev}
          className="absolute left-2 sm:left-6 z-50 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition focus:outline-none"
          aria-label="Previous photo"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Image container & scrapbook card */}
      <div
        className="relative max-w-5xl max-h-[90vh] flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-stone-900 border border-white/10">
          <img
            src={current.url}
            alt={current.caption || 'Memory photo'}
            className="max-h-[70vh] w-auto max-w-full object-contain rounded-t-xl select-none"
            loading="eager"
          />

          {/* Caption & Metadata Footer */}
          <div className="p-4 sm:p-5 bg-stone-900/95 text-stone-100 backdrop-blur-md border-t border-stone-800">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-400 mb-1.5">
              <div className="flex items-center space-x-3">
                {current.date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    {new Date(current.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                )}
                {current.album && (
                  <span className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full text-stone-300">
                    <Tag className="w-3 h-3 text-amber-400" />
                    {current.album}
                  </span>
                )}
              </div>
              <span className="text-stone-500 font-mono">
                {currentIndex + 1} / {photos.length}
              </span>
            </div>

            {current.caption && (
              <p className="text-sm sm:text-base font-serif text-stone-200 leading-relaxed italic">
                “{current.caption}”
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Right */}
      {photos.length > 1 && (
        <button
          onClick={handleNext}
          className="absolute right-2 sm:right-6 z-50 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition focus:outline-none"
          aria-label="Next photo"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

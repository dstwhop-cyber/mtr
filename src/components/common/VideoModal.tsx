import React, { useEffect, useRef } from 'react';
import { VideoItem } from '../../types';
import { X, Calendar, Film } from 'lucide-react';

interface VideoModalProps {
  video: VideoItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ video, isOpen, onClose }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !video) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 transition-all animate-in fade-in duration-200"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition focus:outline-none"
        aria-label="Close Video Player"
      >
        <X className="w-6 h-6" />
      </button>

      <div
        className="relative max-w-4xl w-full bg-stone-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Video Player */}
        <div className="relative aspect-video bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            src={video.url}
            controls
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Video Details */}
        <div className="p-4 sm:p-6 bg-stone-900 text-stone-100">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-amber-400 mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <Film className="w-4 h-4" /> Little Moment
            </span>
            {video.date && (
              <span className="flex items-center gap-1 text-stone-400">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(video.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            )}
          </div>
          <h3 className="text-lg sm:text-xl font-serif font-bold text-white mb-2">
            {video.title}
          </h3>
          {video.description && (
            <p className="text-sm text-stone-300 leading-relaxed">
              {video.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

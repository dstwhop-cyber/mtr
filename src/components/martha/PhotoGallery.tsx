import React, { useState, useMemo } from 'react';
import { PhotoItem, AlbumItem } from '../../types';
import { useSettings } from '../../context/SettingsContext';
import { Image as ImageIcon, Calendar, Sparkles, Maximize2 } from 'lucide-react';

interface PhotoGalleryProps {
  photos: PhotoItem[];
  albums: AlbumItem[];
  onOpenLightbox: (index: number) => void;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos,
  albums,
  onOpenLightbox,
}) => {
  const { themeClasses } = useSettings();
  const [selectedAlbum, setSelectedAlbum] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract available albums
  const albumTabs = useMemo(() => {
    const set = new Set<string>();
    photos.forEach((p) => {
      if (p.album) set.add(p.album);
    });
    return Array.from(set);
  }, [photos]);

  // Filtered photos
  const filteredPhotos = useMemo(() => {
    return photos.filter((p) => {
      const matchesAlbum =
        selectedAlbum === 'all' || p.album?.toLowerCase() === selectedAlbum.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        p.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.album?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesAlbum && matchesSearch;
    });
  }, [photos, selectedAlbum, searchQuery]);

  return (
    <section id="photos" className="py-16 sm:py-24 px-4 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3 border border-amber-300/30 backdrop-blur-md">
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Photo Scrapbook</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-3">
          Moments in Frames
        </h2>
        <p className="text-stone-600 dark:text-stone-400 text-sm sm:text-base font-light">
          Snapshots of sunny days, spontaneous road trips, and quiet smiles.
        </p>
      </div>

      {/* Album Filter Bar */}
      {photos.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          <button
            onClick={() => setSelectedAlbum('all')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
              selectedAlbum === 'all'
                ? `${themeClasses.accentBg} text-white shadow-md border border-white/20`
                : 'bg-white/60 dark:bg-stone-800/60 backdrop-blur-md text-stone-700 dark:text-stone-300 hover:bg-white/80 dark:hover:bg-stone-700/80 border border-white/70 dark:border-white/10'
            }`}
          >
            All Photos ({photos.length})
          </button>
          {albumTabs.map((albumName) => {
            const count = photos.filter((p) => p.album?.toLowerCase() === albumName.toLowerCase()).length;
            const isSelected = selectedAlbum.toLowerCase() === albumName.toLowerCase();
            return (
              <button
                key={albumName}
                onClick={() => setSelectedAlbum(albumName)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                  isSelected
                    ? `${themeClasses.accentBg} text-white shadow-md border border-white/20`
                    : 'bg-white/60 dark:bg-stone-800/60 backdrop-blur-md text-stone-700 dark:text-stone-300 hover:bg-white/80 dark:hover:bg-stone-700/80 border border-white/70 dark:border-white/10'
                }`}
              >
                {albumName} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {filteredPhotos.length === 0 && (
        <div className="text-center py-16 px-4 bg-white/45 dark:bg-stone-800/40 backdrop-blur-xl rounded-3xl border border-dashed border-amber-200/80 dark:border-stone-700 max-w-md mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200/40">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>
          <h3 className="font-serif text-xl font-bold text-stone-800 dark:text-stone-200 mb-1">
            Your memories are waiting here ✨
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            {selectedAlbum !== 'all'
              ? `No photos found in "${selectedAlbum}". Try selecting All Photos.`
              : 'Photos added from the owner dashboard will appear here.'}
          </p>
        </div>
      )}

      {/* Frosted Glass Masonry / Grid Gallery */}
      {filteredPhotos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredPhotos.map((photo, index) => {
            const globalIndex = photos.findIndex((p) => p.id === photo.id);
            return (
              <div
                key={photo.id}
                onClick={() => onOpenLightbox(globalIndex >= 0 ? globalIndex : index)}
                className="group cursor-pointer bg-white/60 dark:bg-stone-900/60 backdrop-blur-xl rounded-2xl p-3.5 sm:p-4 shadow-sm hover:shadow-2xl transition-all duration-300 border border-white/80 dark:border-white/10 flex flex-col hover:-translate-y-1.5"
              >
                {/* Image frame */}
                <div className="relative aspect-4/3 sm:aspect-square overflow-hidden rounded-xl bg-stone-100 dark:bg-stone-800 mb-3 shadow-inner">
                  <img
                    src={photo.url}
                    alt={photo.caption || 'Martha memory'}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Subtle hover overlay */}
                  <div className="absolute inset-0 bg-stone-900/20 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="p-2.5 rounded-full bg-white/90 text-stone-900 shadow-md">
                      <Maximize2 className="w-4 h-4" />
                    </span>
                  </div>

                  {photo.album && (
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[10px] font-medium tracking-wide border border-white/20">
                      {photo.album}
                    </span>
                  )}
                </div>

                {/* Polaroid-style caption & date */}
                <div className="px-1 flex-1 flex flex-col justify-between">
                  {photo.caption && (
                    <p className="font-serif text-sm sm:text-base text-stone-800 dark:text-stone-200 font-medium leading-snug line-clamp-2 italic mb-2">
                      “{photo.caption}”
                    </p>
                  )}
                  {photo.date && (
                    <div className="flex items-center gap-1.5 text-[11px] text-stone-400 dark:text-stone-500 mt-auto">
                      <Calendar className="w-3 h-3 text-amber-500" />
                      <span>
                        {new Date(photo.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

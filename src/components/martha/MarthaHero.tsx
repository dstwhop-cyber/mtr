import React from 'react';
import { PhotoItem, VideoItem, MemoryItem } from '../../types';
import { useSettings } from '../../context/SettingsContext';
import { useMusic } from '../../context/MusicContext';
import { Sparkles, Heart, ArrowRight, Play, Plus, Image as ImageIcon, Film, BookOpen } from 'lucide-react';

interface MarthaHeroProps {
  onExplore: () => void;
  photoCount: number;
  videoCount: number;
  memoryCount: number;
  photos: PhotoItem[];
  videos: VideoItem[];
  memories: MemoryItem[];
  onOpenLightbox: (index: number) => void;
  onOpenVideo: (video: VideoItem) => void;
  onOpenSurprise: () => void;
}

export const MarthaHero: React.FC<MarthaHeroProps> = ({
  onExplore,
  photoCount,
  videoCount,
  memoryCount,
  photos,
  videos,
  memories,
  onOpenLightbox,
  onOpenVideo,
  onOpenSurprise,
}) => {
  const { settings, themeClasses } = useSettings();
  const { isPlaying, togglePlay } = useMusic();

  const previewPhotos = photos.slice(0, 3);
  const previewMemories = memories.slice(0, 2);
  const featuredVideo = videos[0];

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="hero" className="pt-8 pb-12 sm:pt-12 sm:pb-16 px-4 max-w-7xl mx-auto">
      {/* Top Hero Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-tight flex items-center gap-3">
            {settings.marthaGreeting || 'Hi Martha'}
          </h1>
          <p className="text-lg sm:text-xl text-stone-500 dark:text-stone-400 font-serif italic max-w-xl">
            {settings.marthaSubtext || 'I made a little corner of the internet just for you.'}
          </p>
        </div>

        {/* Surprise Card Banner on the Right */}
        <div
          onClick={onOpenSurprise}
          className="cursor-pointer bg-white/70 dark:bg-stone-900/70 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-white/80 dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-300 flex items-center space-x-4 self-start md:self-auto group hover:-translate-y-1"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-400 to-amber-400 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
            <Sparkles className="w-6 h-6 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider text-rose-500 uppercase flex items-center gap-1">
              SURPRISE
            </span>
            <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-base group-hover:text-rose-600 transition">
              {settings.surpriseTitle || 'One More Thing...'}
            </h3>
          </div>
        </div>
      </div>

      {/* 3-Column Interactive Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Our Scrapbook */}
        <div className="bg-white/60 dark:bg-stone-900/60 backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-white/80 dark:border-white/10 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif font-bold text-xl text-stone-900 dark:text-stone-100">
                Our Scrapbook
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 text-[11px] font-mono tracking-wider font-semibold border border-stone-200/60 dark:border-stone-700">
                {photoCount} {photoCount === 1 ? 'PHOTO' : 'PHOTOS'}
              </span>
            </div>

            {/* 2x2 Photo Grid */}
            <div className="grid grid-cols-2 gap-3">
              {previewPhotos.map((photo, idx) => (
                <div
                  key={photo.id}
                  onClick={() => onOpenLightbox(idx)}
                  className="aspect-square rounded-2xl overflow-hidden cursor-pointer relative group bg-stone-100 dark:bg-stone-800 shadow-xs"
                >
                  <img
                    src={photo.url}
                    alt={photo.caption || 'Scrapbook snapshot'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-medium">View</span>
                  </div>
                </div>
              ))}

              {/* View All Tile */}
              <div
                onClick={() => scrollToSection('photos')}
                className="aspect-square rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-amber-400 dark:hover:border-amber-400 bg-white/40 dark:bg-stone-800/40 cursor-pointer flex flex-col items-center justify-center text-stone-500 hover:text-amber-600 dark:hover:text-amber-400 transition group p-2 text-center"
              >
                <Plus className="w-5 h-5 mb-1 group-hover:scale-125 transition-transform" />
                <span className="text-[11px] font-bold tracking-wider uppercase">
                  VIEW ALL
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-200/40 dark:border-white/5 flex items-center justify-between text-xs text-stone-400">
            <span>Moments in frames</span>
            <button
              onClick={() => scrollToSection('photos')}
              className="text-amber-600 dark:text-amber-400 font-medium hover:underline flex items-center gap-1"
            >
              Open gallery <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Column 2: Our Memories */}
        <div className="bg-white/60 dark:bg-stone-900/60 backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-white/80 dark:border-white/10 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif font-bold text-xl text-stone-900 dark:text-stone-100">
                Our Memories
              </h2>
              <button
                onClick={() => scrollToSection('timeline')}
                className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 transition"
              >
                History <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Memory Preview Cards */}
            <div className="space-y-3">
              {previewMemories.length > 0 ? (
                previewMemories.map((mem) => (
                  <div
                    key={mem.id}
                    onClick={() => scrollToSection('timeline')}
                    className="p-3.5 rounded-2xl bg-white/70 dark:bg-stone-800/70 border border-stone-200/60 dark:border-stone-700/80 hover:border-amber-300 dark:hover:border-amber-500/50 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 shadow-xs"
                  >
                    <div className="inline-block px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-700/80 text-[10px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5 font-mono">
                      {new Date(mem.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                    <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 line-clamp-1 mb-1">
                      {mem.title}
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed font-light">
                      {mem.description}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-stone-400 border border-dashed rounded-2xl">
                  Stories written in the owner panel will appear here.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-200/40 dark:border-white/5 flex items-center justify-between text-xs text-stone-400">
            <span>{memoryCount} journal entries</span>
            <button
              onClick={() => scrollToSection('timeline')}
              className="text-amber-600 dark:text-amber-400 font-medium hover:underline flex items-center gap-1"
            >
              Read stories <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Column 3: Little Moments (Videos) */}
        <div className="bg-white/60 dark:bg-stone-900/60 backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-white/80 dark:border-white/10 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif font-bold text-xl text-stone-900 dark:text-stone-100">
                Little Moments
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 text-[11px] font-mono tracking-wider font-semibold border border-stone-200/60 dark:border-stone-700 uppercase">
                {videoCount} {videoCount === 1 ? 'VIDEO' : 'VIDEOS'}
              </span>
            </div>

            {/* Featured Video Card */}
            {featuredVideo ? (
              <div
                onClick={() => onOpenVideo(featuredVideo)}
                className="aspect-square sm:aspect-4/3 rounded-2xl overflow-hidden cursor-pointer relative group bg-stone-950 shadow-md flex flex-col justify-end"
              >
                {featuredVideo.thumbnailUrl ? (
                  <img
                    src={featuredVideo.thumbnailUrl}
                    alt={featuredVideo.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <video
                    src={featuredVideo.url}
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                    preload="metadata"
                  />
                )}

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Big Center Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/85 dark:bg-stone-900/85 backdrop-blur-md text-stone-900 dark:text-white flex items-center justify-center shadow-2xl group-hover:scale-115 transition-transform duration-300 border border-white/60">
                    <Play className="w-6 h-6 fill-current ml-1 text-amber-600" />
                  </div>
                </div>

                {/* Bottom Video Title & Subtitle */}
                <div className="relative z-10 p-4 text-white">
                  <h3 className="font-serif font-bold text-base leading-tight drop-shadow-sm line-clamp-1">
                    {featuredVideo.title}
                  </h3>
                  <p className="text-[11px] text-stone-300 font-medium mt-0.5 line-clamp-1">
                    {featuredVideo.description || (featuredVideo.date ? `Recorded ${featuredVideo.date}` : 'Tap to play video clip')}
                  </p>
                </div>
              </div>
            ) : (
              <div
                onClick={() => scrollToSection('videos')}
                className="aspect-square rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-700 bg-white/40 flex items-center justify-center text-center p-4 text-xs text-stone-400"
              >
                No videos uploaded yet.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-stone-200/40 dark:border-white/5 flex items-center justify-between text-xs text-stone-400">
            <span>Moving memories</span>
            <button
              onClick={() => scrollToSection('videos')}
              className="text-amber-600 dark:text-amber-400 font-medium hover:underline flex items-center gap-1"
            >
              Watch clips <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { VideoItem } from '../../types';
import { useSettings } from '../../context/SettingsContext';
import { VideoModal } from '../common/VideoModal';
import { Film, Play, Calendar } from 'lucide-react';

interface VideoMemoriesProps {
  videos: VideoItem[];
}

export const VideoMemories: React.FC<VideoMemoriesProps> = ({ videos }) => {
  const { themeClasses } = useSettings();
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  return (
    <section id="videos" className="py-16 sm:py-24 px-4 max-w-7xl mx-auto border-t border-white/40 dark:border-white/10">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3 border border-amber-300/30 backdrop-blur-md">
          <Film className="w-3.5 h-3.5" />
          <span>Moving Snapshots</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-3">
          Little Moments 🎥
        </h2>
        <p className="text-stone-600 dark:text-stone-400 text-sm sm:text-base font-light">
          Short clips, cheerful laughs, and places we've been.
        </p>
      </div>

      {/* Empty State */}
      {videos.length === 0 && (
        <div className="text-center py-16 px-4 bg-white/45 dark:bg-stone-800/40 backdrop-blur-xl rounded-3xl border border-dashed border-amber-200/80 dark:border-stone-700 max-w-md mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200/40">
            <Film className="w-8 h-8 opacity-70" />
          </div>
          <h3 className="font-serif text-xl font-bold text-stone-800 dark:text-stone-200 mb-1">
            The next little moment belongs here.
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            Video clips uploaded from the admin panel will appear here.
          </p>
        </div>
      )}

      {/* Video Grid */}
      {videos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {videos.map((video) => (
            <div
              key={video.id}
              onClick={() => setSelectedVideo(video)}
              className="group cursor-pointer bg-white/60 dark:bg-stone-900/60 backdrop-blur-xl rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-white/80 dark:border-white/10 flex flex-col hover:-translate-y-1.5"
            >
              {/* Thumbnail Container with Play Overlay */}
              <div className="relative aspect-video bg-stone-950 overflow-hidden">
                {video.thumbnailUrl ? (
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <video
                    src={video.url}
                    className="w-full h-full object-cover opacity-80"
                    preload="metadata"
                  />
                )}

                {/* Soft Gradient and Play Button */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 flex items-center justify-center">
                  <div className="w-13 h-13 rounded-full bg-white/85 dark:bg-stone-900/85 backdrop-blur-md text-amber-600 shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-white/40">
                    <Play className="w-6 h-6 fill-current ml-1" />
                  </div>
                </div>

                {video.duration && (
                  <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[11px] font-mono border border-white/20">
                    {video.duration}
                  </span>
                )}
              </div>

              {/* Video Info */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs text-stone-400 dark:text-stone-500 mb-1.5">
                    {video.date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-500" />
                        {new Date(video.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition mb-1">
                    {video.title}
                  </h3>
                  {video.description && (
                    <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                      {video.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Playback Modal */}
      <VideoModal
        video={selectedVideo}
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    </section>
  );
};

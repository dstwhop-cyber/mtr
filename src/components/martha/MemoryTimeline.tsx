import React, { useState } from 'react';
import { MemoryItem } from '../../types';
import { useSettings } from '../../context/SettingsContext';
import { Calendar, MapPin, Sparkles, Heart, BookOpen, Image as ImageIcon } from 'lucide-react';

interface MemoryTimelineProps {
  memories: MemoryItem[];
  onViewPhoto?: (url: string) => void;
}

export const MemoryTimeline: React.FC<MemoryTimelineProps> = ({ memories }) => {
  const { themeClasses } = useSettings();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  return (
    <section id="timeline" className="py-16 sm:py-24 px-4 max-w-5xl mx-auto border-t border-white/40 dark:border-white/10">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3 border border-amber-300/30 backdrop-blur-md">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Timeline Journal</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-3">
          Our Little Memories
        </h2>
        <p className="text-stone-600 dark:text-stone-400 text-sm sm:text-base font-light">
          A written chronicle of the moments that made days a little brighter.
        </p>
      </div>

      {/* Empty State */}
      {memories.length === 0 && (
        <div className="text-center py-16 px-4 bg-white/45 dark:bg-stone-800/40 backdrop-blur-xl rounded-3xl border border-dashed border-amber-200/80 dark:border-stone-700 max-w-md mx-auto shadow-sm">
          <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-3" />
          <h3 className="font-serif text-xl font-bold text-stone-800 dark:text-stone-200 mb-1">
            No memories written yet
          </h3>
          <p className="text-xs sm:text-sm text-stone-500">
            Stories added from the owner dashboard will appear here on your timeline.
          </p>
        </div>
      )}

      {/* Timeline Tree */}
      {memories.length > 0 && (
        <div className="relative pl-6 sm:pl-0">
          {/* Central spine on desktop / left line on mobile */}
          <div className="absolute left-6 sm:left-1/2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-amber-300/60 via-amber-400/80 to-rose-300/60 -translate-x-1/2 rounded-full" />

          <div className="space-y-12 sm:space-y-16">
            {memories.map((memory, index) => {
              const isEven = index % 2 === 0;
              return (
                <div
                  key={memory.id}
                  className={`relative flex flex-col sm:flex-row items-start ${
                    isEven ? 'sm:flex-row-reverse' : ''
                  } group`}
                >
                  {/* Timeline Central Dot */}
                  <div className="absolute left-0 sm:left-1/2 top-4 w-5 h-5 -translate-x-1/2 rounded-full bg-white/90 dark:bg-stone-900/90 border-3 border-amber-500 shadow-md z-10 flex items-center justify-center group-hover:scale-125 transition-transform duration-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  </div>

                  {/* Content Card Container */}
                  <div className="w-full sm:w-[calc(50%-2.5rem)] ml-6 sm:ml-0">
                    <div className="bg-white/60 dark:bg-stone-900/60 backdrop-blur-xl rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-2xl transition-all duration-300 border border-white/80 dark:border-white/10 hover:-translate-y-1">
                      {/* Top Date & Tag */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500 dark:text-stone-400 mb-3">
                        <span className="flex items-center gap-1.5 font-semibold text-amber-800 dark:text-amber-300 bg-amber-500/10 dark:bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-300/30 backdrop-blur-sm">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(memory.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                        {memory.location && (
                          <span className="flex items-center gap-1 text-[11px] text-stone-400">
                            <MapPin className="w-3 h-3 text-rose-500" />
                            {memory.location}
                          </span>
                        )}
                      </div>

                      {/* Memory Title */}
                      <h3 className="font-serif font-bold text-lg sm:text-xl text-stone-900 dark:text-stone-100 mb-2">
                        {memory.title}
                      </h3>

                      {/* Attached Photo preview if present */}
                      {memory.photoUrl && (
                        <div
                          className="my-3 rounded-xl overflow-hidden cursor-pointer aspect-16/9 bg-stone-100 dark:bg-stone-800 border border-white/60 dark:border-stone-700 group/img relative shadow-xs"
                          onClick={() => setSelectedPhoto(memory.photoUrl || null)}
                        >
                          <img
                            src={memory.photoUrl}
                            alt={memory.title}
                            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] flex items-center gap-1 border border-white/20">
                            <ImageIcon className="w-3 h-3" /> View Photo
                          </div>
                        </div>
                      )}

                      {/* Story Description */}
                      <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-light whitespace-pre-line">
                        {memory.description}
                      </p>

                      {/* Wholesome decorative bottom icon */}
                      <div className="mt-4 pt-3 border-t border-stone-200/50 dark:border-white/5 flex items-center justify-between text-stone-400 text-xs">
                        <span className="font-serif italic text-[11px]">
                          {memory.tag ? `#${memory.tag}` : 'A treasured memory'}
                        </span>
                        <Heart className="w-3.5 h-3.5 text-rose-400/70 fill-rose-400/40" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Simple Photo Lightbox for Memory Attachment */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl border border-white/20">
            <img src={selectedPhoto} alt="Memory Snapshot" className="max-w-full max-h-[85vh] object-contain rounded-2xl" />
          </div>
        </div>
      )}
    </section>
  );
};

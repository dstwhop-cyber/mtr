import React from 'react';
import { PhotoItem, VideoItem, SongItem, MemoryItem, AppSettings } from '../../types';
import { getFirebaseInstances } from '../../lib/firebase';
import {
  Image,
  Film,
  Music,
  BookOpen,
  Calendar,
  Cloud,
  HardDrive,
  Sparkles,
  ArrowRight,
  Plus,
  ExternalLink,
} from 'lucide-react';

interface OverviewTabProps {
  photos: PhotoItem[];
  videos: VideoItem[];
  songs: SongItem[];
  memories: MemoryItem[];
  settings: AppSettings;
  onNavigateTab: (tab: string) => void;
  onPreviewMartha: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  photos,
  videos,
  songs,
  memories,
  settings,
  onNavigateTab,
  onPreviewMartha,
}) => {
  const { isConfigured } = getFirebaseInstances();

  const demoPhotosCount = photos.filter((p) => p.isDemo).length;
  const demoVideosCount = videos.filter((v) => v.isDemo).length;
  const demoSongsCount = songs.filter((s) => s.isDemo).length;
  const demoMemoriesCount = memories.filter((m) => m.isDemo).length;
  const totalDemoItems = demoPhotosCount + demoVideosCount + demoSongsCount + demoMemoriesCount;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-amber-500/90 via-orange-500/90 to-rose-500/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6 border border-white/30">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold border border-white/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Admin Studio</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold">
            Martha's Space Manager
          </h2>
          <p className="text-amber-100 text-xs sm:text-sm max-w-xl">
            Everything you upload, modify, or customize here updates Martha's personal website in real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onPreviewMartha}
            className="px-5 py-2.5 rounded-full bg-white text-amber-800 hover:bg-amber-50 font-medium text-xs sm:text-sm shadow-md flex items-center gap-2 transition"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View As Martha</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div
          onClick={() => onNavigateTab('photos')}
          className="cursor-pointer bg-white/60 dark:bg-stone-900/60 backdrop-blur-xl rounded-2xl p-5 border border-white/80 dark:border-white/10 shadow-sm hover:shadow-xl transition-all group hover:-translate-y-1"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center border border-amber-300/30">
              <Image className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-stone-400 group-hover:text-amber-600 flex items-center gap-1 transition">
              Manage <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
            {photos.length}
          </p>
          <p className="text-xs text-stone-500 font-medium mt-1">Photos Uploaded</p>
        </div>

        <div
          onClick={() => onNavigateTab('videos')}
          className="cursor-pointer bg-white/60 dark:bg-stone-900/60 backdrop-blur-xl rounded-2xl p-5 border border-white/80 dark:border-white/10 shadow-sm hover:shadow-xl transition-all group hover:-translate-y-1"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-600 flex items-center justify-center border border-rose-300/30">
              <Film className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-stone-400 group-hover:text-rose-600 flex items-center gap-1 transition">
              Manage <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
            {videos.length}
          </p>
          <p className="text-xs text-stone-500 font-medium mt-1">Video Clips</p>
        </div>

        <div
          onClick={() => onNavigateTab('music')}
          className="cursor-pointer bg-white/60 dark:bg-stone-900/60 backdrop-blur-xl rounded-2xl p-5 border border-white/80 dark:border-white/10 shadow-sm hover:shadow-xl transition-all group hover:-translate-y-1"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-600 flex items-center justify-center border border-purple-300/30">
              <Music className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-stone-400 group-hover:text-purple-600 flex items-center gap-1 transition">
              Manage <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
            {songs.length}
          </p>
          <p className="text-xs text-stone-500 font-medium mt-1">Songs in Playlist</p>
        </div>

        <div
          onClick={() => onNavigateTab('memories')}
          className="cursor-pointer bg-white/60 dark:bg-stone-900/60 backdrop-blur-xl rounded-2xl p-5 border border-white/80 dark:border-white/10 shadow-sm hover:shadow-xl transition-all group hover:-translate-y-1"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center border border-emerald-300/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-stone-400 group-hover:text-emerald-600 flex items-center gap-1 transition">
              Manage <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
            {memories.length}
          </p>
          <p className="text-xs text-stone-500 font-medium mt-1">Timeline Stories</p>
        </div>
      </div>

      {/* System Status & Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Box */}
        <div className="bg-white/60 dark:bg-stone-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/80 dark:border-white/10 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            System & Storage Health
          </h3>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex items-center justify-between py-2 border-b border-stone-200/50 dark:border-stone-800">
              <span className="text-stone-500 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-stone-400" /> Last Updated Date
              </span>
              <span className="font-semibold text-stone-800 dark:text-stone-200">
                {new Date(settings.lastUpdated || Date.now()).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-stone-200/50 dark:border-stone-800">
              <span className="text-stone-500 flex items-center gap-2">
                {isConfigured ? (
                  <Cloud className="w-4 h-4 text-sky-500" />
                ) : (
                  <HardDrive className="w-4 h-4 text-amber-500" />
                )}
                Storage Engine
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isConfigured
                    ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {isConfigured ? 'Firebase Cloud Active' : 'IndexedDB Local Active'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-stone-500">Demo Placeholder Items</span>
              <span className="font-mono text-stone-700 dark:text-stone-300">
                {totalDemoItems} demo item{totalDemoItems === 1 ? '' : 's'} loaded
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions Guide */}
        <div className="bg-white/40 dark:bg-stone-800/40 backdrop-blur-xl rounded-2xl p-6 border border-white/70 dark:border-stone-700 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-lg">
            Quick Actions
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigateTab('photos')}
              className="p-3 bg-white/70 dark:bg-stone-800/70 backdrop-blur-md rounded-xl border border-white/80 dark:border-stone-700 hover:border-amber-400 text-left transition flex items-center gap-2.5 text-xs font-medium text-stone-800 dark:text-stone-200"
            >
              <Plus className="w-4 h-4 text-amber-600" />
              <span>Upload Photos</span>
            </button>

            <button
              onClick={() => onNavigateTab('videos')}
              className="p-3 bg-white/70 dark:bg-stone-800/70 backdrop-blur-md rounded-xl border border-white/80 dark:border-stone-700 hover:border-rose-400 text-left transition flex items-center gap-2.5 text-xs font-medium text-stone-800 dark:text-stone-200"
            >
              <Plus className="w-4 h-4 text-rose-600" />
              <span>Add Video</span>
            </button>

            <button
              onClick={() => onNavigateTab('music')}
              className="p-3 bg-white/70 dark:bg-stone-800/70 backdrop-blur-md rounded-xl border border-white/80 dark:border-stone-700 hover:border-purple-400 text-left transition flex items-center gap-2.5 text-xs font-medium text-stone-800 dark:text-stone-200"
            >
              <Plus className="w-4 h-4 text-purple-600" />
              <span>Add Song</span>
            </button>

            <button
              onClick={() => onNavigateTab('memories')}
              className="p-3 bg-white/70 dark:bg-stone-800/70 backdrop-blur-md rounded-xl border border-white/80 dark:border-stone-700 hover:border-emerald-400 text-left transition flex items-center gap-2.5 text-xs font-medium text-stone-800 dark:text-stone-200"
            >
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>Write Story</span>
            </button>
          </div>

          <p className="text-[11px] text-stone-400">
            Tip: Go to the <strong>Settings</strong> tab to change Martha's password, customize the theme color, or edit the surprise note.
          </p>
        </div>
      </div>
    </div>
  );
};

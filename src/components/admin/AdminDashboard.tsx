import React, { useState, useEffect } from 'react';
import { PhotoItem, VideoItem, SongItem, MemoryItem, AlbumItem } from '../../types';
import { DataService } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { Navbar } from '../common/Navbar';
import { Footer } from '../common/Footer';
import { OverviewTab } from './OverviewTab';
import { PhotosManager } from './PhotosManager';
import { VideosManager } from './VideosManager';
import { MusicManager } from './MusicManager';
import { MemoriesManager } from './MemoriesManager';
import { SettingsManager } from './SettingsManager';
import { FirebaseSetupGuide } from './FirebaseSetupGuide';
import {
  LayoutDashboard,
  Image,
  Film,
  Music,
  BookOpen,
  Settings,
  Cloud,
  Eye,
  Shield,
  Loader2,
} from 'lucide-react';

interface AdminDashboardProps {
  onPreviewMartha: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onPreviewMartha }) => {
  const { authState, isOwner } = useAuth();
  const { settings, themeClasses } = useSettings();

  const [activeTab, setActiveTab] = useState<'overview' | 'photos' | 'videos' | 'music' | 'memories' | 'settings' | 'firebase'>('overview');

  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [songs, setSongs] = useState<SongItem[]>([]);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [albums, setAlbums] = useState<AlbumItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const [fetchedPhotos, fetchedVideos, fetchedSongs, fetchedMemories, fetchedAlbums] =
        await Promise.all([
          DataService.getPhotos(),
          DataService.getVideos(),
          DataService.getSongs(),
          DataService.getMemories(),
          DataService.getAlbums(),
        ]);

      setPhotos(fetchedPhotos);
      setVideos(fetchedVideos);
      setSongs(fetchedSongs);
      setMemories(fetchedMemories);
      setAlbums(fetchedAlbums);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Security guard: If somehow non-owner reaches here, do not display content
  if (!isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="p-8 bg-white/60 dark:bg-stone-900/60 backdrop-blur-2xl rounded-3xl border border-rose-200/80 text-center max-w-sm shadow-xl">
          <Shield className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
            Access Restricted
          </h2>
          <p className="text-xs text-stone-500 mt-2">
            Owner credentials required to view this administrative management studio.
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard, count: null },
    { id: 'photos', name: 'Photos', icon: Image, count: photos.length },
    { id: 'videos', name: 'Videos', icon: Film, count: videos.length },
    { id: 'music', name: 'Music', icon: Music, count: songs.length },
    { id: 'memories', name: 'Memories', icon: BookOpen, count: memories.length },
    { id: 'settings', name: 'Settings & Theme', icon: Settings, count: null },
    { id: 'firebase', name: 'Firebase Cloud', icon: Cloud, count: null },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Top Frosted Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/60 dark:bg-stone-900/60 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-white/80 dark:border-white/10 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center border border-amber-300/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base sm:text-lg text-stone-900 dark:text-stone-100">
                Owner Administration Hub
              </h2>
              <p className="text-xs text-stone-500">
                Logged in as <span className="font-mono text-stone-700 dark:text-stone-300">{authState.userEmail || 'Owner'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onPreviewMartha}
            className={`px-5 py-2.5 rounded-full ${themeClasses.accentBg} text-white font-medium text-xs sm:text-sm shadow-md hover:brightness-105 transition flex items-center gap-2 self-start sm:self-auto border border-white/20`}
          >
            <Eye className="w-4 h-4" />
            <span>Open Martha's Space</span>
          </button>
        </div>

        {/* Frosted Tab Navigation Bar */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-stone-900/90 dark:bg-white/90 text-white dark:text-stone-900 shadow-md backdrop-blur-md border border-stone-700/50 dark:border-white/50'
                    : 'bg-white/55 dark:bg-stone-900/55 backdrop-blur-xl text-stone-600 dark:text-stone-300 hover:bg-white/80 dark:hover:bg-stone-800/80 border border-white/80 dark:border-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
                {tab.count !== null && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isActive
                        ? 'bg-white/20 text-white dark:bg-stone-800 dark:text-stone-200'
                        : 'bg-stone-100/80 dark:bg-stone-800/80 text-stone-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content Tabs */}
        {isLoading ? (
          <div className="text-center py-20 bg-white/40 dark:bg-stone-900/40 backdrop-blur-xl rounded-3xl border border-white/60 dark:border-white/10">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-2" />
            <p className="text-xs text-stone-500">Loading data...</p>
          </div>
        ) : (
          <div className="transition-all duration-200">
            {activeTab === 'overview' && (
              <OverviewTab
                photos={photos}
                videos={videos}
                songs={songs}
                memories={memories}
                settings={settings}
                onNavigateTab={(t) => setActiveTab(t as typeof activeTab)}
                onPreviewMartha={onPreviewMartha}
              />
            )}
            {activeTab === 'photos' && (
              <PhotosManager
                photos={photos}
                albums={albums}
                onRefresh={fetchAllData}
              />
            )}
            {activeTab === 'videos' && (
              <VideosManager
                videos={videos}
                onRefresh={fetchAllData}
              />
            )}
            {activeTab === 'music' && (
              <MusicManager
                songs={songs}
                onRefresh={fetchAllData}
              />
            )}
            {activeTab === 'memories' && (
              <MemoriesManager
                memories={memories}
                photos={photos}
                onRefresh={fetchAllData}
              />
            )}
            {activeTab === 'settings' && (
              <SettingsManager onRefreshAll={fetchAllData} />
            )}
            {activeTab === 'firebase' && <FirebaseSetupGuide />}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

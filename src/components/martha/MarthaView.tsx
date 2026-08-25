import React, { useState, useEffect } from 'react';
import { PhotoItem, VideoItem, MemoryItem, AlbumItem } from '../../types';
import { DataService } from '../../services/dataService';
import { Navbar } from '../common/Navbar';
import { Footer } from '../common/Footer';
import { MarthaHero } from './MarthaHero';
import { PhotoGallery } from './PhotoGallery';
import { VideoMemories } from './VideoMemories';
import { MemoryTimeline } from './MemoryTimeline';
import { SurpriseSection } from './SurpriseSection';
import { Lightbox } from '../common/Lightbox';
import { VideoModal } from '../common/VideoModal';
import { MusicPlayerBar } from '../common/MusicPlayerBar';
import { Heart, Sparkles, AlertCircle } from 'lucide-react';

export const MarthaView: React.FC = () => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [albums, setAlbums] = useState<AlbumItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Video Modal State
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [fetchedPhotos, fetchedVideos, fetchedMemories, fetchedAlbums] = await Promise.all([
        DataService.getPhotos(),
        DataService.getVideos(),
        DataService.getMemories(),
        DataService.getAlbums(),
      ]);

      setPhotos(fetchedPhotos);
      setVideos(fetchedVideos);
      setMemories(fetchedMemories);
      setAlbums(fetchedAlbums);
    } catch (err) {
      console.error('Error fetching Martha data:', err);
      setError('Could not load your memories right now. Please refresh.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleExploreScroll = () => {
    const photosSection = document.getElementById('photos');
    if (photosSection) {
      photosSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleOpenSurprise = () => {
    const surpriseSection = document.getElementById('surprise');
    if (surpriseSection) {
      surpriseSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-stone-50/50 dark:bg-stone-950">
        <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-300 flex items-center justify-center mb-4 animate-bounce">
          <Heart className="w-8 h-8 fill-current" />
        </div>
        <h2 className="font-serif text-xl font-bold text-stone-800 dark:text-stone-100 mb-1">
          Just a second... loading the memories.
        </h2>
        <p className="text-xs text-stone-500 flex items-center gap-1.5 mt-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" /> Gathering photos, songs, and moments
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-md p-6 bg-white/70 dark:bg-stone-900/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/80 dark:border-stone-800 text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 mb-2">
            Something went wrong
          </h3>
          <p className="text-xs text-stone-500 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-6 py-2.5 rounded-full bg-amber-600 text-white text-xs font-medium hover:bg-amber-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pb-28">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content Sections */}
      <main className="flex-1">
        <MarthaHero
          onExplore={handleExploreScroll}
          photoCount={photos.length}
          videoCount={videos.length}
          memoryCount={memories.length}
          photos={photos}
          videos={videos}
          memories={memories}
          onOpenLightbox={handleOpenLightbox}
          onOpenVideo={(v) => setSelectedVideo(v)}
          onOpenSurprise={handleOpenSurprise}
        />

        <PhotoGallery
          photos={photos}
          albums={albums}
          onOpenLightbox={handleOpenLightbox}
        />

        <VideoMemories videos={videos} />

        <MemoryTimeline memories={memories} />

        <SurpriseSection />
      </main>

      {/* Lightbox for Photos */}
      <Lightbox
        photos={photos}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={(idx) => setLightboxIndex(idx)}
      />

      {/* Video Modal Player */}
      <VideoModal
        video={selectedVideo}
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />

      {/* Persistent Bottom Music Player */}
      <MusicPlayerBar />

      {/* Wholesome Footer */}
      <Footer />
    </div>
  );
};

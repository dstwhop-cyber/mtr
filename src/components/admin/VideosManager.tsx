import React, { useState, useRef } from 'react';
import { VideoItem } from '../../types';
import { DataService } from '../../services/dataService';
import { useSettings } from '../../context/SettingsContext';
import { VideoModal } from '../common/VideoModal';
import {
  Film,
  Upload,
  Trash2,
  Play,
  Calendar,
  AlertCircle,
  Check,
  Loader2,
  Link as LinkIcon,
} from 'lucide-react';

interface VideosManagerProps {
  videos: VideoItem[];
  onRefresh: () => Promise<void>;
}

export const VideosManager: React.FC<VideosManagerProps> = ({ videos, onRefresh }) => {
  const { themeClasses } = useSettings();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<VideoItem | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideoFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadMode === 'file' && !videoFile) {
      setError('Please select a video file.');
      return;
    }
    if (uploadMode === 'url' && !videoUrl.trim()) {
      setError('Please provide a valid video URL.');
      return;
    }
    if (!title.trim()) {
      setError('Please enter a video title.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setError(null);

    try {
      let finalUrl = videoUrl.trim();

      if (uploadMode === 'file' && videoFile) {
        const res = await DataService.uploadMedia(videoFile, 'video', (prog) => {
          setUploadProgress(prog);
        });
        finalUrl = res.url;
      }

      await DataService.addVideo({
        url: finalUrl,
        title: title.trim(),
        description: description.trim(),
        date: date || new Date().toISOString().split('T')[0],
        isDemo: false,
      });

      setSuccess(true);
      setTitle('');
      setDescription('');
      setVideoFile(null);
      setVideoUrl('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      await onRefresh();
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      console.error('Video upload error:', err);
      setError('Something went wrong while uploading. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (window.confirm('Delete this video from Martha’s space?')) {
      try {
        await DataService.deleteVideo(id);
        await onRefresh();
      } catch (err) {
        alert('Failed to delete video.');
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Upload Video Section */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200/80 dark:border-stone-800 shadow-sm">
        <div className="flex items-center space-x-2.5 mb-6">
          <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 flex items-center justify-center">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
              Add Video Moment
            </h3>
            <p className="text-xs text-stone-500">
              Upload video clips for Martha to watch
            </p>
          </div>
        </div>

        <form onSubmit={handleAddVideo} className="space-y-5">
          {/* Upload Method Switch */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setUploadMode('file')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                uploadMode === 'file'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
              }`}
            >
              Upload Video File
            </button>
            <button
              type="button"
              onClick={() => setUploadMode('url')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                uploadMode === 'url'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
              }`}
            >
              Direct Video Link
            </button>
          </div>

          {uploadMode === 'file' ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-rose-400 bg-stone-50 dark:bg-stone-800/40 rounded-2xl p-6 text-center cursor-pointer transition"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="video/mp4,video/webm,video/quicktime,video/*"
                className="hidden"
              />
              <Film className="w-8 h-8 text-rose-500 mx-auto mb-2 opacity-80" />
              {videoFile ? (
                <p className="text-xs font-semibold text-rose-600">
                  {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              ) : (
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  Click to select video (MP4, WebM, MOV)
                </p>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                Video URL (Direct MP4 / WebM / Cloud storage link)
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://.../video.mp4"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <LinkIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                Video Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Campfire by the Lake"
                className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
              Short Description / Memory Note
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What made this moment special..."
              rows={2}
              className="w-full px-3.5 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {isUploading && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-stone-500">
                <span>Uploading video...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 transition-all duration-300 rounded-full" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Video successfully added!</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isUploading}
            className="w-full py-3.5 rounded-xl bg-rose-600 text-white font-medium text-sm shadow-md hover:bg-rose-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>Save Video Moment</span>
          </button>
        </form>
      </div>

      {/* Videos List */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-6">
        <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
          Saved Videos ({videos.length})
        </h3>

        {videos.length === 0 ? (
          <p className="text-xs text-stone-400 text-center py-8">No videos uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {videos.map((vid) => (
              <div
                key={vid.id}
                className="group relative bg-stone-50 dark:bg-stone-800 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-700 flex flex-col"
              >
                <div
                  className="aspect-video relative overflow-hidden bg-black cursor-pointer"
                  onClick={() => setPreviewVideo(vid)}
                >
                  <video src={vid.url} className="w-full h-full object-cover opacity-80" preload="metadata" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:scale-110 transition duration-300">
                    <div className="w-10 h-10 rounded-full bg-white/90 text-rose-600 flex items-center justify-center shadow-lg">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </div>
                  </div>
                  {vid.isDemo && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-rose-500 text-white text-[9px] font-mono font-bold">
                      DEMO
                    </span>
                  )}
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 truncate">
                      {vid.title}
                    </h4>
                    <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">{vid.description}</p>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-stone-400 mt-3 pt-2 border-t border-stone-200/60 dark:border-stone-700">
                    <span>{vid.date}</span>
                    <button
                      onClick={() => handleDeleteVideo(vid.id)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                      title="Delete video"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <VideoModal
        video={previewVideo}
        isOpen={!!previewVideo}
        onClose={() => setPreviewVideo(null)}
      />
    </div>
  );
};

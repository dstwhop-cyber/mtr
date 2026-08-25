import React, { useState, useRef } from 'react';
import { VideoItem } from '../../types';
import { DataService } from '../../services/dataService';
import { useSettings } from '../../context/SettingsContext';
import { VideoModal } from '../common/VideoModal';
import { ConfirmModal } from '../common/ConfirmModal';
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
  X,
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

  // Delete modal state
  const [videoToDelete, setVideoToDelete] = useState<VideoItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideoFile(file);
      setError(null);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadMode === 'file' && !videoFile) {
      setError('Please select a video file to upload.');
      return;
    }
    if (uploadMode === 'url' && !videoUrl.trim()) {
      setError('Please enter a valid video link (MP4/WebM/Cloud URL).');
      return;
    }
    if (!title.trim()) {
      setError('Please enter a title for this video moment.');
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

  const confirmDelete = async () => {
    if (!videoToDelete) return;
    setIsDeleting(true);
    try {
      await DataService.deleteVideo(videoToDelete.id);
      setVideoToDelete(null);
      await onRefresh();
    } catch (err) {
      console.error('Failed to delete video', err);
    } finally {
      setIsDeleting(false);
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
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              Upload Video File
            </button>
            <button
              type="button"
              onClick={() => setUploadMode('url')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                uploadMode === 'url'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
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
                <div className="flex items-center justify-center gap-2">
                  <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                    {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setVideoFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="p-1 rounded-full text-stone-400 hover:text-rose-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  Click or drop video file (MP4, WebM, MOV)
                </p>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                Video URL (Direct MP4 / WebM / Cloud video link)
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
                placeholder="e.g. Martha's Birthday Candle Wish"
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
              Short Description / Caption (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What happened in this video? Add a personal note..."
              className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-300 font-medium">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                  Uploading video clip...
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
              <Check className="w-4 h-4 shrink-0" />
              <span>Video successfully added to Martha’s collection!</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isUploading || (uploadMode === 'file' && !videoFile) || (uploadMode === 'url' && !videoUrl)}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-medium text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Video...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Save Video Clip</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Video List & Management */}
      <div className="space-y-4">
        <div>
          <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
            Uploaded Videos ({videos.length})
          </h3>
          <p className="text-xs text-stone-500">
            Play, preview, or remove video moments
          </p>
        </div>

        {videos.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white dark:bg-stone-900 rounded-3xl border border-dashed border-stone-300 dark:border-stone-800">
            <Film className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
              No videos uploaded yet
            </p>
            <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
              Add your first video moment using the upload form above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {videos.map((video) => (
              <div
                key={video.id}
                className="group relative bg-white dark:bg-stone-900 rounded-2xl overflow-hidden border border-stone-200/80 dark:border-stone-800 shadow-xs hover:shadow-md transition flex flex-col"
              >
                {/* Video thumbnail / player preview */}
                <div
                  onClick={() => setPreviewVideo(video)}
                  className="relative aspect-video bg-stone-950 cursor-pointer overflow-hidden"
                >
                  <video
                    src={video.url}
                    className="w-full h-full object-cover opacity-80"
                    preload="metadata"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition">
                    <div className="w-10 h-10 rounded-full bg-white/90 text-rose-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 line-clamp-1 mb-1">
                      {video.title}
                    </h4>
                    {video.description && (
                      <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed mb-2">
                        {video.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-400 dark:text-stone-500 pt-2 border-t border-stone-100 dark:border-stone-800">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-rose-500" />
                      {video.date || 'No date'}
                    </span>
                    <button
                      onClick={() => setVideoToDelete(video)}
                      className="text-xs font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Modal Preview */}
      <VideoModal
        video={previewVideo}
        isOpen={!!previewVideo}
        onClose={() => setPreviewVideo(null)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!videoToDelete}
        title="Delete Video?"
        message={`Are you sure you want to remove "${videoToDelete?.title || 'this video'}" from Martha's space?`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete Video'}
        confirmVariant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setVideoToDelete(null)}
      />
    </div>
  );
};

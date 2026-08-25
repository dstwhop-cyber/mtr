import React, { useState, useRef } from 'react';
import { PhotoItem, AlbumItem } from '../../types';
import { DataService } from '../../services/dataService';
import { useSettings } from '../../context/SettingsContext';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Calendar,
  Tag,
  Plus,
  Check,
  AlertCircle,
  FolderPlus,
  Eye,
  Loader2,
} from 'lucide-react';

interface PhotosManagerProps {
  photos: PhotoItem[];
  albums: AlbumItem[];
  onRefresh: () => Promise<void>;
}

export const PhotosManager: React.FC<PhotosManagerProps> = ({
  photos,
  albums,
  onRefresh,
}) => {
  const { themeClasses } = useSettings();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Form State for new upload
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAlbum, setSelectedAlbum] = useState(albums[0]?.name || 'Favorite Moments');
  const [newAlbumName, setNewAlbumName] = useState('');
  const [showAddAlbum, setShowAddAlbum] = useState(false);

  // Upload status
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Delete & filter state
  const [filterAlbum, setFilterAlbum] = useState('all');
  const [previewPhoto, setPreviewPhoto] = useState<PhotoItem | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
      setUploadError(null);
      setUploadSuccess(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const imgFiles = Array.from(e.dataTransfer.files).filter((f: File) =>
        f.type.startsWith('image/')
      );
      if (imgFiles.length > 0) {
        setSelectedFiles(imgFiles);
        setUploadError(null);
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      setUploadError('Please select at least one photo to upload.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setUploadError(null);

    try {
      const albumToUse = newAlbumName.trim() ? newAlbumName.trim() : selectedAlbum;

      // If user typed a new album, add to album list
      if (newAlbumName.trim()) {
        const newAlb: AlbumItem = {
          id: newAlbumName.toLowerCase().replace(/\s+/g, '-'),
          name: newAlbumName.trim(),
        };
        const updatedAlbums = [...albums, newAlb];
        await DataService.saveAlbums(updatedAlbums);
      }

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const res = await DataService.uploadMedia(file, 'image', (prog) => {
          const totalProgress = Math.round(((i + prog / 100) / selectedFiles.length) * 100);
          setUploadProgress(totalProgress);
        });

        await DataService.addPhoto({
          url: res.url,
          caption: caption.trim() || file.name.replace(/\.[^/.]+$/, ''),
          date: date || new Date().toISOString().split('T')[0],
          album: albumToUse,
          isDemo: false,
        });
      }

      setUploadProgress(100);
      setUploadSuccess(true);
      setSelectedFiles([]);
      setCaption('');
      setNewAlbumName('');
      setShowAddAlbum(false);
      if (fileInputRef.current) fileInputRef.current.value = '';

      await onRefresh();
      setTimeout(() => setUploadSuccess(false), 4000);
    } catch (err) {
      console.error('Photo upload error:', err);
      setUploadError('Something went wrong while uploading. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this photo from Martha’s space?')) {
      try {
        await DataService.deletePhoto(id);
        await onRefresh();
      } catch (err) {
        alert('Failed to delete photo.');
      }
    }
  };

  const filteredPhotos =
    filterAlbum === 'all'
      ? photos
      : photos.filter((p) => p.album?.toLowerCase() === filterAlbum.toLowerCase());

  return (
    <div className="space-y-8">
      {/* Upload Section Card */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200/80 dark:border-stone-800 shadow-sm">
        <div className="flex items-center space-x-2.5 mb-6">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 flex items-center justify-center">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
              Upload New Photos
            </h3>
            <p className="text-xs text-stone-500">
              Add pictures to Martha’s scrapbook gallery
            </p>
          </div>
        </div>

        <form onSubmit={handleUploadSubmit} className="space-y-6">
          {/* Drag & Drop Box */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-amber-500 dark:hover:border-amber-400 bg-stone-50/70 dark:bg-stone-800/40 rounded-2xl p-8 text-center cursor-pointer transition"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              accept="image/*"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 mx-auto flex items-center justify-center mb-3 shadow-xs">
              <ImageIcon className="w-6 h-6" />
            </div>
            {selectedFiles.length > 0 ? (
              <div>
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                  {selectedFiles.length} photo{selectedFiles.length > 1 ? 's' : ''} selected
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  {selectedFiles.map((f) => f.name).slice(0, 3).join(', ')}
                  {selectedFiles.length > 3 ? ` + ${selectedFiles.length - 3} more` : ''}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
                  Drag and drop photos here, or <span className="text-amber-600 underline">browse</span>
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  Supports JPG, PNG, WEBP, GIF
                </p>
              </div>
            )}
          </div>

          {/* Form Fields: Caption, Date, Album */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                Caption / Story Note
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="e.g. Afternoon stroll in the botanic gardens..."
                className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Album Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
                Organize Into Album
              </label>
              <button
                type="button"
                onClick={() => setShowAddAlbum(!showAddAlbum)}
                className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> New Album
              </button>
            </div>

            {!showAddAlbum ? (
              <select
                value={selectedAlbum}
                onChange={(e) => setSelectedAlbum(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {albums.map((alb) => (
                  <option key={alb.id} value={alb.name}>
                    {alb.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAlbumName}
                  onChange={(e) => setNewAlbumName(e.target.value)}
                  placeholder="Enter new album name (e.g. Summer Roadtrip)"
                  className="flex-1 px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowAddAlbum(false)}
                  className="px-3 py-2 text-xs text-stone-500 border border-stone-200 dark:border-stone-700 rounded-xl"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-stone-500 font-medium">
                <span>Uploading to Martha's gallery...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Feedback messages */}
          {uploadError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-600 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{uploadError}</span>
            </div>
          )}

          {uploadSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Photo(s) successfully added to Martha's space!</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isUploading || selectedFiles.length === 0}
            className={`w-full py-3.5 rounded-xl ${themeClasses.accentBg} text-white font-medium text-sm shadow-md hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2`}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading {uploadProgress}%...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload {selectedFiles.length > 0 ? `(${selectedFiles.length} Photos)` : ''}</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Existing Photos List & Album Management */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
              Gallery Photos ({photos.length})
            </h3>
            <p className="text-xs text-stone-500">
              Manage, preview, and remove photos
            </p>
          </div>

          {/* Filter by Album */}
          <div className="flex items-center space-x-2">
            <Tag className="w-4 h-4 text-stone-400" />
            <select
              value={filterAlbum}
              onChange={(e) => setFilterAlbum(e.target.value)}
              className="px-3 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs text-stone-800 dark:text-stone-200"
            >
              <option value="all">All Albums</option>
              {albums.map((a) => (
                <option key={a.id} value={a.name}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredPhotos.length === 0 ? (
          <div className="text-center py-12 text-stone-400 text-xs">
            No photos found in this album.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                className="group relative bg-stone-50 dark:bg-stone-800 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 flex flex-col"
              >
                <div className="aspect-square relative overflow-hidden bg-stone-200">
                  <img
                    src={photo.url}
                    alt={photo.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />

                  {photo.isDemo && (
                    <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-amber-500 text-white text-[9px] font-mono font-bold shadow-xs">
                      DEMO
                    </span>
                  )}

                  {/* Actions overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPreviewPhoto(photo)}
                      className="p-2 rounded-full bg-white/90 text-stone-900 hover:bg-white shadow"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="p-2 rounded-full bg-rose-600 text-white hover:bg-rose-700 shadow"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-2 text-[11px] space-y-1">
                  <p className="font-medium text-stone-800 dark:text-stone-200 truncate" title={photo.caption}>
                    {photo.caption || 'No caption'}
                  </p>
                  <div className="flex items-center justify-between text-stone-400 text-[10px]">
                    <span className="truncate">{photo.album}</span>
                    <span>{photo.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPreviewPhoto(null)}
        >
          <div className="max-w-2xl bg-white dark:bg-stone-900 rounded-2xl overflow-hidden shadow-2xl p-4 space-y-3">
            <img src={previewPhoto.url} alt={previewPhoto.caption} className="w-full max-h-[60vh] object-contain rounded-xl" />
            <div className="text-stone-800 dark:text-stone-200">
              <p className="font-serif italic text-base">“{previewPhoto.caption}”</p>
              <p className="text-xs text-stone-400 mt-1">{previewPhoto.album} • {previewPhoto.date}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

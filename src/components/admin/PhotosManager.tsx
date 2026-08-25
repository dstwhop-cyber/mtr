import React, { useState, useRef } from 'react';
import { PhotoItem, AlbumItem } from '../../types';
import { DataService } from '../../services/dataService';
import { useSettings } from '../../context/SettingsContext';
import { ConfirmModal } from '../common/ConfirmModal';
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
  Link as LinkIcon,
  X,
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
  const [uploadMode, setUploadMode] = useState<'files' | 'url'>('files');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');
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

  // Delete modal state
  const [photoToDelete, setPhotoToDelete] = useState<PhotoItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter & lightbox preview
  const [filterAlbum, setFilterAlbum] = useState('all');
  const [previewPhoto, setPreviewPhoto] = useState<PhotoItem | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files: File[] = Array.from(e.target.files);
      setSelectedFiles(files);
      setUploadError(null);
      setUploadSuccess(false);

      // Generate instant preview URLs
      const previews = files.map((f: File) => URL.createObjectURL(f));
      setFilePreviews(previews);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const allFiles = Array.from(e.dataTransfer.files) as File[];
      const imgFiles = allFiles.filter((f) => f.type.startsWith('image/'));
      if (imgFiles.length > 0) {
        setSelectedFiles(imgFiles);
        setUploadError(null);
        const previews = imgFiles.map((f) => URL.createObjectURL(f));
        setFilePreviews(previews);
      }
    }
  };

  const removeSelectedFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    const updatedPreviews = filePreviews.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    setFilePreviews(updatedPreviews);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadMode === 'files' && selectedFiles.length === 0) {
      setUploadError('Please select at least one photo to upload.');
      return;
    }
    if (uploadMode === 'url' && !imageUrl.trim()) {
      setUploadError('Please enter a valid image URL.');
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

      if (uploadMode === 'url' && imageUrl.trim()) {
        await DataService.addPhoto({
          url: imageUrl.trim(),
          caption: caption.trim() || 'Martha memory',
          date: date || new Date().toISOString().split('T')[0],
          album: albumToUse,
          isDemo: false,
        });
      } else {
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
      }

      setUploadProgress(100);
      setUploadSuccess(true);
      setSelectedFiles([]);
      setFilePreviews([]);
      setImageUrl('');
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

  const confirmDelete = async () => {
    if (!photoToDelete) return;
    setIsDeleting(true);
    try {
      await DataService.deletePhoto(photoToDelete.id);
      setPhotoToDelete(null);
      await onRefresh();
    } catch (err) {
      console.error('Failed to delete photo', err);
    } finally {
      setIsDeleting(false);
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

        {/* Upload Method Switch */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setUploadMode('files')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
              uploadMode === 'files'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
            }`}
          >
            Upload Image Files
          </button>
          <button
            type="button"
            onClick={() => setUploadMode('url')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
              uploadMode === 'url'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
            }`}
          >
            Paste Image URL
          </button>
        </div>

        <form onSubmit={handleUploadSubmit} className="space-y-6">
          {uploadMode === 'files' ? (
            /* Drag & Drop Box */
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-amber-500 dark:hover:border-amber-400 bg-stone-50/70 dark:bg-stone-800/40 rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition"
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
                    {selectedFiles.length} photo{selectedFiles.length > 1 ? 's' : ''} ready to upload
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    Click to add or change photos
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
                    Drag and drop photos here, or <span className="text-amber-600 font-semibold underline">browse</span>
                  </p>
                  <p className="text-xs text-stone-400 mt-1">
                    Supports JPG, PNG, WEBP, GIF, HEIC
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                Direct Image URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or cloud image link"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <LinkIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          {/* Selected File Previews */}
          {filePreviews.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-2">
              {filePreviews.map((src, idx) => (
                <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-100">
                  <img src={src} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSelectedFile(idx);
                    }}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-rose-600 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Metadata Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                Caption or Short Story
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="e.g. Sunset at the coast with Martha"
                className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                Date Taken
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Album Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-stone-700 dark:text-stone-300">
                Album / Category
              </label>
              <button
                type="button"
                onClick={() => setShowAddAlbum(!showAddAlbum)}
                className="text-xs font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 flex items-center gap-1"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>{showAddAlbum ? 'Choose Existing Album' : 'Create New Album'}</span>
              </button>
            </div>

            {showAddAlbum ? (
              <input
                type="text"
                value={newAlbumName}
                onChange={(e) => setNewAlbumName(e.target.value)}
                placeholder="Enter new album name (e.g. Paris Trip 2025)"
                className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-amber-300 dark:border-amber-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            ) : (
              <select
                value={selectedAlbum}
                onChange={(e) => setSelectedAlbum(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {albums.map((alb) => (
                  <option key={alb.id} value={alb.name}>
                    {alb.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-300 font-medium">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                  Uploading photos to Martha's gallery...
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Alerts */}
          {uploadError && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {uploadSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
              <Check className="w-4 h-4 shrink-0" />
              <span>Photos uploaded successfully to Martha’s gallery!</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isUploading || (uploadMode === 'files' && selectedFiles.length === 0 && !caption) || (uploadMode === 'url' && !imageUrl)}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-medium text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Photo...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload to Gallery</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Existing Photos List & Management */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
              Scrapbook Gallery ({photos.length})
            </h3>
            <p className="text-xs text-stone-500">
              View, filter, or delete photos currently on the website
            </p>
          </div>

          {/* Album Filter */}
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-stone-400" />
            <select
              value={filterAlbum}
              onChange={(e) => setFilterAlbum(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">All Albums ({photos.length})</option>
              {albums.map((alb) => (
                <option key={alb.id} value={alb.name}>
                  {alb.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Empty State */}
        {photos.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white dark:bg-stone-900 rounded-3xl border border-dashed border-stone-300 dark:border-stone-800">
            <ImageIcon className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
              No photos uploaded yet
            </p>
            <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
              Use the upload box above to add your first memorable pictures for Martha.
            </p>
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
            <p className="text-sm text-stone-500">
              No photos found in album "{filterAlbum}".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                className="group relative bg-white dark:bg-stone-900 rounded-2xl overflow-hidden border border-stone-200/80 dark:border-stone-800 shadow-xs hover:shadow-md transition flex flex-col"
              >
                {/* Photo Image */}
                <div className="relative aspect-square bg-stone-100 dark:bg-stone-800 overflow-hidden">
                  <img
                    src={photo.url}
                    alt={photo.caption || 'Memory'}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                  />
                  {/* Delete overlay button */}
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition">
                    <button
                      onClick={() => setPhotoToDelete(photo)}
                      title="Delete Photo"
                      className="p-2 rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-700 hover:scale-105 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {photo.album && (
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-medium">
                      {photo.album}
                    </span>
                  )}
                </div>

                {/* Caption & Date Details */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  {photo.caption && (
                    <p className="text-xs font-medium text-stone-800 dark:text-stone-200 line-clamp-2 italic mb-1.5">
                      "{photo.caption}"
                    </p>
                  )}
                  <div className="flex items-center justify-between text-[11px] text-stone-400 dark:text-stone-500 mt-auto pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-amber-500" />
                      {photo.date || 'No date'}
                    </span>
                    <button
                      onClick={() => setPhotoToDelete(photo)}
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!photoToDelete}
        title="Delete Photo?"
        message={`Are you sure you want to remove "${photoToDelete?.caption || 'this photo'}" from Martha's gallery? This action cannot be undone.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete Photo'}
        confirmVariant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setPhotoToDelete(null)}
      />
    </div>
  );
};

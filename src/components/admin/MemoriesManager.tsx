import React, { useState, useRef } from 'react';
import { MemoryItem, PhotoItem } from '../../types';
import { DataService } from '../../services/dataService';
import { useSettings } from '../../context/SettingsContext';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  BookOpen,
  Plus,
  Trash2,
  Calendar,
  Image as ImageIcon,
  MapPin,
  Tag,
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
  Link as LinkIcon,
  X,
} from 'lucide-react';

interface MemoriesManagerProps {
  memories: MemoryItem[];
  photos: PhotoItem[];
  onRefresh: () => Promise<void>;
}

export const MemoriesManager: React.FC<MemoriesManagerProps> = ({
  memories,
  photos,
  onRefresh,
}) => {
  const { themeClasses } = useSettings();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [tag, setTag] = useState('Heartfelt');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Delete modal state
  const [memoryToDelete, setMemoryToDelete] = useState<MemoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title for this memory.');
      return;
    }
    if (!description.trim()) {
      setError('Please write a short description or story.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      let finalPhotoUrl = photoUrl.trim();

      if (photoFile) {
        const res = await DataService.uploadMedia(photoFile, 'image');
        finalPhotoUrl = res.url;
      }

      await DataService.addMemory({
        title: title.trim(),
        description: description.trim(),
        date: date || new Date().toISOString().split('T')[0],
        location: location.trim() || undefined,
        tag: tag.trim() || 'Heartfelt',
        photoUrl: finalPhotoUrl || undefined,
        isDemo: false,
      });

      setSuccess(true);
      setTitle('');
      setDescription('');
      setLocation('');
      setTag('Heartfelt');
      setPhotoUrl('');
      setPhotoFile(null);
      setPhotoPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      await onRefresh();
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      console.error('Save memory error:', err);
      setError('Something went wrong while saving this memory. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!memoryToDelete) return;
    setIsDeleting(true);
    try {
      await DataService.deleteMemory(memoryToDelete.id);
      setMemoryToDelete(null);
      await onRefresh();
    } catch (err) {
      console.error('Failed to delete memory', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const TAG_OPTIONS = ['Heartfelt', 'Funny', 'Adventure', 'Cozy', 'Milestone', 'Secret Joke'];

  return (
    <div className="space-y-8">
      {/* Create Memory Card */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200/80 dark:border-stone-800 shadow-sm">
        <div className="flex items-center space-x-2.5 mb-6">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
              Write a Scrapbook Story
            </h3>
            <p className="text-xs text-stone-500">
              Add a heartwarming memory to Martha’s timeline
            </p>
          </div>
        </div>

        <form onSubmit={handleAddMemory} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                Memory Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. That Day We Couldn’t Stop Laughing"
                className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
              The Story / Personal Message
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell the story in your own words... what made this moment special with Martha?"
              className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                Location (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Downtown Coffee Shop, California"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                Memory Tag
              </label>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {TAG_OPTIONS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTag(t)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                      tag === t
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Photo Attachment (Optional) */}
          <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-3">
            <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-emerald-600" />
              Accompanying Photo (Optional)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-stone-300 dark:border-stone-600 rounded-xl p-3 text-center cursor-pointer hover:border-emerald-500 transition"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoSelect}
                  accept="image/*"
                  className="hidden"
                />
                <p className="text-xs text-stone-600 dark:text-stone-300">
                  {photoFile ? photoFile.name : 'Choose Photo File'}
                </p>
              </div>

              <div>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="Or paste photo image URL..."
                  className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {photoPreview && (
              <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700">
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setPhotoFile(null);
                    setPhotoPreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-rose-600 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
              <Check className="w-4 h-4 shrink-0" />
              <span>Story successfully added to Martha’s timeline!</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving || !title.trim() || !description.trim()}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Story...</span>
              </>
            ) : (
              <>
                <BookOpen className="w-4 h-4" />
                <span>Add Memory Story</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Timeline Stories List & Management */}
      <div className="space-y-4">
        <div>
          <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
            Timeline Stories ({memories.length})
          </h3>
          <p className="text-xs text-stone-500">
            Stories and special notes shown in Martha's journey timeline
          </p>
        </div>

        {memories.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white dark:bg-stone-900 rounded-3xl border border-dashed border-stone-300 dark:border-stone-800">
            <BookOpen className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
              No memory stories written yet
            </p>
            <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
              Write your first story above to populate Martha's memory journey timeline.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {memories.map((mem) => (
              <div
                key={mem.id}
                className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200/80 dark:border-stone-800 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-semibold uppercase tracking-wide">
                      {mem.tag || 'Memory'}
                    </span>
                    <span className="text-[11px] text-stone-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-emerald-500" />
                      {mem.date}
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 mb-1.5">
                    {mem.title}
                  </h4>

                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 line-clamp-3 leading-relaxed mb-3">
                    {mem.description}
                  </p>

                  {mem.photoUrl && (
                    <div className="relative h-28 rounded-xl overflow-hidden mb-3 border border-stone-200 dark:border-stone-800">
                      <img
                        src={mem.photoUrl}
                        alt={mem.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800 text-xs">
                  {mem.location ? (
                    <span className="text-stone-400 text-[11px] flex items-center gap-1 truncate max-w-[60%]">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{mem.location}</span>
                    </span>
                  ) : (
                    <span />
                  )}

                  <button
                    onClick={() => setMemoryToDelete(mem)}
                    className="text-xs font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1 ml-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!memoryToDelete}
        title="Delete Memory Story?"
        message={`Are you sure you want to remove "${memoryToDelete?.title || 'this memory'}" from Martha's timeline?`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete Story'}
        confirmVariant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setMemoryToDelete(null)}
      />
    </div>
  );
};

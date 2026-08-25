import React, { useState, useRef } from 'react';
import { MemoryItem, PhotoItem } from '../../types';
import { DataService } from '../../services/dataService';
import { useSettings } from '../../context/SettingsContext';
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
  const [tag, setTag] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
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
        tag: tag.trim() || undefined,
        photoUrl: finalPhotoUrl || undefined,
        isDemo: false,
      });

      setSuccess(true);
      setTitle('');
      setDescription('');
      setLocation('');
      setTag('');
      setPhotoUrl('');
      setPhotoFile(null);
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

  const handleDeleteMemory = async (id: string) => {
    if (window.confirm('Delete this memory card from the timeline?')) {
      try {
        await DataService.deleteMemory(id);
        await onRefresh();
      } catch (err) {
        alert('Failed to delete memory.');
      }
    }
  };

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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write the story, inside jokes, and why you remember this day..."
              rows={4}
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
                  placeholder="e.g. Pacific Coast Highway"
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <MapPin className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                Category Tag (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="e.g. Funny, Adventure, Cozy"
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* Attached Photo */}
          <div>
            <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
              Attach a Photo (Optional)
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 rounded-xl text-xs font-medium text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 flex items-center gap-2"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{photoFile ? photoFile.name : 'Upload New Photo'}</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoSelect}
                accept="image/*"
                className="hidden"
              />

              <span className="text-[11px] text-stone-400">or select from gallery:</span>
              <select
                value={photoUrl}
                onChange={(e) => {
                  setPhotoUrl(e.target.value);
                  setPhotoFile(null);
                }}
                className="px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-700 dark:text-stone-300 max-w-xs"
              >
                <option value="">-- No photo attached --</option>
                {photos.map((p) => (
                  <option key={p.id} value={p.url}>
                    {p.caption ? p.caption.slice(0, 30) : p.album} ({p.date})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Story saved to timeline!</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3.5 rounded-xl bg-emerald-600 text-white font-medium text-sm shadow-md hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>Add to Martha's Timeline</span>
          </button>
        </form>
      </div>

      {/* Existing Memories List */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-6">
        <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
          Timeline Memories ({memories.length})
        </h3>

        {memories.length === 0 ? (
          <p className="text-xs text-stone-400 text-center py-8">No memories written yet.</p>
        ) : (
          <div className="space-y-4">
            {memories.map((mem) => (
              <div
                key={mem.id}
                className="p-4 sm:p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row gap-4 justify-between"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {mem.date}
                    </span>
                    {mem.location && (
                      <span className="flex items-center gap-1 text-stone-400">
                        <MapPin className="w-3 h-3" />
                        {mem.location}
                      </span>
                    )}
                    {mem.tag && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-medium">
                        #{mem.tag}
                      </span>
                    )}
                    {mem.isDemo && (
                      <span className="bg-amber-100 text-amber-800 text-[9px] font-mono px-1.5 py-0.5 rounded">
                        DEMO
                      </span>
                    )}
                  </div>

                  <h4 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                    {mem.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 whitespace-pre-line leading-relaxed">
                    {mem.description}
                  </p>
                </div>

                {mem.photoUrl && (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-stone-200 flex-shrink-0 self-start">
                    <img src={mem.photoUrl} alt={mem.title} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex sm:flex-col justify-end items-end">
                  <button
                    onClick={() => handleDeleteMemory(mem.id)}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                    title="Delete Memory"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

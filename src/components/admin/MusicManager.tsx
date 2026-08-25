import React, { useState, useRef } from 'react';
import { SongItem } from '../../types';
import { DataService } from '../../services/dataService';
import { useMusic } from '../../context/MusicContext';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Music,
  Upload,
  Trash2,
  Play,
  Pause,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Radio,
  X,
  Link as LinkIcon,
} from 'lucide-react';

interface MusicManagerProps {
  songs: SongItem[];
  onRefresh: () => Promise<void>;
}

export const MusicManager: React.FC<MusicManagerProps> = ({ songs, onRefresh }) => {
  const { playSong, isPlaying, currentSong, togglePlay } = useMusic();
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverUrl, setCoverUrl] = useState('');

  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Delete modal state
  const [songToDelete, setSongToDelete] = useState<SongItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAudioFile(file);
      setError(null);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverFile(e.target.files[0]);
    }
  };

  const handleAddSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadMode === 'file' && !audioFile) {
      setError('Please select an audio file (MP3, WAV, AAC, M4A).');
      return;
    }
    if (uploadMode === 'url' && !audioUrl.trim()) {
      setError('Please enter a valid audio stream URL.');
      return;
    }
    if (!title.trim()) {
      setError('Please enter a song title.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);
    setError(null);

    try {
      let finalAudioUrl = audioUrl.trim();
      let finalCoverUrl = coverUrl.trim();

      // Upload Cover if provided
      if (coverFile) {
        const coverRes = await DataService.uploadMedia(coverFile, 'image');
        finalCoverUrl = coverRes.url;
      }

      // Upload Audio file if provided
      if (uploadMode === 'file' && audioFile) {
        const audioRes = await DataService.uploadMedia(audioFile, 'audio', (prog) => {
          setUploadProgress(prog);
        });
        finalAudioUrl = audioRes.url;
      }

      await DataService.addSong({
        url: finalAudioUrl,
        title: title.trim(),
        artist: artist.trim() || 'For Martha Soundtrack',
        coverUrl: finalCoverUrl || undefined,
        isAutoPlay: isAutoPlay,
        order: songs.length,
        isDemo: false,
      });

      setSuccess(true);
      setTitle('');
      setArtist('');
      setIsAutoPlay(false);
      setAudioFile(null);
      setAudioUrl('');
      setCoverFile(null);
      setCoverUrl('');
      if (audioInputRef.current) audioInputRef.current.value = '';
      if (coverInputRef.current) coverInputRef.current.value = '';

      await onRefresh();
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      console.error('Song add error:', err);
      setError('Something went wrong while saving the song. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const confirmDelete = async () => {
    if (!songToDelete) return;
    setIsDeleting(true);
    try {
      await DataService.deleteSong(songToDelete.id);
      setSongToDelete(null);
      await onRefresh();
    } catch (err) {
      console.error('Failed to delete song', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleAutoplay = async (song: SongItem) => {
    try {
      await DataService.updateSong(song.id, { isAutoPlay: !song.isAutoPlay });
      await onRefresh();
    } catch (err) {
      console.error('Failed to toggle autoplay', err);
    }
  };

  const moveOrder = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === songs.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const songA = songs[index];
    const songB = songs[targetIndex];

    await DataService.updateSong(songA.id, { order: targetIndex });
    await DataService.updateSong(songB.id, { order: index });
    await onRefresh();
  };

  return (
    <div className="space-y-8">
      {/* Add Song Card */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200/80 dark:border-stone-800 shadow-sm">
        <div className="flex items-center space-x-2.5 mb-6">
          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 flex items-center justify-center">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
              Add Song to Soundtrack
            </h3>
            <p className="text-xs text-stone-500">
              Upload gentle background music to play while Martha browses her memories
            </p>
          </div>
        </div>

        <form onSubmit={handleAddSong} className="space-y-5">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setUploadMode('file')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                uploadMode === 'file'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              Upload Audio File (MP3, WAV, M4A)
            </button>
            <button
              type="button"
              onClick={() => setUploadMode('url')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                uploadMode === 'url'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              Direct Audio URL
            </button>
          </div>

          {uploadMode === 'file' ? (
            <div
              onClick={() => audioInputRef.current?.click()}
              className="border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-purple-400 bg-stone-50 dark:bg-stone-800/40 rounded-2xl p-6 text-center cursor-pointer transition"
            >
              <input
                type="file"
                ref={audioInputRef}
                onChange={handleAudioSelect}
                accept="audio/mp3,audio/wav,audio/m4a,audio/aac,audio/ogg,audio/*"
                className="hidden"
              />
              <Music className="w-8 h-8 text-purple-500 mx-auto mb-2 opacity-80" />
              {audioFile ? (
                <div className="flex items-center justify-center gap-2">
                  <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                    {audioFile.name} ({(audioFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAudioFile(null);
                      if (audioInputRef.current) audioInputRef.current.value = '';
                    }}
                    className="p-1 rounded-full text-stone-400 hover:text-purple-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  Click or drag audio file here (MP3, WAV, AAC, M4A)
                </p>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                Audio Stream Link
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  placeholder="https://.../music.mp3"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <LinkIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          {/* Song Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                Song Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Martha's Favorite Melody"
                className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                Artist / Mood (Optional)
              </label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="e.g. Acoustic & Warm"
                className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Cover Art (Optional) */}
          <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-purple-500" />
                Album Artwork (Optional)
              </span>
              <span className="text-[11px] text-stone-400">Square artwork image</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => coverInputRef.current?.click()}
                className="border border-dashed border-stone-300 dark:border-stone-600 rounded-xl p-3 text-center cursor-pointer hover:border-purple-500 transition"
              >
                <input
                  type="file"
                  ref={coverInputRef}
                  onChange={handleCoverSelect}
                  accept="image/*"
                  className="hidden"
                />
                <p className="text-xs text-stone-600 dark:text-stone-300">
                  {coverFile ? coverFile.name : 'Upload Artwork File'}
                </p>
              </div>

              <div>
                <input
                  type="url"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="Or paste artwork image URL..."
                  className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Autoplay checkbox */}
          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isAutoPlay}
              onChange={(e) => setIsAutoPlay(e.target.checked)}
              className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
            />
            <span className="text-xs text-stone-700 dark:text-stone-300 font-medium">
              Start this song automatically when Martha enters the space
            </span>
          </label>

          {/* Progress bar */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-300 font-medium">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
                  Saving song to soundtrack...
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 transition-all duration-300 rounded-full"
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
              <span>Song added to Martha’s soundtrack playlist!</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isUploading || (uploadMode === 'file' && !audioFile) || (uploadMode === 'url' && !audioUrl)}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading Song...</span>
              </>
            ) : (
              <>
                <Music className="w-4 h-4" />
                <span>Add to Playlist</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Playlist Management */}
      <div className="space-y-4">
        <div>
          <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
            Current Soundtrack Playlist ({songs.length})
          </h3>
          <p className="text-xs text-stone-500">
            Reorder, preview, or remove songs
          </p>
        </div>

        {songs.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white dark:bg-stone-900 rounded-3xl border border-dashed border-stone-300 dark:border-stone-800">
            <Music className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
              No songs in playlist yet
            </p>
            <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
              Upload gentle background songs so music plays as Martha explores the site.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {songs.map((song, index) => {
              const isThisPlaying = currentSong?.id === song.id && isPlaying;
              return (
                <div
                  key={song.id}
                  className="bg-white dark:bg-stone-900 rounded-2xl p-3.5 sm:p-4 border border-stone-200/80 dark:border-stone-800 shadow-xs hover:shadow-sm transition flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Play/Pause Button */}
                    <button
                      onClick={() => {
                        if (currentSong?.id === song.id) {
                          togglePlay();
                        } else {
                          playSong(song);
                        }
                      }}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition ${
                        isThisPlaying
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 hover:scale-105'
                      }`}
                    >
                      {isThisPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>

                    {/* Album Art / Icon */}
                    {song.coverUrl ? (
                      <img
                        src={song.coverUrl}
                        alt={song.title}
                        className="w-10 h-10 rounded-lg object-cover border border-stone-200 dark:border-stone-700 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 shrink-0">
                        <Music className="w-5 h-5" />
                      </div>
                    )}

                    {/* Title & Artist */}
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">
                        {song.title}
                      </p>
                      <p className="text-[11px] text-stone-500 truncate">
                        {song.artist || 'Soundtrack'}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Badges */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Autoplay Toggle */}
                    <button
                      onClick={() => handleToggleAutoplay(song)}
                      title={song.isAutoPlay ? 'Autoplay Enabled' : 'Enable Autoplay'}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition flex items-center gap-1 ${
                        song.isAutoPlay
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                          : 'text-stone-400 hover:text-stone-600'
                      }`}
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">
                        {song.isAutoPlay ? 'Autoplay' : 'Manual'}
                      </span>
                    </button>

                    {/* Move Up/Down */}
                    <div className="flex items-center">
                      <button
                        onClick={() => moveOrder(index, 'up')}
                        disabled={index === 0}
                        className="p-1.5 text-stone-400 hover:text-stone-600 disabled:opacity-20"
                        title="Move Up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveOrder(index, 'down')}
                        disabled={index === songs.length - 1}
                        className="p-1.5 text-stone-400 hover:text-stone-600 disabled:opacity-20"
                        title="Move Down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => setSongToDelete(song)}
                      className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                      title="Delete Song"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!songToDelete}
        title="Delete Song?"
        message={`Are you sure you want to remove "${songToDelete?.title || 'this song'}" from Martha's playlist?`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete Song'}
        confirmVariant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setSongToDelete(null)}
      />
    </div>
  );
};

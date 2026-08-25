import React, { useState, useRef } from 'react';
import { SongItem } from '../../types';
import { DataService } from '../../services/dataService';
import { useMusic } from '../../context/MusicContext';
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

  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAudioFile(file);
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

  const handleDeleteSong = async (id: string) => {
    if (window.confirm('Remove this song from the playlist?')) {
      try {
        await DataService.deleteSong(id);
        await onRefresh();
      } catch (err) {
        alert('Failed to delete song.');
      }
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
              Upload gentle music to play while Martha browses her memories
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
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
              }`}
            >
              Upload MP3 File
            </button>
            <button
              type="button"
              onClick={() => setUploadMode('url')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                uploadMode === 'url'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
              }`}
            >
              Direct Audio URL
            </button>
          </div>

          {/* Audio selector */}
          {uploadMode === 'file' ? (
            <div
              onClick={() => audioInputRef.current?.click()}
              className="border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-purple-500 bg-stone-50 dark:bg-stone-800/40 rounded-2xl p-6 text-center cursor-pointer transition"
            >
              <input
                type="file"
                ref={audioInputRef}
                onChange={handleAudioSelect}
                accept="audio/mp3,audio/wav,audio/aac,audio/m4a,audio/*"
                className="hidden"
              />
              <Music className="w-8 h-8 text-purple-600 mx-auto mb-2 opacity-80" />
              {audioFile ? (
                <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                  {audioFile.name} ({(audioFile.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              ) : (
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  Click to select audio file (MP3, WAV, AAC, M4A)
                </p>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                Audio Stream URL
              </label>
              <input
                type="url"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="https://.../song.mp3"
                className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}

          {/* Song Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                Song Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Warm Afternoon Chai"
                className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                Artist / Mood
              </label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="e.g. Acoustic Memories"
                className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Optional Cover Art */}
          <div>
            <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
              Optional Album Cover Artwork
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl text-xs font-medium text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 flex items-center gap-2"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{coverFile ? coverFile.name : 'Upload Artwork'}</span>
              </button>
              <input
                type="file"
                ref={coverInputRef}
                onChange={handleCoverSelect}
                accept="image/*"
                className="hidden"
              />
              <span className="text-[11px] text-stone-400">or</span>
              <input
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="Paste Image URL..."
                className="flex-1 px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Autoplay Checkbox */}
          <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50">
            <input
              type="checkbox"
              id="autoplayCheck"
              checked={isAutoPlay}
              onChange={(e) => setIsAutoPlay(e.target.checked)}
              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
            />
            <label htmlFor="autoplayCheck" className="text-xs text-stone-700 dark:text-stone-300 cursor-pointer select-none">
              <strong>Set as primary soundtrack</strong> (Will load first when Martha presses "Play")
            </label>
          </div>

          {isUploading && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-stone-500">
                <span>Saving song...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
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
              <span>Song added to playlist!</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isUploading}
            className="w-full py-3.5 rounded-xl bg-purple-600 text-white font-medium text-sm shadow-md hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>Save Song to Playlist</span>
          </button>
        </form>
      </div>

      {/* Existing Playlist Table */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-6">
        <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
          Soundtrack Playlist ({songs.length})
        </h3>

        {songs.length === 0 ? (
          <div className="text-center py-8 text-stone-400 text-xs">
            Add a soundtrack to this space.
          </div>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {songs.map((song, index) => {
              const isCurrentPlaying = currentSong?.id === song.id && isPlaying;
              return (
                <div
                  key={song.id}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-stone-50/80 dark:hover:bg-stone-800/40 px-2 rounded-xl transition"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <button
                      onClick={() => playSong(song)}
                      className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center hover:scale-105 transition flex-shrink-0"
                    >
                      {isCurrentPlaying ? (
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      )}
                    </button>

                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-stone-200 dark:bg-stone-800 flex-shrink-0">
                      {song.coverUrl ? (
                        <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400">
                          <Music className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">
                          {song.title}
                        </p>
                        {song.isAutoPlay && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 text-[10px] font-semibold">
                            Primary
                          </span>
                        )}
                        {song.isDemo && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-mono">
                            DEMO
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500 truncate">{song.artist}</p>
                    </div>
                  </div>

                  {/* Actions: Reorder & Autoplay & Delete */}
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <button
                      onClick={() => handleToggleAutoplay(song)}
                      className={`p-1.5 rounded-lg text-xs font-medium transition ${
                        song.isAutoPlay
                          ? 'text-purple-600 bg-purple-50 dark:bg-purple-950'
                          : 'text-stone-400 hover:text-stone-700'
                      }`}
                      title={song.isAutoPlay ? 'Primary Soundtrack' : 'Set as primary'}
                    >
                      <Radio className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => moveOrder(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-20"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveOrder(index, 'down')}
                      disabled={index === songs.length - 1}
                      className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-20"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteSong(song.id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700"
                      title="Delete song"
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
    </div>
  );
};

import React, { useState } from 'react';
import { useSettings, THEME_STYLES } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { DataService } from '../../services/dataService';
import { ThemePreset, ParticleAnimationType } from '../../types';
import { getFirebaseInstances } from '../../lib/firebase';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Settings,
  Palette,
  Sparkles,
  Lock,
  Heart,
  Save,
  Check,
  AlertCircle,
  Database,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  KeyRound,
  Shield,
  Cloud,
  LogOut,
} from 'lucide-react';

interface SettingsManagerProps {
  onRefreshAll: () => Promise<void>;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({ onRefreshAll }) => {
  const { settings, updateSettings, themeClasses } = useSettings();
  const { updateMarthaPassword, updateOwnerPassword, logout } = useAuth();
  const { isConfigured } = getFirebaseInstances();

  // General texts state
  const [siteTitle, setSiteTitle] = useState(settings.siteTitle || 'For Martha');
  const [siteSubtitle, setSiteSubtitle] = useState(
    settings.siteSubtitle || 'A little place filled with memories, music, and moments.'
  );
  const [marthaGreeting, setMarthaGreeting] = useState(settings.marthaGreeting || 'Hi Martha');
  const [marthaSubtext, setMarthaSubtext] = useState(
    settings.marthaSubtext || 'I made a little corner of the internet just for you.'
  );
  const [surpriseTitle, setSurpriseTitle] = useState(settings.surpriseTitle || 'One More Thing...');
  const [surpriseMessage, setSurpriseMessage] = useState(
    settings.surpriseMessage ||
      'You make ordinary moments feel a little more special. I hope this little website makes you smile.'
  );

  // Appearance state
  const [themePreset, setThemePreset] = useState<ThemePreset>(settings.themePreset || 'warm-amber');
  const [particleType, setParticleType] = useState<ParticleAnimationType>(
    settings.particleType || 'warm-glow'
  );
  const [animationsEnabled, setAnimationsEnabled] = useState(
    settings.animationsEnabled ?? true
  );

  // Password change state
  const [newMarthaPass, setNewMarthaPass] = useState('');
  const [confirmMarthaPass, setConfirmMarthaPass] = useState('');
  const [marthaPassMsg, setMarthaPassMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const [newOwnerPass, setNewOwnerPass] = useState('');
  const [confirmOwnerPass, setConfirmOwnerPass] = useState('');
  const [ownerPassMsg, setOwnerPassMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // General form feedback
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Backup state
  const [importJson, setImportJson] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Confirmation modal state
  const [confirmAction, setConfirmAction] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: async () => {},
  });

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings({
        siteTitle: siteTitle.trim(),
        siteSubtitle: siteSubtitle.trim(),
        marthaGreeting: marthaGreeting.trim(),
        marthaSubtext: marthaSubtext.trim(),
        surpriseTitle: surpriseTitle.trim(),
        surpriseMessage: surpriseMessage.trim(),
        themePreset,
        particleType,
        animationsEnabled,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateMarthaPass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMarthaPass) {
      setMarthaPassMsg({ text: 'Please enter a password', isError: true });
      return;
    }
    if (newMarthaPass !== confirmMarthaPass) {
      setMarthaPassMsg({ text: 'Passwords do not match', isError: true });
      return;
    }

    const success = await updateMarthaPassword(newMarthaPass);
    if (success) {
      setMarthaPassMsg({ text: 'Martha’s password successfully updated!', isError: false });
      setNewMarthaPass('');
      setConfirmMarthaPass('');
      setTimeout(() => setMarthaPassMsg(null), 4000);
    } else {
      setMarthaPassMsg({ text: 'Failed to update password.', isError: true });
    }
  };

  const handleUpdateOwnerPass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOwnerPass) {
      setOwnerPassMsg({ text: 'Please enter an owner password', isError: true });
      return;
    }
    if (newOwnerPass !== confirmOwnerPass) {
      setOwnerPassMsg({ text: 'Passwords do not match', isError: true });
      return;
    }

    const success = await updateOwnerPassword(newOwnerPass);
    if (success) {
      setOwnerPassMsg({ text: 'Owner password successfully updated!', isError: false });
      setNewOwnerPass('');
      setConfirmOwnerPass('');
      setTimeout(() => setOwnerPassMsg(null), 4000);
    } else {
      setOwnerPassMsg({ text: 'Failed to update owner password.', isError: true });
    }
  };

  const handleExportBackup = async () => {
    const json = await DataService.exportBackupJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `For_Martha_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = async () => {
    if (!importJson.trim()) return;
    const ok = await DataService.importBackupJson(importJson);
    if (ok) {
      setImportStatus('Backup imported successfully!');
      await onRefreshAll();
      setImportJson('');
      setTimeout(() => setImportStatus(null), 4000);
    } else {
      setImportStatus('Failed to parse JSON backup.');
    }
  };

  const promptClearDemoData = () => {
    setConfirmAction({
      isOpen: true,
      title: 'Clear All Demo Data?',
      message: 'This will purge all sample placeholder items from the database and local storage so you have a completely clean space.',
      action: async () => {
        await DataService.clearAllDemoData();
        await onRefreshAll();
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* Save general settings header */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-6">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
              Personalization & Aesthetics
            </h3>
            <p className="text-xs text-stone-500">
              Customize website titles, greetings, colors, and secret notes
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveGeneral} className="space-y-6">
          {/* Theme Palette Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-3 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-amber-600" /> Color Theme Preset
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(Object.keys(THEME_STYLES) as ThemePreset[]).map((key) => {
                const theme = THEME_STYLES[key];
                const isSelected = themePreset === key;
                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => setThemePreset(key)}
                    className={`p-3 rounded-2xl border text-left transition flex items-center space-x-3 ${
                      isSelected
                        ? 'border-amber-500 ring-2 ring-amber-500/30 bg-amber-50/50 dark:bg-stone-800'
                        : 'border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full ${theme.accentBg} shrink-0 shadow-xs`} />
                    <span className="text-xs font-medium text-stone-800 dark:text-stone-200 truncate">
                      {theme.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Background Particles Animation */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" /> Ambient Background Animation
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'warm-glow', name: 'Warm Glowing Orbs' },
                { id: 'stars', name: 'Floating Stars' },
                { id: 'hearts', name: 'Soft Tiny Hearts' },
                { id: 'champagne', name: 'Champagne Sparkles' },
                { id: 'none', name: 'None (Clean/Off)' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => {
                    setParticleType(opt.id as ParticleAnimationType);
                    if (opt.id === 'none') {
                      setAnimationsEnabled(false);
                    } else {
                      setAnimationsEnabled(true);
                    }
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-medium transition ${
                    particleType === opt.id
                      ? `${themeClasses.accentBg} text-white shadow-xs`
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  {opt.name}
                </button>
              ))}
            </div>
          </div>

          {/* Titles & Texts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                Website Title
              </label>
              <input
                type="text"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                Website Subtitle
              </label>
              <input
                type="text"
                value={siteSubtitle}
                onChange={(e) => setSiteSubtitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Martha Greetings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                Martha's Hero Greeting
              </label>
              <input
                type="text"
                value={marthaGreeting}
                onChange={(e) => setMarthaGreeting(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                Hero Subtext
              </label>
              <input
                type="text"
                value={marthaSubtext}
                onChange={(e) => setMarthaSubtext(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Surprise Note */}
          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> "One More Thing..." Secret Note
            </h4>
            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                Surprise Header
              </label>
              <input
                type="text"
                value={surpriseTitle}
                onChange={(e) => setSurpriseTitle(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                Secret Message Revealed on Click
              </label>
              <textarea
                value={surpriseMessage}
                onChange={(e) => setSurpriseMessage(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm leading-relaxed"
              />
            </div>
          </div>

          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Settings and appearance updated successfully!</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className={`w-full py-3.5 rounded-xl ${themeClasses.accentBg} text-white font-medium text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2`}
          >
            <Save className="w-4 h-4" />
            <span>Save Appearance & Text Changes</span>
          </button>
        </form>
      </div>

      {/* Password Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Martha Password Box */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <KeyRound className="w-5 h-5 text-amber-600" />
            <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
              Change Martha's Password
            </h3>
          </div>
          <p className="text-xs text-stone-500">
            Set the passcode Martha enters to unlock her memory space.
          </p>

          <form onSubmit={handleUpdateMarthaPass} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newMarthaPass}
                onChange={(e) => setNewMarthaPass(e.target.value)}
                placeholder="Enter new password..."
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmMarthaPass}
                onChange={(e) => setConfirmMarthaPass(e.target.value)}
                placeholder="Confirm new password..."
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs"
              />
            </div>

            {marthaPassMsg && (
              <div
                className={`p-2.5 rounded-xl text-xs flex items-center gap-1.5 ${
                  marthaPassMsg.isError
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {marthaPassMsg.isError ? <AlertCircle className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                <span>{marthaPassMsg.text}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs shadow-xs transition"
            >
              Update Martha's Password
            </button>
          </form>
        </div>

        {/* Owner Password Box */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-stone-700 dark:text-stone-300" />
            <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
              Change Owner Password
            </h3>
          </div>
          <p className="text-xs text-stone-500">
            Set your private passcode for accessing this admin management panel.
          </p>

          <form onSubmit={handleUpdateOwnerPass} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                New Owner Password
              </label>
              <input
                type="password"
                value={newOwnerPass}
                onChange={(e) => setNewOwnerPass(e.target.value)}
                placeholder="Enter new admin password..."
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmOwnerPass}
                onChange={(e) => setConfirmOwnerPass(e.target.value)}
                placeholder="Confirm password..."
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs"
              />
            </div>

            {ownerPassMsg && (
              <div
                className={`p-2.5 rounded-xl text-xs flex items-center gap-1.5 ${
                  ownerPassMsg.isError
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {ownerPassMsg.isError ? <AlertCircle className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                <span>{ownerPassMsg.text}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-stone-900 font-medium text-xs shadow-xs transition"
            >
              Update Owner Password
            </button>
          </form>
        </div>
      </div>

      {/* Demo Data & Backup Actions */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-6">
        <div className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-amber-600" />
          <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
            Data Management, Demo Items & Backups
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 space-y-3">
            <h4 className="font-bold text-xs text-stone-800 dark:text-stone-200">
              Clean Space Action
            </h4>
            <p className="text-xs text-stone-500">
              Ensure all demo placeholder items are completely removed from Firestore & browser cache.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={promptClearDemoData}
                className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 text-xs font-medium hover:bg-rose-100 flex items-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" /> Purge Demo Items
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 space-y-3">
            <h4 className="font-bold text-xs text-stone-800 dark:text-stone-200">
              Export Complete Backup JSON
            </h4>
            <p className="text-xs text-stone-500">
              Download a complete offline copy of all photos metadata, songs, memories, and settings.
            </p>
            <button
              type="button"
              onClick={handleExportBackup}
              className="px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-medium flex items-center gap-1.5 shadow-xs transition"
            >
              <Download className="w-3.5 h-3.5" /> Export Backup File (.json)
            </button>
          </div>
        </div>

        {/* Import JSON */}
        <div className="pt-2">
          <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
            Import Backup JSON
          </label>
          <div className="flex gap-2">
            <textarea
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder="Paste previously exported backup JSON here..."
              rows={2}
              className="flex-1 px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-mono"
            />
            <button
              type="button"
              onClick={handleImportBackup}
              disabled={!importJson.trim()}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 self-end shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" /> Import
            </button>
          </div>
          {importStatus && (
            <p className="text-xs text-emerald-600 mt-1.5">{importStatus}</p>
          )}
        </div>
      </div>

      {/* Logout Row */}
      <div className="flex justify-end">
        <button
          onClick={logout}
          className="px-5 py-2.5 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-300 text-xs font-medium flex items-center gap-2 border border-rose-200 dark:border-rose-900 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Log out of Admin Dashboard</span>
        </button>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmAction.isOpen}
        title={confirmAction.title}
        message={confirmAction.message}
        onConfirm={async () => {
          await confirmAction.action();
          setConfirmAction((prev) => ({ ...prev, isOpen: false }));
        }}
        onCancel={() => setConfirmAction((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

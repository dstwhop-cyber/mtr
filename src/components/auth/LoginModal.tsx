import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { Heart, Lock, KeyRound, Sparkles, User, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { loginMartha, loginOwner } = useAuth();
  const { settings, themeClasses } = useSettings();

  // Mode: 'selector' | 'martha' | 'owner'
  const [mode, setMode] = useState<'selector' | 'martha' | 'owner'>('selector');
  const [password, setPassword] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleMarthaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter your secret password');
      return;
    }
    setIsLoading(true);
    setError('');

    const res = await loginMartha(password);
    setIsLoading(false);
    if (!res.success) {
      setError(res.error || 'Incorrect password.');
    }
  };

  const handleOwnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter the owner password');
      return;
    }
    setIsLoading(true);
    setError('');

    const res = await loginOwner(password, ownerEmail);
    setIsLoading(false);
    if (!res.success) {
      setError(res.error || 'Invalid credentials.');
    }
  };

  const resetForm = (newMode: 'selector' | 'martha' | 'owner') => {
    setMode(newMode);
    setPassword('');
    setError('');
    setShowHint(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative z-10">
      <div className="max-w-md w-full">
        {/* Main Frosted Glass Card */}
        <div className="bg-white/60 dark:bg-stone-900/65 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/80 dark:border-white/10 transition-all">
          {/* Header */}
          <div className="text-center space-y-3 mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-rose-400 text-white shadow-lg shadow-amber-500/20 mb-2 border border-white/40">
              <Heart className="w-8 h-8 fill-current animate-pulse" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-stone-900 dark:text-stone-100">
              {settings.siteTitle || 'For Martha ❤️'}
            </h1>
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 font-light leading-relaxed max-w-sm mx-auto">
              {settings.siteSubtitle || 'A little place filled with memories, music, and moments.'}
            </p>
          </div>

          {/* Mode: Selection screen */}
          {mode === 'selector' && (
            <div className="space-y-4">
              {/* Martha Entry Card */}
              <button
                onClick={() => resetForm('martha')}
                className={`w-full group p-4 rounded-2xl border border-white/80 dark:border-white/10 bg-white/60 dark:bg-stone-800/60 backdrop-blur-xl hover:bg-white/80 dark:hover:bg-stone-800/80 hover:shadow-xl transition-all duration-300 flex items-center justify-between text-left`}
              >
                <div className="flex items-center space-x-3.5">
                  <div className={`w-11 h-11 rounded-xl ${themeClasses.accentBg} text-white flex items-center justify-center shadow-md border border-white/20`}>
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition">
                      Enter Your Space
                    </h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      For Martha • Secret memories & songs
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-stone-400 group-hover:translate-x-1 group-hover:text-amber-600 transition" />
              </button>

              {/* Owner Entry Card */}
              <button
                onClick={() => resetForm('owner')}
                className="w-full group p-4 rounded-2xl border border-white/70 dark:border-white/10 bg-white/45 dark:bg-stone-800/40 backdrop-blur-xl hover:bg-white/70 dark:hover:bg-stone-800/70 hover:shadow-md transition-all duration-300 flex items-center justify-between text-left"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-11 h-11 rounded-xl bg-stone-800 text-stone-100 dark:bg-stone-700 flex items-center justify-center shadow-sm border border-white/10">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-serif font-semibold text-stone-900 dark:text-stone-100">
                      Owner Login
                    </h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Manage content, photos, and settings
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-stone-400 group-hover:translate-x-1 transition" />
              </button>
            </div>
          )}

          {/* Mode: Martha Login Form */}
          {mode === 'martha' && (
            <form onSubmit={handleMarthaSubmit} className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Martha's Secret Key
                </span>
                <button
                  type="button"
                  onClick={() => resetForm('selector')}
                  className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 underline"
                >
                  Back
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                  Enter Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your secret passcode..."
                    className="w-full pl-10 pr-4 py-3 bg-white/60 dark:bg-stone-800/60 backdrop-blur-md border border-white/80 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 dark:text-stone-100 shadow-inner"
                    autoFocus
                  />
                  <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-500/10 dark:bg-rose-950/40 border border-rose-300/40 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300 backdrop-blur-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 rounded-xl ${themeClasses.accentBg} text-white font-medium text-sm shadow-md hover:shadow-xl hover:brightness-105 active:scale-[0.99] transition disabled:opacity-50 border border-white/20`}
              >
                {isLoading ? 'Opening Your Space...' : 'Enter Your Space ✨'}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 flex items-center justify-center gap-1 mx-auto"
                >
                  <HelpCircle className="w-3.5 h-3.5" /> Need password hint?
                </button>
                {showHint && (
                  <p className="mt-2 text-xs text-stone-600 dark:text-stone-400 bg-white/60 dark:bg-stone-800/60 backdrop-blur-md p-2.5 rounded-lg border border-white/70">
                    Default demo password is <strong className="font-mono text-amber-600">martha</strong> (or change it in Admin Settings).
                  </p>
                )}
              </div>
            </form>
          )}

          {/* Mode: Owner Login Form */}
          {mode === 'owner' && (
            <form onSubmit={handleOwnerSubmit} className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-stone-800 dark:text-stone-200" /> Owner Login
                </span>
                <button
                  type="button"
                  onClick={() => resetForm('selector')}
                  className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 underline"
                >
                  Back
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                  Admin Email (Optional for Firebase)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    placeholder="admin@formartha.space (optional)"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/60 dark:bg-stone-800/60 backdrop-blur-md border border-white/80 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-600 text-stone-900 dark:text-stone-100 shadow-inner"
                  />
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                  Owner Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter owner admin password..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white/60 dark:bg-stone-800/60 backdrop-blur-md border border-white/80 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-600 text-stone-900 dark:text-stone-100 shadow-inner"
                    autoFocus
                  />
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-500/10 dark:bg-rose-950/40 border border-rose-300/40 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300 backdrop-blur-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-stone-900/90 dark:bg-stone-100 text-white dark:text-stone-900 font-medium text-sm shadow-md hover:shadow-xl hover:bg-stone-800 dark:hover:bg-white active:scale-[0.99] transition disabled:opacity-50 border border-white/10"
              >
                {isLoading ? 'Verifying...' : 'Unlock Admin Dashboard'}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 flex items-center justify-center gap-1 mx-auto"
                >
                  <HelpCircle className="w-3.5 h-3.5" /> Need password hint?
                </button>
                {showHint && (
                  <p className="mt-2 text-xs text-stone-600 dark:text-stone-400 bg-white/60 dark:bg-stone-800/60 backdrop-blur-md p-2.5 rounded-lg border border-white/70">
                    Default demo password is <strong className="font-mono text-stone-800 dark:text-stone-200">admin</strong> (you can change it immediately in settings).
                  </p>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

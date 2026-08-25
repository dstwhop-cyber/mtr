import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import confetti from 'canvas-confetti';
import { Gift, Heart, Sparkles, Mail } from 'lucide-react';

export const SurpriseSection: React.FC = () => {
  const { settings, themeClasses } = useSettings();
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenSurprise = () => {
    if (!isOpen) {
      setIsOpen(true);
      // Trigger a gentle, tasteful confetti burst
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#F59E0B', '#F43F5E', '#FB7185', '#FBBF24', '#DDD6FE'],
          disableForReducedMotion: true,
        });
      } catch (e) {
        console.log('Confetti triggered', e);
      }
    }
  };

  return (
    <section id="surprise" className="py-20 sm:py-28 px-4 max-w-4xl mx-auto border-t border-white/40 dark:border-white/10">
      <div className="text-center max-w-xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-500/10 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-xs font-semibold uppercase tracking-wider mb-3 border border-rose-300/30 backdrop-blur-md">
          <Gift className="w-3.5 h-3.5" />
          <span>A Secret Note</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-3">
          {settings.surpriseTitle || 'One More Thing...'}
        </h2>
        <p className="text-stone-600 dark:text-stone-400 text-sm sm:text-base font-light">
          A small final thought waiting for you here.
        </p>
      </div>

      {/* Interactive Envelope / Secret Note Card */}
      <div className="max-w-lg mx-auto">
        {!isOpen ? (
          <div
            onClick={handleOpenSurprise}
            className="group cursor-pointer bg-white/55 dark:bg-stone-900/60 backdrop-blur-xl rounded-3xl p-8 sm:p-12 text-center shadow-lg hover:shadow-2xl border border-white/80 dark:border-white/10 transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden"
          >
            {/* Soft decorative background glow */}
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-rose-300/40 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-amber-300/40 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="w-20 h-20 rounded-full bg-white/80 dark:bg-stone-800/80 backdrop-blur-md text-rose-500 shadow-md flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 border border-white/80 dark:border-stone-700">
                <Mail className="w-10 h-10 animate-pulse" />
              </div>

              <div>
                <h3 className="font-serif font-bold text-xl sm:text-2xl text-stone-900 dark:text-stone-100 mb-1">
                  You Have a Note
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                  Tap to unseal and read the message
                </p>
              </div>

              <button
                type="button"
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full ${themeClasses.accentBg} text-white text-xs sm:text-sm font-medium shadow-md group-hover:shadow-lg transition-all border border-white/20`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Open Secret Note</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white/70 dark:bg-stone-900/70 backdrop-blur-2xl rounded-3xl p-8 sm:p-12 shadow-2xl border border-white/90 dark:border-white/10 animate-in zoom-in-95 duration-500 relative">
            <div className="flex justify-center -mt-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center shadow-xs border border-rose-300/30 backdrop-blur-md">
                <Heart className="w-6 h-6 fill-current animate-pulse" />
              </div>
            </div>

            <div className="text-center space-y-4">
              <p className="font-serif text-lg sm:text-xl text-stone-800 dark:text-stone-100 leading-relaxed italic whitespace-pre-line">
                “{settings.surpriseMessage || 'You make ordinary moments feel a little more special. I hope this little website makes you smile.'}”
              </p>

              <div className="pt-6 border-t border-stone-200/50 dark:border-white/5 flex items-center justify-center gap-2 text-xs text-stone-400">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Always here whenever you need a smile</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

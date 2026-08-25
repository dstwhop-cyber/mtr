import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { MusicProvider } from './context/MusicContext';
import { BackgroundParticles } from './components/common/BackgroundParticles';
import { LoginModal } from './components/auth/LoginModal';
import { MarthaView } from './components/martha/MarthaView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Heart, Sparkles, Shield, ArrowLeft } from 'lucide-react';

const MainContent: React.FC = () => {
  const { authState, isOwner, isMartha, logout } = useAuth();
  const { themeClasses } = useSettings();

  // For owner convenience: ability to toggle between Admin CMS and Martha Preview
  const [ownerPreviewMode, setOwnerPreviewMode] = useState(false);

  // If Guest (not authenticated): Show Landing Login View
  if (!authState.isAuthenticated || authState.role === 'guest') {
    return <LoginModal />;
  }

  // If Martha: Show Martha's Personalized Space
  if (isMartha) {
    return <MarthaView />;
  }

  // If Owner: Show Admin Dashboard (or live Martha preview with quick return button)
  if (isOwner) {
    if (ownerPreviewMode) {
      return (
        <div className="relative">
          {/* Top floating bar to return to Admin */}
          <div className="fixed top-4 right-4 z-50 animate-bounce">
            <button
              onClick={() => setOwnerPreviewMode(false)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-stone-900 text-white text-xs font-semibold shadow-2xl hover:bg-stone-800 border-2 border-amber-400"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Admin Dashboard</span>
            </button>
          </div>
          <MarthaView />
        </div>
      );
    }

    return (
      <AdminDashboard onPreviewMartha={() => setOwnerPreviewMode(true)} />
    );
  }

  return <LoginModal />;
};

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <MusicProvider>
          <div className="min-h-screen relative font-sans text-stone-900 dark:text-stone-100 selection:bg-amber-200 selection:text-amber-900">
            {/* Ambient Background Canvas Animations */}
            <BackgroundParticles />

            {/* Main Application Router & Views */}
            <MainContent />
          </div>
        </MusicProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}

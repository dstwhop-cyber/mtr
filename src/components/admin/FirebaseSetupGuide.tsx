import React, { useState } from 'react';
import { Cloud, Copy, Check, ShieldCheck, Database, Key, HelpCircle, ExternalLink } from 'lucide-react';
import { getFirebaseInstances } from '../../lib/firebase';

export const FirebaseSetupGuide: React.FC = () => {
  const { isConfigured } = getFirebaseInstances();
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 3000);
  };

  const envExample = `# Firebase Credentials for "For Martha"
VITE_FIREBASE_API_KEY="AIzaSyDzGEZjuzsj_SayV4FYVQoMP6FTqaRtUxg"
VITE_FIREBASE_AUTH_DOMAIN="pv-site-d4ccd.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="pv-site-d4ccd"
VITE_FIREBASE_STORAGE_BUCKET="pv-site-d4ccd.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="623823468577"
VITE_FIREBASE_APP_ID="1:623823468577:web:00d17ea0352e8ed5124b60"
VITE_FIREBASE_MEASUREMENT_ID="G-ZK1EX62H0L"`;

  const firestoreRulesExample = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Martha (and guests) can view memories, photos, songs
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}`;

  const storageRulesExample = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}`;

  return (
    <div className="bg-white/60 dark:bg-stone-900/60 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/80 dark:border-white/10 shadow-sm space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center border border-emerald-300/30">
          <Cloud className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-serif font-bold text-xl text-stone-900 dark:text-stone-100">
            Firebase Cloud Integration Guide
          </h3>
          <p className="text-xs text-stone-500">
            Current Status:{' '}
            <span
              className={`font-semibold ${
                isConfigured ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              {isConfigured
                ? 'Connected to Firebase Project (pv-site-d4ccd)'
                : 'Local Mode (IndexedDB active & persistent)'}
            </span>
          </p>
        </div>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-stone-700 dark:text-stone-300">
        {/* Step 1 */}
        <div className="p-4 rounded-2xl bg-white/60 dark:bg-stone-800/60 border border-white/80 dark:border-stone-700 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                ✓
              </span>
              Connected Firebase Project: <span className="font-mono text-emerald-600">pv-site-d4ccd</span>
            </span>
            <a
              href="https://console.firebase.google.com/project/pv-site-d4ccd/overview"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-sky-600 hover:underline flex items-center gap-1 font-semibold"
            >
              Open Firebase Console <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <p className="text-stone-600 dark:text-stone-400">
            Your Firebase web credentials have been connected to this applet. Ensure the following services are enabled in your console:
          </p>
          <ul className="list-disc list-inside space-y-1 text-stone-600 dark:text-stone-400 pl-2">
            <li><strong>Cloud Firestore</strong> (Production database for memories, metadata, and settings)</li>
            <li><strong>Firebase Storage</strong> (Default storage bucket for photos, videos, and music)</li>
            <li><strong>Firebase Authentication</strong> (Email/Password provider enabled)</li>
          </ul>
        </div>

        {/* Step 2 */}
        <div className="p-4 rounded-2xl bg-white/60 dark:bg-stone-800/60 border border-white/80 dark:border-stone-700 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-stone-800 text-white flex items-center justify-center text-[10px]">
                2
              </span>
              Active Configuration
            </span>
            <button
              onClick={() => copyToClipboard(envExample, 'env')}
              className="px-2.5 py-1 bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 rounded-lg text-xs font-mono flex items-center gap-1"
            >
              {copiedSection === 'env' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'env' ? 'Copied' : 'Copy .env'}</span>
            </button>
          </div>
          <pre className="p-3 bg-stone-900 text-amber-300 rounded-xl font-mono text-[11px] overflow-x-auto">
            {envExample}
          </pre>
        </div>

        {/* Step 3 */}
        <div className="p-4 rounded-2xl bg-white/60 dark:bg-stone-800/60 border border-white/80 dark:border-stone-700 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-stone-800 text-white flex items-center justify-center text-[10px]">
                3
              </span>
              Security Rules (Firestore & Storage)
            </span>
            <button
              onClick={() => copyToClipboard(firestoreRulesExample, 'rules')}
              className="px-2.5 py-1 bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 rounded-lg text-xs font-mono flex items-center gap-1"
            >
              {copiedSection === 'rules' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'rules' ? 'Copied' : 'Copy Rules'}</span>
            </button>
          </div>
          <p className="text-stone-600 dark:text-stone-400">
            Publish these rules in your Firebase Console under Firestore Rules & Storage Rules:
          </p>
          <pre className="p-3 bg-stone-900 text-emerald-300 rounded-xl font-mono text-[11px] overflow-x-auto">
            {firestoreRulesExample}
          </pre>
        </div>
      </div>
    </div>
  );
};

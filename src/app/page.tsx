'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    } else if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Always show splash screen while loading or redirecting
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 to-pink-500">
      <div className="text-center">
        {/* App Logo/Icon */}
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto bg-white rounded-3xl shadow-2xl flex items-center justify-center">
            <span className="text-5xl">💰</span>
          </div>
        </div>
        
        {/* App Name */}
        <h1 className="text-4xl font-bold text-white mb-2">Stephly</h1>
        <p className="text-white/80 mb-8">Your Budget Buddy 💸</p>
        
        {/* Loading Indicator */}
        {loading && (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-3"></div>
            <p className="text-white/90 text-sm">Loading your data...</p>
          </div>
        )}
      </div>
    </div>
  );
}

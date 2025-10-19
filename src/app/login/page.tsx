'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AuthForm } from '@/components/AuthForm';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // Redirect if already logged in - using useEffect to avoid render error
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Show nothing while redirecting
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center mb-8">
          {/* Brand Name */}
          <h1 className="text-6xl font-bold text-white mb-3 tracking-tight" style={{
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontWeight: 700,
            textShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}>
            Stephly
          </h1>
          
          {/* Tagline */}
          <p className="text-xl text-white/95 font-semibold mb-1">
            Smart Budget Tracking
          </p>
          <p className="text-sm text-white/80">
            Take control of your finances, one step at a time
          </p>
        </div>
        
        <AuthForm isSignUp={isSignUp} onToggleMode={() => setIsSignUp(!isSignUp)} />
      </div>
    </div>
  );
}

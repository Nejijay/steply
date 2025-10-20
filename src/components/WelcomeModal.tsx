'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Wallet, 
  TrendingUp, 
  Calendar, 
  Brain, 
  X,
  Share2,
  Plus,
  ChevronRight
} from 'lucide-react';
import { useThemeColor, themeColors } from '@/contexts/ThemeColorContext';

interface WelcomeModalProps {
  userName?: string;
}

export const WelcomeModal = ({ userName }: WelcomeModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { themeColor } = useThemeColor();

  useEffect(() => {
    // Check if user has seen welcome screen
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    setIsOpen(false);
  };

  const features = [
    {
      icon: Wallet,
      title: 'Smart Budget Tracking',
      description: 'Track income, expenses, and manage your money effortlessly with beautiful dashboards.'
    },
    {
      icon: Brain,
      title: 'AI Assistant - Stephly',
      description: 'Chat naturally with Stephly to add transactions, create budgets, and get financial insights!'
    },
    {
      icon: Calendar,
      title: 'Plan Ahead',
      description: 'Create TODOs for upcoming expenses. They automatically convert to transactions when paid!'
    },
    {
      icon: TrendingUp,
      title: 'Analytics & Insights',
      description: 'Beautiful charts, spending patterns, and budget tracking to help you save more.'
    }
  ];

  const steps = [
    // Welcome & Features
    {
      title: `Welcome${userName ? `, ${userName}` : ''}! 👋`,
      content: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${themeColors[themeColor].primary} mb-4`}>
              <Sparkles className="text-white" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to Stephly!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Your smart AI-powered budget tracker
            </p>
          </div>

          <div className="space-y-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-lg ${themeColors[themeColor].light} flex items-center justify-center`}>
                    <Icon className={themeColors[themeColor].text} size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )
    },
    // PWA Installation
    {
      title: '📱 Add to Home Screen',
      content: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 mb-4">
              <Plus className="text-white" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Install Stephly
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Add Stephly to your home screen for quick access!
            </p>
          </div>

          {/* iOS/Safari Instructions */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <span>🍎</span> For iPhone/iPad (Safari)
            </h3>
            <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="font-bold min-w-[20px]">1.</span>
                <span>Tap the <Share2 size={16} className="inline mx-1" /> <strong>Share</strong> button at the bottom</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold min-w-[20px]">2.</span>
                <span>Scroll down and tap <Plus size={16} className="inline mx-1" /> <strong>"Add to Home Screen"</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold min-w-[20px]">3.</span>
                <span>Tap <strong>"Add"</strong> in the top right</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold min-w-[20px]">4.</span>
                <span>✨ Stephly will appear on your home screen!</span>
              </li>
            </ol>
          </div>

          {/* Android/Chrome Instructions */}
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <span>🤖</span> For Android (Chrome)
            </h3>
            <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="font-bold min-w-[20px]">1.</span>
                <span>Tap the <strong>⋮</strong> menu button (top right)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold min-w-[20px]">2.</span>
                <span>Tap <Plus size={16} className="inline mx-1" /> <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold min-w-[20px]">3.</span>
                <span>Tap <strong>"Add"</strong> or <strong>"Install"</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold min-w-[20px]">4.</span>
                <span>🎉 Open Stephly directly from your home screen!</span>
              </li>
            </ol>
          </div>

          <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
            💡 Installing makes Stephly feel like a native app - faster and always accessible!
          </div>
        </div>
      )
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 pb-24">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl relative z-[10000]">
        {/* Header */}
        <div className={`bg-gradient-to-r ${themeColors[themeColor].primary} p-6 relative`}>
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-all z-[10001] active:scale-95"
            aria-label="Close welcome modal"
          >
            <X size={24} />
          </button>
          <div className="text-center text-white">
            <h1 className="text-3xl font-bold mb-2">Stephly</h1>
            <p className="text-white/90">Smart Budget Tracking Made Easy</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {steps[currentStep].content}
        </div>

        {/* Footer Navigation */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === currentStep
                      ? `w-8 ${themeColors[themeColor].bg}`
                      : 'w-2 bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Back
                </Button>
              )}
              
              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className={`bg-gradient-to-r ${themeColors[themeColor].primary} text-white hover:opacity-90`}
                >
                  Next
                  <ChevronRight size={20} className="ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleClose}
                  className={`bg-gradient-to-r ${themeColors[themeColor].primary} text-white hover:opacity-90`}
                >
                  Get Started! 🚀
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

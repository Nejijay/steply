'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Bell, Shield, Palette, Globe, Check } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { Calculator } from '@/components/Calculator';
import { CurrencyConverter } from '@/components/CurrencyConverter';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useThemeColor, ThemeColor, themeColors } from '@/contexts/ThemeColorContext';

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { themeColor, setThemeColor } = useThemeColor();
  const [showCalculator, setShowCalculator] = useState(false);
  const [showConverter, setShowConverter] = useState(false);

  const colorOptions: { name: string; value: ThemeColor; colors: string }[] = [
    { name: 'Purple', value: 'purple', colors: 'from-purple-500 to-pink-600' },
    { name: 'Blue', value: 'blue', colors: 'from-blue-500 to-cyan-600' },
    { name: 'Green', value: 'green', colors: 'from-green-500 to-emerald-600' },
    { name: 'Pink', value: 'pink', colors: 'from-pink-500 to-rose-600' },
    { name: 'Orange', value: 'orange', colors: 'from-orange-500 to-amber-600' },
    { name: 'Red', value: 'red', colors: 'from-red-500 to-pink-600' },
    { name: 'Black', value: 'black', colors: 'from-gray-900 to-gray-700' },
  ];

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 mb-6 shadow-sm">
          <Button 
            variant="ghost" 
            className="mb-3 -ml-2"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mt-1">Manage your account and preferences</p>
        </div>

        <div className="px-4 sm:px-6">

        {/* Account Section */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <User size={20} className="text-gray-900 dark:text-white" />
              Account
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">Manage your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Email</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{user.email}</p>
              </div>
            </div>
            <div className="flex justify-between items-center py-2">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Display Name</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{user.displayName || 'Not set'}</p>
              </div>
              <Button variant="outline" size="sm" className="text-gray-900 dark:text-white">Edit</Button>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Section */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Palette size={20} className="text-gray-900 dark:text-white" />
              Appearance
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">Customize how Stephly looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme Mode */}
            <div className="flex justify-between items-center py-2">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Theme Mode</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Choose light or dark mode</p>
              </div>
              <ThemeToggle />
            </div>

            {/* Theme Color */}
            <div className="border-t pt-6">
              <div className="mb-4">
                <p className="font-medium text-gray-900 dark:text-white mb-1">Theme Color</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Choose your favorite color theme</p>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {colorOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setThemeColor(option.value)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                      themeColor === option.value 
                        ? `${themeColors[themeColor].light} border-gray-400 dark:border-gray-600`
                        : 'border-transparent hover:border-gray-300 dark:hover:border-gray-700'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${option.colors} flex items-center justify-center shadow-lg`}>
                      {themeColor === option.value && (
                        <Check size={24} className="text-white drop-shadow-lg" strokeWidth={3} />
                      )}
                    </div>
                    <span className="text-xs font-medium text-gray-900 dark:text-white">{option.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Bell size={20} className="text-gray-900 dark:text-white" />
              Notifications
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">Manage your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Budget Alerts</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Get notified when you exceed budgets</p>
              </div>
              <Button variant="outline" size="sm" className="text-gray-900 dark:text-white">Coming Soon</Button>
            </div>
            <div className="flex justify-between items-center py-2">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">AI Insights</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Receive smart financial tips</p>
              </div>
              <Button variant="outline" size="sm" className="text-gray-900 dark:text-white">Coming Soon</Button>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Shield size={20} className="text-gray-900 dark:text-white" />
              Privacy & Security
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">Manage your data and security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Change Password</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Update your password</p>
              </div>
              <Button variant="outline" size="sm" className="text-gray-900 dark:text-white">Coming Soon</Button>
            </div>
            <div className="flex justify-between items-center py-2">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Data Export</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Download your financial data</p>
              </div>
              <Button variant="outline" size="sm" className="text-gray-900 dark:text-white">Coming Soon</Button>
            </div>
          </CardContent>
        </Card>

        {/* Language & Region */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Globe size={20} className="text-gray-900 dark:text-white" />
              Language & Region
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">Set your language and currency</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Currency</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Ghana Cedis (GHS)</p>
              </div>
              <Button variant="outline" size="sm" className="text-gray-900 dark:text-white">Change</Button>
            </div>
          </CardContent>
        </Card>
        
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav 
        onCalculatorOpen={() => setShowCalculator(true)}
        onConverterOpen={() => setShowConverter(true)}
      />

      {/* Calculator Modal */}
      {showCalculator && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Calculator onClose={() => setShowCalculator(false)} />
        </div>
      )}

      {/* Currency Converter Modal */}
      {showConverter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <CurrencyConverter onClose={() => setShowConverter(false)} />
        </div>
      )}
    </div>
  );
}

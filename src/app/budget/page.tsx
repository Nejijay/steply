'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { BudgetSetup } from '@/components/BudgetSetup';
import { BottomNav } from '@/components/BottomNav';
import { Calculator } from '@/components/Calculator';
import { CurrencyConverter } from '@/components/CurrencyConverter';
import { useThemeColor, themeColors } from '@/contexts/ThemeColorContext';

export default function BudgetPage() {
  const router = useRouter();
  const { themeColor } = useThemeColor();
  const [showCalculator, setShowCalculator] = useState(false);
  const [showConverter, setShowConverter] = useState(false);

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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Budget Management</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mt-1">Set and track your monthly spending limits</p>
        </div>

        <div className="px-4 sm:px-6">

        {/* Budget Setup */}
        <BudgetSetup />

        {/* Tips */}
        <Card className="mt-4 sm:mt-6 touch-manipulation">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl text-gray-900 dark:text-white">Budget Tips</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">Make the most of your budget tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 ${themeColors[themeColor].bg} rounded-full mt-2 flex-shrink-0`}></div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Set realistic limits based on your past spending patterns
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 ${themeColors[themeColor].bg} rounded-full mt-2 flex-shrink-0`}></div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Review your budget regularly and adjust as needed
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 ${themeColors[themeColor].bg} rounded-full mt-2 flex-shrink-0`}></div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Use the progress bars to stay motivated and on track
                </p>
              </div>
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

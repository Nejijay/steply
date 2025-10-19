'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { BudgetSetup } from '@/components/BudgetSetup';

export default function BudgetPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-2 sm:p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" className="mb-4 p-2">
            <ArrowLeft size={20} className="mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Budget Management</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Set and track your monthly spending limits</p>
        </div>

        {/* Budget Setup */}
        <BudgetSetup />

        {/* Tips */}
        <Card className="mt-4 sm:mt-6 touch-manipulation">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Budget Tips</CardTitle>
            <CardDescription>Make the most of your budget tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm">
                  Set realistic limits based on your past spending patterns
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm">
                  Review your budget regularly and adjust as needed
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm">
                  Use the progress bars to stay motivated and on track
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

'use client';

import { Card } from '@/components/ui/card';
import { Eye, EyeOff, TrendingUp, TrendingDown } from 'lucide-react';
import { useState } from 'react';
import { formatCurrency } from '@/lib/currency';

interface WalletCardProps {
  balance: number;
  income: number;
  expenses: number;
  loading?: boolean;
}

export const WalletCard = ({ balance, income, expenses, loading }: WalletCardProps) => {
  const [showBalance, setShowBalance] = useState(true);

  return (
    <Card className="relative overflow-hidden border-0 shadow-xl">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800" />
      
      {/* Decorative Circles */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
      
      {/* Content */}
      <div className="relative p-6 text-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-white/80 text-sm font-medium">Total Balance</p>
            <p className="text-xs text-white/60 mt-1">Ghana Cedis (GHS)</p>
          </div>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {showBalance ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        </div>

        {/* Balance */}
        <div className="mb-8">
          <div className="text-4xl sm:text-5xl font-bold tracking-tight">
            {loading ? (
              <div className="h-12 w-48 bg-white/20 rounded-lg animate-pulse" />
            ) : showBalance ? (
              formatCurrency(balance)
            ) : (
              '₵ ••••••'
            )}
          </div>
          <p className="text-white/70 text-sm mt-2">
            {balance >= 0 ? 'Available balance' : 'Negative balance'}
          </p>
        </div>

        {/* Income & Expenses */}
        <div className="grid grid-cols-2 gap-4">
          {/* Income */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-green-400/20 rounded-lg">
                <TrendingUp size={16} className="text-green-300" />
              </div>
              <span className="text-white/80 text-xs font-medium">Income</span>
            </div>
            <div className="text-xl font-bold">
              {loading ? (
                <div className="h-6 w-20 bg-white/20 rounded animate-pulse" />
              ) : showBalance ? (
                formatCurrency(income)
              ) : (
                '₵ •••'
              )}
            </div>
          </div>

          {/* Expenses */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-red-400/20 rounded-lg">
                <TrendingDown size={16} className="text-red-300" />
              </div>
              <span className="text-white/80 text-xs font-medium">Expenses</span>
            </div>
            <div className="text-xl font-bold">
              {loading ? (
                <div className="h-6 w-20 bg-white/20 rounded animate-pulse" />
              ) : showBalance ? (
                formatCurrency(expenses)
              ) : (
                '₵ •••'
              )}
            </div>
          </div>
        </div>

        {/* Card Chip Decoration */}
        <div className="absolute top-6 right-6 w-12 h-10 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-md opacity-80" 
             style={{ 
               background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffd700 100%)',
               boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)'
             }}>
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-yellow-600/30 rounded-full" />
          </div>
        </div>
      </div>
    </Card>
  );
};

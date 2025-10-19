'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, TrendingUp, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { analyzeBudgetAffordability, BudgetAnalysis } from '@/lib/budget-analyzer';
import { Budget, Transaction } from '@/lib/types';

interface SmartBudgetFormProps {
  currentBalance: number;
  monthlyIncome: number;
  existingBudgets: Budget[];
  recentTransactions: Transaction[];
  onSubmit: (data: { category: string; amount: number; month: number; year: number }) => void;
  onCancel: () => void;
}

const CATEGORIES = [
  'Housing',
  'Food & Groceries',
  'Transportation',
  'Utilities',
  'Healthcare',
  'Entertainment',
  'Shopping',
  'Education',
  'Savings',
  'Other',
];

export const SmartBudgetForm = ({
  currentBalance,
  monthlyIncome,
  existingBudgets,
  recentTransactions,
  onSubmit,
  onCancel,
}: SmartBudgetFormProps) => {
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [analysis, setAnalysis] = useState<BudgetAnalysis | null>(null);

  const currentDate = new Date();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  // Analyze budget whenever amount changes
  useEffect(() => {
    const budgetAmount = parseFloat(amount);
    if (budgetAmount > 0) {
      const result = analyzeBudgetAffordability(
        budgetAmount,
        currentBalance,
        monthlyIncome,
        existingBudgets,
        recentTransactions
      );
      setAnalysis(result);
    } else {
      setAnalysis(null);
    }
  }, [amount, currentBalance, monthlyIncome, existingBudgets, recentTransactions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !amount || !analysis?.canAfford) return;

    onSubmit({
      category,
      amount: parseFloat(amount),
      month,
      year,
    });
  };

  const useSuggestedAmount = () => {
    if (analysis?.suggestedAmount) {
      setAmount(analysis.suggestedAmount.toFixed(2));
    }
  };

  const totalExistingBudgets = existingBudgets.reduce((sum, b) => sum + b.limit, 0);
  const remainingBalance = currentBalance - totalExistingBudgets;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="text-purple-600" />
          Create Smart Budget
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Wallet Overview */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="text-purple-600 dark:text-purple-400" size={20} />
            <span className="font-semibold text-gray-900 dark:text-gray-100">Your Wallet</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Available Balance</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatCurrency(currentBalance)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">After Existing Budgets</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(remainingBalance)}
              </p>
            </div>
          </div>
          {totalExistingBudgets > 0 && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              You have {formatCurrency(totalExistingBudgets)} allocated to {existingBudgets.length} budget(s)
            </p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">Budget Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium mb-2">Budget Amount (GHS)</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              required
            />
          </div>

          {/* AI Analysis */}
          {analysis && (
            <div className="space-y-3">
              <Alert
                className={
                  analysis.severity === 'safe'
                    ? 'border-green-500 bg-green-50 dark:bg-green-950'
                    : analysis.severity === 'warning'
                    ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'
                    : 'border-red-500 bg-red-50 dark:bg-red-950'
                }
              >
                <div className="flex items-start gap-2">
                  {analysis.severity === 'safe' ? (
                    <CheckCircle className="text-green-600" size={20} />
                  ) : (
                    <AlertCircle
                      className={analysis.severity === 'warning' ? 'text-yellow-600' : 'text-red-600'}
                      size={20}
                    />
                  )}
                  <div className="flex-1">
                    <AlertDescription>
                      <p className="font-semibold mb-1">{analysis.recommendation}</p>
                      <p className="text-sm mb-2">{analysis.reasoning}</p>
                      
                      {analysis.severity !== 'safe' && analysis.suggestedAmount > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium mb-1">Suggested amount:</p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={useSuggestedAmount}
                            className="text-xs"
                          >
                            Use {formatCurrency(analysis.suggestedAmount)}
                          </Button>
                        </div>
                      )}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>

              {/* Tips */}
              {analysis.tips.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    💡 Smart Tips:
                  </p>
                  <ul className="space-y-1">
                    {analysis.tips.map((tip, index) => (
                      <li key={index} className="text-sm text-blue-800 dark:text-blue-200">
                        • {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={!analysis?.canAfford || !category || !amount}
            >
              Create Budget
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

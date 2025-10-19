'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { calculateFinancialHealth } from '@/lib/budget-analyzer';
import { Budget, Transaction } from '@/lib/types';

interface FinancialHealthCardProps {
  balance: number;
  income: number;
  expenses: number;
  budgets: Budget[];
  transactions: Transaction[];
}

export const FinancialHealthCard = ({
  balance,
  income,
  expenses,
  budgets,
  transactions,
}: FinancialHealthCardProps) => {
  const health = calculateFinancialHealth(balance, income, expenses, budgets, transactions);

  const getStatusColor = () => {
    switch (health.status) {
      case 'excellent':
        return 'text-green-600 dark:text-green-400';
      case 'good':
        return 'text-blue-600 dark:text-blue-400';
      case 'fair':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'poor':
        return 'text-orange-600 dark:text-orange-400';
      case 'critical':
        return 'text-red-600 dark:text-red-400';
    }
  };

  const getStatusIcon = () => {
    if (health.status === 'excellent' || health.status === 'good') {
      return <CheckCircle className={getStatusColor()} size={24} />;
    } else if (health.status === 'fair') {
      return <Activity className={getStatusColor()} size={24} />;
    } else {
      return <AlertTriangle className={getStatusColor()} size={24} />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="text-purple-600" />
          Financial Health
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Health Score */}
        <div className="text-center py-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            {getStatusIcon()}
            <div>
              <div className="text-4xl font-bold">{health.score}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">out of 100</div>
            </div>
          </div>
          <div className={`text-lg font-semibold ${getStatusColor()} capitalize`}>
            {health.status}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              health.score >= 80
                ? 'bg-green-500'
                : health.score >= 60
                ? 'bg-blue-500'
                : health.score >= 40
                ? 'bg-yellow-500'
                : health.score >= 20
                ? 'bg-orange-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${health.score}%` }}
          />
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Savings Rate</p>
            <p className="text-xl font-bold">{health.savingsRate.toFixed(1)}%</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Expense Ratio</p>
            <p className="text-xl font-bold">{health.expenseRatio.toFixed(1)}%</p>
          </div>
        </div>

        {/* Warnings */}
        {health.warnings.length > 0 && (
          <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
            <AlertDescription>
              <div className="space-y-1">
                {health.warnings.map((warning, index) => (
                  <p key={index} className="text-sm text-yellow-800 dark:text-yellow-200">
                    {warning}
                  </p>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Recommendations */}
        {health.recommendations.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
              📊 Recommendations:
            </p>
            <ul className="space-y-1">
              {health.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-blue-800 dark:text-blue-200">
                  • {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

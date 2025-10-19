'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, Brain, TrendingUp, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { getFinancialAdvice, AIFinancialAdvice } from '@/lib/gemini-ai';
import { Transaction, Budget } from '@/lib/types';

interface AIAdvisorProps {
  balance: number;
  income: number;
  expenses: number;
  transactions: Transaction[];
  budgets: Budget[];
}

export const AIAdvisor = ({ balance, income, expenses, transactions, budgets }: AIAdvisorProps) => {
  const [advice, setAdvice] = useState<AIFinancialAdvice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getAdvice = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await getFinancialAdvice(balance, income, expenses, transactions, budgets);
      setAdvice(result);
    } catch (err) {
      setError('Failed to get AI advice. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800';
      case 'high':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low':
        return <CheckCircle size={20} />;
      case 'medium':
        return <AlertTriangle size={20} />;
      case 'high':
        return <AlertTriangle size={20} />;
      default:
        return <Brain size={20} />;
    }
  };

  return (
    <Card className="border-2 border-purple-200 dark:border-purple-800">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-white" />
            <CardTitle className="text-lg font-bold text-white">AI Financial Advisor</CardTitle>
          </div>
          <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full ml-auto">
            Powered by Gemini
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!advice && !loading && (
          <div className="text-center py-8">
            <div className="mb-4">
              <Brain className="mx-auto text-purple-500" size={48} />
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Get personalized financial advice powered by AI
            </p>
            <Button onClick={getAdvice} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Sparkles size={16} className="mr-2" />
              Get AI Advice
            </Button>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <Loader2 className="mx-auto animate-spin text-purple-500 mb-4" size={48} />
            <p className="text-gray-600 dark:text-gray-400">
              Analyzing your finances...
            </p>
          </div>
        )}

        {error && (
          <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
            <AlertDescription className="text-red-800 dark:text-red-200">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {advice && (
          <div className="space-y-4">
            {/* Risk Level */}
            <div className={`flex items-center gap-2 p-3 rounded-lg border ${getRiskColor(advice.riskLevel)}`}>
              {getRiskIcon(advice.riskLevel)}
              <div>
                <p className="text-sm font-semibold">Risk Level: {advice.riskLevel.toUpperCase()}</p>
              </div>
            </div>

            {/* Overall Advice */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <div className="flex items-start gap-2">
                <Brain className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="font-semibold text-purple-900 dark:text-purple-100 mb-2">AI Assessment</p>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {advice.advice}
                  </p>
                </div>
              </div>
            </div>

            {/* Insights */}
            {advice.insights.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <TrendingUp size={16} className="text-blue-600" />
                  Key Insights
                </h4>
                <ul className="space-y-2">
                  {advice.insights.map((insight, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-blue-600 dark:text-blue-400 flex-shrink-0">💡</span>
                      <span className="text-gray-700 dark:text-gray-300">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Items */}
            {advice.actionItems.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600" />
                  Action Items
                </h4>
                <ul className="space-y-2">
                  {advice.actionItems.map((action, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-green-600 dark:text-green-400 flex-shrink-0">✓</span>
                      <span className="text-gray-700 dark:text-gray-300">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Refresh Button */}
            <Button
              onClick={getAdvice}
              variant="outline"
              className="w-full"
              disabled={loading}
            >
              <Sparkles size={16} className="mr-2" />
              Get Fresh Advice
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

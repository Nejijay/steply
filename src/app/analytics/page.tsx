'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { BottomNav } from '@/components/BottomNav';
import { Calculator } from '@/components/Calculator';
import { CurrencyConverter } from '@/components/CurrencyConverter';
import { FinancialHealthCard } from '@/components/FinancialHealthCard';
import { getTransactions, getBudgets } from '@/lib/firebase-service';
import { Transaction, Budget } from '@/lib/types';
import { formatCurrency } from '@/lib/currency';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AnalyticsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [showCalculator, setShowCalculator] = useState(false);
  const [showConverter, setShowConverter] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<(Budget & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    savingsRate: 0,
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [transactionsData, budgetsData] = await Promise.all([
        getTransactions(user.uid),
        getBudgets(user.uid, new Date().getMonth() + 1, new Date().getFullYear()),
      ]);

      setTransactions(transactionsData);
      setBudgets(budgetsData);

      const income = transactionsData.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expenses = transactionsData.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      
      setStats({
        totalIncome: income,
        totalExpenses: expenses,
        savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate spending by category from real data
  const spendingData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const existing = acc.find(item => item.category === t.category);
      if (existing) {
        existing.amount += t.amount;
      } else {
        acc.push({ category: t.category, amount: t.amount, percentage: 0 });
      }
      return acc;
    }, [] as { category: string; amount: number; percentage: number }[])
    .map(item => ({
      ...item,
      percentage: stats.totalExpenses > 0 ? (item.amount / stats.totalExpenses) * 100 : 0,
    }));

  // Calculate monthly trends from real data
  const monthlyData = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    const existing = acc.find(item => item.month === monthYear);
    if (existing) {
      if (transaction.type === 'income') {
        existing.income += transaction.amount;
      } else {
        existing.expenses += transaction.amount;
      }
    } else {
      acc.push({
        month: monthYear,
        income: transaction.type === 'income' ? transaction.amount : 0,
        expenses: transaction.type === 'expense' ? transaction.amount : 0,
      });
    }
    return acc;
  }, [] as { month: string; income: number; expenses: number }[])
  .sort((a, b) => {
    // Sort by date
    const dateA = new Date(a.month);
    const dateB = new Date(b.month);
    return dateA.getTime() - dateB.getTime();
  })
  .slice(-6); // Get last 6 months

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <div className="max-w-7xl mx-auto">
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Analytics & Reports</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mt-1">Insights into your spending patterns</p>
        </div>

        <div className="px-4 sm:px-6">

        {/* Period Selector */}
        <div className="mb-4 sm:mb-6">
          <div className="flex gap-2 justify-center sm:justify-start">
            <Button
              variant={selectedPeriod === '3months' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod('3months')}
              className="flex-1 sm:flex-none"
            >
              3 Months
            </Button>
            <Button
              variant={selectedPeriod === '6months' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod('6months')}
              className="flex-1 sm:flex-none"
            >
              6 Months
            </Button>
            <Button
              variant={selectedPeriod === '1year' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod('1year')}
              className="flex-1 sm:flex-none"
            >
              1 Year
            </Button>
          </div>
        </div>

        {/* Financial Health Card */}
        <div className="mb-6">
          <FinancialHealthCard
            balance={stats.totalIncome - stats.totalExpenses}
            income={stats.totalIncome}
            expenses={stats.totalExpenses}
            budgets={budgets}
            transactions={transactions}
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <Card className="touch-manipulation">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Total Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats.totalIncome)}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                All time earnings
              </p>
            </CardContent>
          </Card>

          <Card className="touch-manipulation">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats.totalExpenses)}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                All time spending
              </p>
            </CardContent>
          </Card>

          <Card className="touch-manipulation sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Savings Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {stats.savingsRate.toFixed(1)}%
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {stats.savingsRate > 20 ? 'Excellent savings!' : 'Keep saving!'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-6">
          {/* Spending Breakdown */}
          <Card className="touch-manipulation">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl text-gray-900 dark:text-white">Spending by Category</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">Where your money goes</CardDescription>
            </CardHeader>
            <CardContent>
              {spendingData.length > 0 ? (
                <div className="h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={spendingData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry: any) => `${entry.category} (${entry.percentage.toFixed(1)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="amount"
                      >
                        {spendingData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  No spending data yet. Start tracking your expenses!
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Trends */}
          <Card className="touch-manipulation">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Monthly Trends</CardTitle>
              <CardDescription>Income vs expenses over time</CardDescription>
            </CardHeader>
            <CardContent>
              {monthlyData.length > 0 ? (
                <div className="h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `$${value}`} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                      <Bar dataKey="income" fill="#22c55e" name="Income" />
                      <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  No transaction data yet. Start tracking to see monthly trends!
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Category Details */}
        <Card className="mb-6 touch-manipulation">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Category Breakdown</CardTitle>
            <CardDescription>Detailed spending by category</CardDescription>
          </CardHeader>
          <CardContent>
            {spendingData.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {spendingData.map((item: { category: string; amount: number; percentage: number }, index: number) => (
                  <div key={item.category} className="flex items-center justify-between p-3 sm:p-4 border rounded-lg bg-white dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <div>
                        <div className="font-medium text-sm sm:text-base text-gray-900 dark:text-white">{item.category}</div>
                        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{item.percentage.toFixed(1)}% of total spending</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-sm sm:text-base text-gray-900 dark:text-white">{formatCurrency(item.amount)}</div>
                      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">This period</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                No spending data to display. Add some expenses to see your category breakdown!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Insights */}
        <Card className="touch-manipulation">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Financial Insights</CardTitle>
            <CardDescription>AI-powered recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                <h4 className="font-medium text-blue-900 dark:text-blue-100">Spending Alert</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Your food expenses are 15% higher than last month. Consider meal planning to reduce costs.
                </p>
              </div>
              <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                <h4 className="font-medium text-green-900 dark:text-green-100">Great Job!</h4>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  You're consistently saving 11.7% of your income. Keep up the excellent work!
                </p>
              </div>
              <div className="p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-500">
                <h4 className="font-medium text-yellow-900 dark:text-yellow-100">Budget Reminder</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  You're approaching your entertainment budget limit. Consider free alternatives for the rest of the month.
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

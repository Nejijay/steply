'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Calculator } from '@/components/Calculator';
import { CurrencyConverter } from '@/components/CurrencyConverter';
import { FloatingAddButton } from '@/components/FloatingAddButton';
import { TransactionsList } from '@/components/TransactionsList';
import { ThemeToggle } from '@/components/ThemeToggle';
import { getTransactions, getBudgets } from '@/lib/firebase-service';
import { Transaction, Budget } from '@/lib/types';
import { formatCurrency } from '@/lib/currency';

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<(Budget & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showConverter, setShowConverter] = useState(false);
  const [stats, setStats] = useState({
    totalBalance: 0,
    totalIncome: 0,
    totalExpenses: 0,
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, refreshTrigger]);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      // Fetch transactions
      const fetchedTransactions = await getTransactions(user.uid, 50);
      setTransactions(fetchedTransactions);

      // Fetch budgets for current month
      const fetchedBudgets = await getBudgets(user.uid, currentMonth, currentYear);
      setBudgets(fetchedBudgets);

      // Calculate stats from transactions
      const income = fetchedTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = fetchedTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      setStats({
        totalBalance: income - expenses,
        totalIncome: income,
        totalExpenses: expenses,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null; // This shouldn't happen as auth should redirect
  }

  const handleTransactionAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar 
        onCalculatorOpen={() => setShowCalculator(true)}
        onConverterOpen={() => setShowConverter(true)}
      />

      {/* Main Content */}
      <div className="flex-1 md:ml-64">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back, {user.displayName || user.email?.split('@')[0]}</p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button className="flex items-center gap-2">
                <Plus size={20} />
                <span className="hidden sm:inline">Add Transaction</span>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white/90">Total Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {loading ? '...' : formatCurrency(stats.totalBalance)}
                </div>
                <p className="text-xs text-white/80 mt-1">
                  {stats.totalBalance >= 0 ? '✓ Positive balance' : '⚠ Negative balance'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {loading ? '...' : formatCurrency(stats.totalIncome)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {transactions.filter(t => t.type === 'income').length} transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                  <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                    <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {loading ? '...' : formatCurrency(stats.totalExpenses)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {transactions.filter(t => t.type === 'expense').length} transactions
                </p>
              </CardContent>
            </Card>
          </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
          <Card className="touch-manipulation">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Monthly Overview</CardTitle>
              <CardDescription>Your income vs expenses this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48 sm:h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                Chart will be displayed here
              </div>
            </CardContent>
          </Card>

          <Card className="touch-manipulation">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Budget Progress</CardTitle>
              <CardDescription>How you're tracking against your budgets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {loading ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-4">Loading budgets...</div>
                ) : budgets.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                    No budgets set for this month
                  </div>
                ) : (
                  budgets.slice(0, 3).map((budget) => {
                    const percentage = (budget.spent / budget.limit) * 100;
                    const color = percentage >= 90 ? 'bg-red-500' : percentage >= 70 ? 'bg-yellow-500' : 'bg-green-500';
                    
                    return (
                      <div key={budget.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize">{budget.category}</span>
                          <span>${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className={`${color} h-2 rounded-full`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div className="text-center pt-2">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    Manage Budgets
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions List */}
        <TransactionsList refreshTrigger={refreshTrigger} />

        {/* Quick Actions */}
        <Card className="mt-4 sm:mt-6 touch-manipulation">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
            <CardDescription>Manage your finances efficiently</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <Button variant="outline" className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 text-xs sm:text-sm">
                <Plus size={16} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Add Income</span>
                <span className="sm:hidden">Income</span>
              </Button>
              <Button variant="outline" className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 text-xs sm:text-sm">
                <TrendingDown size={16} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Add Expense</span>
                <span className="sm:hidden">Expense</span>
              </Button>
              <Button variant="outline" className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 text-xs sm:text-sm">
                <DollarSign size={16} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Set Budget</span>
                <span className="sm:hidden">Budget</span>
              </Button>
              <Button variant="outline" className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 text-xs sm:text-sm">
                <TrendingUp size={16} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">View Reports</span>
                <span className="sm:hidden">Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>

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

      <FloatingAddButton />
    </div>
  );
}

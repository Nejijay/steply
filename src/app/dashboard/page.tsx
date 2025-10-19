'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, TrendingDown, DollarSign, LogOut } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { Calculator } from '@/components/Calculator';
import { CurrencyConverter } from '@/components/CurrencyConverter';
import { WalletCard } from '@/components/WalletCard';
import { FinancialHealthCard } from '@/components/FinancialHealthCard';
import { AIAdvisor } from '@/components/AIAdvisor';
import { AIChat } from '@/components/AIChat';
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

  const handleLogout = async () => {
    const { logout } = await import('@/lib/firebase-service');
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
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
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut size={20} />
              </Button>
            </div>
          </div>

          {/* Wallet Card */}
          <div className="mb-8">
            <WalletCard
              balance={stats.totalBalance}
              income={stats.totalIncome}
              expenses={stats.totalExpenses}
              loading={loading}
            />
          </div>

        {/* AI Advisor & Financial Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <AIAdvisor
            balance={stats.totalBalance}
            income={0}
            expenses={stats.totalExpenses}
            transactions={transactions}
            budgets={budgets}
          />
          <FinancialHealthCard
            balance={stats.totalBalance}
            income={stats.totalIncome}
            expenses={stats.totalExpenses}
            budgets={budgets}
            transactions={transactions}
          />
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

      {/* AI Chat Assistant */}
      <AIChat
        balance={stats.totalBalance}
        income={stats.totalIncome}
        expenses={stats.totalExpenses}
        transactions={transactions}
        budgets={budgets}
        currentPage="Dashboard"
      />

      <FloatingAddButton />
    </div>
  );
}

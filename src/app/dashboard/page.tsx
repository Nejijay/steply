'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, TrendingDown, DollarSign, Settings, BarChart3, LogOut, ChevronDown, CheckSquare } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { Calculator } from '@/components/Calculator';
import { CurrencyConverter } from '@/components/CurrencyConverter';
import { WalletCard } from '@/components/WalletCard';
import { FinancialHealthCard } from '@/components/FinancialHealthCard';
import { FloatingAddButton } from '@/components/FloatingAddButton';
import { TransactionsList } from '@/components/TransactionsList';
import { getTransactions, getBudgets } from '@/lib/firebase-service';
import { Transaction, Budget } from '@/lib/types';
import { formatCurrency } from '@/lib/currency';
import { useThemeColor, themeColors } from '@/contexts/ThemeColorContext';
import { WelcomeModal } from '@/components/WelcomeModal';

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { themeColor } = useThemeColor();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<(Budget & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showConverter, setShowConverter] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
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

  // Refresh data when page becomes visible (e.g., navigating back from chat)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        fetchData();
      }
    };

    const handleFocus = () => {
      if (user) {
        fetchData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

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
      {/* Welcome Modal for New Users */}
      <WelcomeModal userName={user?.displayName || user?.email?.split('@')[0]} />

      {/* TODO & Settings - Top Right Corner */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        {/* TODO Button */}
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => router.push('/todos')}
          title="Planned Expenses"
          className={`bg-white dark:bg-gray-800 shadow-lg ${themeColors[themeColor].hover}`}
        >
          <CheckSquare size={20} className={themeColors[themeColor].text} />
        </Button>
        
        {/* Settings Button */}
        <div className="relative">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setShowSettingsMenu(!showSettingsMenu)}
            title="Settings"
            className="bg-white dark:bg-gray-800 shadow-lg"
          >
            <Settings size={20} />
          </Button>
                
                {showSettingsMenu && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowSettingsMenu(false)}
                    />
                    
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                      <button
                        onClick={() => {
                          setShowSettingsMenu(false);
                          router.push('/analytics');
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 text-sm"
                      >
                        <BarChart3 size={18} />
                        <span>Analytics</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setShowSettingsMenu(false);
                          router.push('/settings');
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 text-sm"
                      >
                        <Settings size={18} />
                        <span>Settings</span>
                      </button>
                      
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                      
                      <button
                        onClick={() => {
                          setShowSettingsMenu(false);
                          handleLogout();
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 text-sm text-red-600 dark:text-red-400"
                      >
                        <LogOut size={18} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back, {user.displayName || user.email?.split('@')[0]}</p>
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

        {/* Transactions List */}
        <TransactionsList refreshTrigger={refreshTrigger} />

        {/* Quick Analytics */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <TrendingUp className={themeColors[themeColor].text} size={20} />
              Quick Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-gray-200 dark:border-purple-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Transactions</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{transactions.length}</p>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-gray-200 dark:border-blue-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Budgets</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{budgets.length}</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-gray-200 dark:border-green-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Savings Rate</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats.totalIncome > 0 ? Math.round(((stats.totalIncome - stats.totalExpenses) / stats.totalIncome) * 100) : 0}%
                </p>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-gray-200 dark:border-orange-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">This Month</p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {new Date().toLocaleDateString('en-US', { month: 'short' })}
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

      <FloatingAddButton />
    </div>
  );
}

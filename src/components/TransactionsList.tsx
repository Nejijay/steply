'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Trash2, Filter, X } from 'lucide-react';
import { Transaction } from '@/lib/types';
import { getTransactions, deleteTransaction, updateTransaction } from '@/lib/firebase-service';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor, themeColors } from '@/contexts/ThemeColorContext';

interface TransactionsListProps {
  refreshTrigger?: number; // For triggering refresh after adding transactions
}

export const TransactionsList = ({ refreshTrigger }: TransactionsListProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    amount: '',
    category: '',
    note: '',
  });
  const { user } = useAuth();
  const { themeColor } = useThemeColor();

  useEffect(() => {
    loadTransactions();
  }, [user, refreshTrigger]);

  const loadTransactions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await getTransactions(user.uid);
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
      await deleteTransaction(id);
      await loadTransactions(); // Refresh the list
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditForm({
      title: transaction.title,
      amount: transaction.amount.toString(),
      category: transaction.category,
      note: transaction.note || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editingTransaction?.id) return;

    try {
      await updateTransaction(editingTransaction.id, {
        title: editForm.title,
        amount: parseFloat(editForm.amount),
        category: editForm.category,
        note: editForm.note,
      });
      setEditingTransaction(null);
      await loadTransactions();
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const filteredTransactions = transactions.filter(t =>
    filter === 'all' || t.type === filter
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading transactions...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="touch-manipulation">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <CardTitle className="text-lg sm:text-xl text-gray-900 dark:text-white">Recent Transactions</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">Your latest financial activity</CardDescription>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className="flex-1 sm:flex-none"
            >
              All
            </Button>
            <Button
              variant={filter === 'income' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('income')}
              className="flex-1 sm:flex-none"
            >
              Income
            </Button>
            <Button
              variant={filter === 'expense' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('expense')}
              className="flex-1 sm:flex-none"
            >
              Expenses
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredTransactions.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            No transactions found
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 sm:p-4 border rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  ></div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm sm:text-base truncate text-gray-900 dark:text-white">{transaction.title}</div>
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                      {transaction.category} • {formatDate(transaction.date)}
                      {transaction.note && ` • ${transaction.note}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`font-medium text-sm sm:text-base ${
                      transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    onClick={() => handleEdit(transaction)}
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    onClick={() => transaction.id && handleDelete(transaction.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Edit Modal */}
      {editingTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className={`bg-gradient-to-r ${themeColors[themeColor].primary} p-4 flex justify-between items-center rounded-t-lg`}>
              <h3 className="text-lg font-semibold text-white">Edit Transaction</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setEditingTransaction(null)}
                className="text-white hover:bg-white/20"
              >
                <X size={18} />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  Title
                </label>
                <Input
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  Amount
                </label>
                <Input
                  type="number"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  Category
                </label>
                <Input
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                  Note (optional)
                </label>
                <Input
                  value={editForm.note}
                  onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                  className="w-full"
                  placeholder="Add a note..."
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditingTransaction(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  className={`flex-1 bg-gradient-to-r ${themeColors[themeColor].primary} text-white hover:opacity-90`}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

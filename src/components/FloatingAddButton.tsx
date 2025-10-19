'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TransactionForm } from '@/components/TransactionForm';
import { addTransaction } from '@/lib/firebase-service';
import { useAuth } from '@/contexts/AuthContext';

export const FloatingAddButton = () => {
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'income' | 'expense'>('expense');
  const { user } = useAuth();

  const handleAddTransaction = async (data: {
    title: string;
    amount: number;
    category: string;
    date: string;
    note?: string;
  }) => {
    if (!user) return;

    try {
      await addTransaction({
        uid: user.uid,
        type: formType,
        title: data.title,
        amount: data.amount,
        category: data.category,
        date: new Date(data.date),
        note: data.note,
      });
      setShowForm(false);
      // TODO: Show success message or refresh dashboard data
    } catch (error) {
      console.error('Error adding transaction:', error);
      // TODO: Show error message
    }
  };

  return (
    <>
      <Button
        onClick={() => setShowForm(true)}
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-2xl z-40 touch-manipulation active:scale-95 transition-transform bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
        size="icon"
      >
        <Plus size={28} strokeWidth={2.5} />
      </Button>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Add Transaction</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                ✕
              </Button>
            </div>
            <div className="p-4">
              <div className="flex gap-2 mb-4">
                <Button
                  variant={formType === 'expense' ? 'default' : 'outline'}
                  onClick={() => setFormType('expense')}
                  className="flex-1 h-12 text-base"
                >
                  Expense
                </Button>
                <Button
                  variant={formType === 'income' ? 'default' : 'outline'}
                  onClick={() => setFormType('income')}
                  className="flex-1 h-12 text-base"
                >
                  Income
                </Button>
              </div>
              <TransactionForm
                type={formType}
                onSubmit={handleAddTransaction}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

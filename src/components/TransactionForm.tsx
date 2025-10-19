'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';

interface TransactionFormProps {
  type: 'income' | 'expense';
  onSubmit: (data: {
    title: string;
    amount: number;
    category: string;
    date: string;
    note?: string;
  }) => void;
  onCancel: () => void;
}

const categories = {
  income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
  expense: ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Education', 'Other'],
};

export const TransactionForm = ({ type, onSubmit, onCancel }: TransactionFormProps) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  const handleSubmit = (e: React.FormEvent, addAnother = false) => {
    e.preventDefault();
    if (!category.trim()) {
      alert('Please select or enter a category');
      return;
    }
    
    onSubmit({
      title,
      amount: parseFloat(amount),
      category: category.trim(),
      date,
      note: note || '', // Must be empty string, not undefined for Firebase
    });
    
    // If "Add Another" was clicked, reset form but keep date and category
    if (addAnother) {
      setTitle('');
      setAmount('');
      setNote('');
      // Keep category and date for quick entry
    }
  };

  const selectCategory = (cat: string) => {
    setCategory(cat);
    setShowCustomCategory(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl text-gray-900 dark:text-white">Add {type === 'income' ? 'Income' : 'Expense'}</CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-300">
          Record your {type === 'income' ? 'income' : 'expense'} transaction
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="text-base" // Larger text for mobile
              autoComplete="off"
            />
          </div>
          <div>
            <Input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
              required
              className="text-base" // Larger text for mobile
              inputMode="decimal" // Better mobile keyboard
              autoComplete="off"
            />
          </div>
          {/* Category Selection */}
          <div>
            <label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">
              Category
            </label>
            
            {/* Quick Category Chips */}
            {!showCustomCategory && (
              <div className="flex flex-wrap gap-2 mb-3">
                {categories[type].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => selectCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      category === cat
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowCustomCategory(true)}
                  className="px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 flex items-center gap-1"
                >
                  <Plus size={14} />
                  Custom
                </button>
              </div>
            )}
            
            {/* Custom Category Input */}
            {showCustomCategory && (
              <div className="mb-3">
                <Input
                  type="text"
                  placeholder="Enter custom category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="text-base"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomCategory(false);
                    setCategory('');
                  }}
                  className="text-sm text-blue-600 dark:text-blue-400 mt-1 hover:underline"
                >
                  ← Back to categories
                </button>
              </div>
            )}
            
            {/* Selected Category Display */}
            {category && !showCustomCategory && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Selected: <span className="font-semibold text-gray-900 dark:text-white">{category}</span>
              </div>
            )}
          </div>
          <div>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="text-base"
            />
          </div>
          <div>
            <Input
              type="text"
              placeholder="Note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="text-base"
              autoComplete="off"
            />
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex gap-2">
              <Button type="submit" className="flex-1 h-12 text-base">
                Add {type === 'income' ? 'Income' : 'Expense'}
              </Button>
              <Button 
                type="button" 
                onClick={(e) => handleSubmit(e as any, true)}
                className="flex-1 h-12 text-base bg-green-600 hover:bg-green-700"
              >
                <Plus size={18} className="mr-1" />
                Add Another
              </Button>
            </div>
            <Button type="button" variant="outline" className="h-12" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

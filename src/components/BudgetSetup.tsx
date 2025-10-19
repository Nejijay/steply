'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Budget } from '@/lib/types';
import { setBudget, getBudgets } from '@/lib/firebase-service';
import { useAuth } from '@/contexts/AuthContext';

interface BudgetSetupProps {
  refreshTrigger?: number;
}

const categories = [
  'Food', 'Transport', 'Entertainment', 'Shopping', 'Bills',
  'Healthcare', 'Education', 'Rent', 'Utilities', 'Other'
];

export const BudgetSetup = ({ refreshTrigger }: BudgetSetupProps) => {
  const [budgets, setBudgets] = useState<(Budget & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    limit: '',
  });
  const { user } = useAuth();

  useEffect(() => {
    loadBudgets();
  }, [user, refreshTrigger]);

  const loadBudgets = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const currentDate = new Date();
      const budgetsData = await getBudgets(user.uid, currentDate.getMonth() + 1, currentDate.getFullYear());
      setBudgets(budgetsData);
    } catch (error) {
      console.error('Error loading budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.category || !formData.limit) return;

    try {
      const currentDate = new Date();
      await setBudget({
        uid: user.uid,
        category: formData.category,
        limit: parseFloat(formData.limit),
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
      });

      setShowForm(false);
      setEditingBudget(null);
      setFormData({ category: '', limit: '' });
      await loadBudgets();
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };

  const handleEdit = (budget: Budget & { id: string }) => {
    setEditingBudget(budget.id);
    setFormData({
      category: budget.category,
      limit: budget.limit.toString(),
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;

    // TODO: Implement budget deletion
    console.log('Delete budget:', id);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getProgressColor = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading budgets...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="touch-manipulation">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <CardTitle className="text-lg sm:text-xl">Budget Setup</CardTitle>
            <CardDescription>Set monthly spending limits for different categories</CardDescription>
          </div>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2 w-full sm:w-auto">
            <Plus size={20} />
            Add Budget
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <div className="mb-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-3 border rounded-md text-base"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Monthly Limit</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.limit}
                    onChange={(e) => setFormData(prev => ({ ...prev, limit: e.target.value }))}
                    min="0"
                    step="0.01"
                    required
                    className="text-base"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingBudget ? 'Update' : 'Add'} Budget
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingBudget(null);
                    setFormData({ category: '', limit: '' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {budgets.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No budgets set up yet. Click "Add Budget" to get started.
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {budgets.map((budget) => (
              <div key={budget.id} className="p-3 sm:p-4 border rounded-lg bg-white dark:bg-gray-800">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-sm sm:text-base">{budget.category}</h3>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(budget)}>
                      <Edit size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(budget.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Spent: {formatCurrency(budget.spent)}</span>
                    <span>Limit: {formatCurrency(budget.limit)}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressColor(budget.spent, budget.limit)}`}
                      style={{
                        width: `${Math.min((budget.spent / budget.limit) * 100, 100)}%`
                      }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {((budget.spent / budget.limit) * 100).toFixed(1)}% used
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

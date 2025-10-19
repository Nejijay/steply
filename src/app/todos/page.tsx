'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, Check, Trash2, Calendar } from 'lucide-react';
import { addTodo, getTodos, completeTodo, deleteTodo } from '@/lib/firebase-service';
import { Todo } from '@/lib/types';
import { formatCurrency } from '@/lib/currency';
import { BottomNav } from '@/components/BottomNav';
import { Calculator } from '@/components/Calculator';
import { CurrencyConverter } from '@/components/CurrencyConverter';
import { useThemeColor, themeColors } from '@/contexts/ThemeColorContext';

const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Education', 'Other'];

export default function TodosPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { themeColor } = useThemeColor();
  const [todos, setTodos] = useState<(Todo & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showConverter, setShowConverter] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Other',
    dueDate: '',
    note: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchTodos();
  }, [user, router]);

  const fetchTodos = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const todosData = await getTodos(user.uid);
      setTodos(todosData);
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, addAnother = false) => {
    e.preventDefault();
    if (!user) return;

    try {
      const todoData: any = {
        uid: user.uid,
        title: formData.title.trim(),
        amount: parseFloat(formData.amount),
        category: formData.category,
        completed: false,
      };

      // Only add optional fields if they have actual values (not empty strings)
      if (formData.dueDate && formData.dueDate.trim()) {
        todoData.dueDate = formData.dueDate;
      }
      if (formData.note && formData.note.trim()) {
        todoData.note = formData.note.trim();
      }

      await addTodo(todoData);

      if (addAnother) {
        // Keep form open, reset only title and amount
        setFormData(prev => ({ ...prev, title: '', amount: '', note: '' }));
      } else {
        setFormData({ title: '', amount: '', category: 'Other', dueDate: '', note: '' });
        setShowForm(false);
      }
      
      await fetchTodos();
    } catch (error) {
      console.error('Error adding todo:', error);
      alert('Failed to add todo. Please try again.');
    }
  };

  const handleComplete = async (todo: Todo & { id: string }) => {
    if (!confirm(`Mark "${todo.title}" as complete and add to expenses?`)) return;

    try {
      await completeTodo(todo);
      await fetchTodos();
      alert(`✅ ${todo.title} completed and added to transactions!`);
    } catch (error) {
      console.error('Error completing todo:', error);
      alert('Failed to complete todo. Please try again.');
    }
  };

  const handleDelete = async (todoId: string) => {
    if (!confirm('Delete this TODO?')) return;

    try {
      await deleteTodo(todoId);
      await fetchTodos();
    } catch (error) {
      console.error('Error deleting todo:', error);
      alert('Failed to delete todo. Please try again.');
    }
  };

  const pendingTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);
  const totalPlanned = pendingTodos.reduce((sum, t) => sum + t.amount, 0);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <div className="max-w-4xl mx-auto">
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Planned Expenses</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mt-1">
            Track upcoming expenses. Check off when paid!
          </p>
        </div>

        <div className="px-4 sm:px-6 space-y-6">
          {/* Stats Card */}
          <Card className={`bg-gradient-to-br ${themeColors[themeColor].primary} text-white`}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-white/80">Total Planned</p>
                  <p className="text-3xl font-bold">{formatCurrency(totalPlanned)}</p>
                  <p className="text-sm text-white/80 mt-1">{pendingTodos.length} items pending</p>
                </div>
                <Button 
                  onClick={() => setShowForm(true)}
                  className={`bg-white ${themeColors[themeColor].text} hover:opacity-90`}
                >
                  <Plus size={20} className="mr-2" />
                  Add TODO
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Add Form */}
          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">New Planned Expense</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Add an expense you plan to make
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Title</label>
                    <Input
                      placeholder="e.g., Buy groceries"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Amount (₵)</label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full p-2 border rounded-md text-base dark:bg-gray-800 dark:text-white dark:border-gray-700"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Due Date (optional)</label>
                    <Input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Note (optional)</label>
                    <Input
                      placeholder="Additional details..."
                      value={formData.note}
                      onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">Add TODO</Button>
                      <Button 
                        type="button"
                        onClick={(e) => handleSubmit(e as any, true)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Plus size={18} className="mr-1" />
                        Add Another
                      </Button>
                    </div>
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Pending TODOs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Pending ({pendingTodos.length})</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Click checkmark to mark as paid and add to expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">Loading...</p>
              ) : pendingTodos.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No pending expenses. Click "Add TODO" to start!
                </p>
              ) : (
                <div className="space-y-3">
                  {pendingTodos.map((todo) => (
                    <div key={todo.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                      <div className="flex items-start gap-3">
                        <Button
                          size="sm"
                          onClick={() => handleComplete(todo)}
                          className="flex-shrink-0 h-10 w-10 p-0 border-2 border-green-600 bg-white dark:bg-gray-800 text-green-600 hover:bg-green-600 hover:text-white transition-all"
                          title="Mark as paid"
                        >
                          <Check size={20} strokeWidth={3} />
                        </Button>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">{todo.title}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
                            <span className={`font-bold ${themeColors[themeColor].text}`}>{formatCurrency(todo.amount)}</span>
                            <span>•</span>
                            <span>{todo.category}</span>
                            {todo.dueDate && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Calendar size={14} />
                                  {new Date(todo.dueDate).toLocaleDateString()}
                                </span>
                              </>
                            )}
                          </div>
                          {todo.note && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{todo.note}</p>}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(todo.id!)}
                          className="flex-shrink-0 h-10 w-10 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Completed TODOs */}
          {completedTodos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Completed ({completedTodos.length})</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Already added to your expenses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {completedTodos.map((todo) => (
                    <div key={todo.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 opacity-60">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <Check size={20} className="text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-700 dark:text-gray-300 line-through">{todo.title}</h3>
                          <div className="text-sm text-gray-500 dark:text-gray-500">
                            {formatCurrency(todo.amount)} • {todo.category}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
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

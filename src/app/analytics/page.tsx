'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const mockSpendingData = [
  { category: 'Food', amount: 450, percentage: 25.7 },
  { category: 'Transport', amount: 320, percentage: 18.3 },
  { category: 'Entertainment', amount: 150, percentage: 8.6 },
  { category: 'Shopping', amount: 280, percentage: 16.0 },
  { category: 'Bills', amount: 400, percentage: 22.9 },
  { category: 'Healthcare', amount: 150, percentage: 8.6 },
];

const mockMonthlyData = [
  { month: 'Jan', income: 4200, expenses: 3800 },
  { month: 'Feb', income: 4200, expenses: 3200 },
  { month: 'Mar', income: 4200, expenses: 4100 },
  { month: 'Apr', income: 4200, expenses: 3500 },
  { month: 'May', income: 4200, expenses: 3900 },
  { month: 'Jun', income: 4200, expenses: 3750 },
];

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('6months');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" className="mb-4 p-2">
            <ArrowLeft size={20} className="mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Analytics & Reports</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Insights into your spending patterns</p>
        </div>

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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <Card className="touch-manipulation">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Monthly Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{formatCurrency(4200)}</div>
              <p className="text-xs text-muted-foreground">
                Consistent across periods
              </p>
            </CardContent>
          </Card>

          <Card className="touch-manipulation">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Monthly Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{formatCurrency(3708)}</div>
              <p className="text-xs text-muted-foreground">
                -5.2% from last period
              </p>
            </CardContent>
          </Card>

          <Card className="touch-manipulation sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">11.7%</div>
              <p className="text-xs text-muted-foreground">
                +2.1% improvement
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-6">
          {/* Spending Breakdown */}
          <Card className="touch-manipulation">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Spending by Category</CardTitle>
              <CardDescription>Where your money goes this period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockSpendingData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percentage }) => `${category} (${percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {mockSpendingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trends */}
          <Card className="touch-manipulation">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Monthly Trends</CardTitle>
              <CardDescription>Income vs expenses over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockMonthlyData}>
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
            <div className="space-y-3 sm:space-y-4">
              {mockSpendingData.map((item, index) => (
                <div key={item.category} className="flex items-center justify-between p-3 sm:p-4 border rounded-lg bg-white dark:bg-gray-800">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <div>
                      <div className="font-medium text-sm sm:text-base">{item.category}</div>
                      <div className="text-xs sm:text-sm text-gray-500">{item.percentage}% of total spending</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm sm:text-base">{formatCurrency(item.amount)}</div>
                    <div className="text-xs sm:text-sm text-gray-500">This period</div>
                  </div>
                </div>
              ))}
            </div>
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
  );
}

// Smart Budget Analysis and Reasoning Engine

import { Transaction, Budget } from './types';

export interface BudgetAnalysis {
  canAfford: boolean;
  recommendation: string;
  severity: 'safe' | 'warning' | 'danger';
  suggestedAmount: number;
  reasoning: string;
  tips: string[];
}

export interface SpendingPattern {
  category: string;
  amount: number;
  percentage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  isOverBudget: boolean;
}

export interface FinancialHealth {
  score: number; // 0-100
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  savingsRate: number;
  expenseRatio: number;
  recommendations: string[];
  warnings: string[];
}

/**
 * Analyzes if a budget is affordable based on current balance and spending patterns
 */
export const analyzeBudgetAffordability = (
  proposedBudget: number,
  currentBalance: number,
  monthlyIncome: number,
  existingBudgets: Budget[],
  recentTransactions: Transaction[]
): BudgetAnalysis => {
  // Calculate total existing budgets
  const totalExistingBudgets = existingBudgets.reduce((sum, b) => sum + b.limit, 0);
  const totalProposedBudgets = totalExistingBudgets + proposedBudget;

  // Calculate average monthly expenses from recent transactions
  const monthlyExpenses = recentTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate affordability
  const remainingBalance = currentBalance - proposedBudget;
  const budgetToIncomeRatio = monthlyIncome > 0 ? (totalProposedBudgets / monthlyIncome) * 100 : 0;
  const canAfford = remainingBalance >= 0 && budgetToIncomeRatio <= 80;

  // Determine severity
  let severity: 'safe' | 'warning' | 'danger' = 'safe';
  if (budgetToIncomeRatio > 80 || remainingBalance < 0) {
    severity = 'danger';
  } else if (budgetToIncomeRatio > 60 || remainingBalance < currentBalance * 0.2) {
    severity = 'warning';
  }

  // Generate recommendation
  let recommendation = '';
  let reasoning = '';
  const tips: string[] = [];

  if (severity === 'danger') {
    recommendation = `This budget is too high! You'll have ${remainingBalance < 0 ? 'negative' : 'only'} ₵${Math.abs(remainingBalance).toFixed(2)} left.`;
    reasoning = `Your total budgets (₵${totalProposedBudgets.toFixed(2)}) would be ${budgetToIncomeRatio.toFixed(0)}% of your income. Financial experts recommend keeping it under 80%.`;
    tips.push('Consider reducing this budget amount');
    tips.push('Review and cut unnecessary expenses');
    tips.push('Look for ways to increase your income');
  } else if (severity === 'warning') {
    recommendation = `This budget is manageable but tight. You'll have ₵${remainingBalance.toFixed(2)} remaining.`;
    reasoning = `Your budgets will be ${budgetToIncomeRatio.toFixed(0)}% of your income. This leaves little room for savings or emergencies.`;
    tips.push('Try to save at least 20% of your income');
    tips.push('Build an emergency fund');
    tips.push('Track your spending closely');
  } else {
    recommendation = `This budget looks good! You'll have ₵${remainingBalance.toFixed(2)} for savings and emergencies.`;
    reasoning = `Your total budgets (${budgetToIncomeRatio.toFixed(0)}% of income) leave room for savings and unexpected expenses.`;
    tips.push('Great job budgeting responsibly!');
    tips.push('Consider investing your savings');
    tips.push('Keep tracking your expenses');
  }

  // Suggest optimal amount
  const suggestedAmount = severity === 'danger' 
    ? Math.max(0, currentBalance * 0.6 - totalExistingBudgets)
    : proposedBudget;

  return {
    canAfford,
    recommendation,
    severity,
    suggestedAmount,
    reasoning,
    tips,
  };
};

/**
 * Analyzes spending patterns by category
 */
export const analyzeSpendingPatterns = (
  transactions: Transaction[],
  budgets: Budget[]
): SpendingPattern[] => {
  const categorySpending: { [key: string]: number } = {};
  const totalSpending = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => {
      categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
      return sum + t.amount;
    }, 0);

  const patterns: SpendingPattern[] = Object.entries(categorySpending).map(([category, amount]) => {
    const budget = budgets.find(b => b.category === category);
    const percentage = totalSpending > 0 ? (amount / totalSpending) * 100 : 0;
    
    return {
      category,
      amount,
      percentage,
      trend: 'stable', // TODO: Calculate trend from historical data
      isOverBudget: budget ? amount > budget.limit : false,
    };
  });

  return patterns.sort((a, b) => b.amount - a.amount);
};

/**
 * Calculates overall financial health score
 */
export const calculateFinancialHealth = (
  balance: number,
  income: number,
  expenses: number,
  budgets: Budget[],
  transactions: Transaction[]
): FinancialHealth => {
  let score = 100;
  const recommendations: string[] = [];
  const warnings: string[] = [];

  // Calculate metrics
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
  const expenseRatio = income > 0 ? (expenses / income) * 100 : 0;
  const totalBudgets = budgets.reduce((sum, b) => sum + b.limit, 0);
  const budgetUtilization = totalBudgets > 0 ? (expenses / totalBudgets) * 100 : 0;

  // Score adjustments
  if (balance < 0) {
    score -= 30;
    warnings.push('⚠️ Negative balance - immediate action required');
    recommendations.push('Stop all non-essential spending');
    recommendations.push('Find ways to increase income urgently');
  }

  if (savingsRate < 10) {
    score -= 20;
    warnings.push('⚠️ Low savings rate');
    recommendations.push('Aim to save at least 20% of your income');
  } else if (savingsRate >= 20) {
    score += 10;
    recommendations.push('✓ Excellent savings rate! Keep it up');
  }

  if (expenseRatio > 90) {
    score -= 25;
    warnings.push('⚠️ Spending almost all your income');
    recommendations.push('Reduce expenses or increase income');
  }

  if (budgetUtilization > 90) {
    score -= 15;
    warnings.push('⚠️ Exceeding budget limits');
    recommendations.push('Review and adjust your budgets');
  }

  // Determine status
  let status: FinancialHealth['status'];
  if (score >= 80) status = 'excellent';
  else if (score >= 60) status = 'good';
  else if (score >= 40) status = 'fair';
  else if (score >= 20) status = 'poor';
  else status = 'critical';

  // Add positive recommendations
  if (status === 'excellent' || status === 'good') {
    recommendations.push('Consider investing your savings');
    recommendations.push('Build a 6-month emergency fund');
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    status,
    savingsRate,
    expenseRatio,
    recommendations,
    warnings,
  };
};

/**
 * Suggests optimal budget allocation based on income
 */
export const suggestBudgetAllocation = (monthlyIncome: number): { [key: string]: number } => {
  // 50/30/20 rule with Ghana context
  return {
    'Needs (Housing, Food, Transport)': monthlyIncome * 0.50,
    'Wants (Entertainment, Dining)': monthlyIncome * 0.30,
    'Savings & Debt': monthlyIncome * 0.20,
  };
};

/**
 * Predicts if user will exceed budget this month
 */
export const predictBudgetExceedance = (
  budget: Budget,
  currentSpending: number,
  daysElapsed: number,
  daysInMonth: number
): { willExceed: boolean; projectedAmount: number; confidence: number } => {
  const dailyRate = daysElapsed > 0 ? currentSpending / daysElapsed : 0;
  const projectedAmount = dailyRate * daysInMonth;
  const willExceed = projectedAmount > budget.limit;
  
  // Confidence increases as month progresses
  const confidence = Math.min(95, (daysElapsed / daysInMonth) * 100);

  return {
    willExceed,
    projectedAmount,
    confidence,
  };
};

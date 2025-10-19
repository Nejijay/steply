// Google Gemini AI Integration for Financial Advice

import { GoogleGenerativeAI } from '@google/generative-ai';
import { Transaction, Budget } from './types';
import { formatCurrency } from './currency';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export interface AIFinancialAdvice {
  advice: string;
  insights: string[];
  actionItems: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

/**
 * Get personalized financial advice from Gemini AI
 */
export const getFinancialAdvice = async (
  balance: number,
  income: number,
  expenses: number,
  transactions: Transaction[],
  budgets: Budget[]
): Promise<AIFinancialAdvice> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Prepare financial context
    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
    const expenseRatio = income > 0 ? (expenses / income) * 100 : 0;

    // Analyze spending by category
    const categorySpending: { [key: string]: number } = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
      });

    const topCategories = Object.entries(categorySpending)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat, amt]) => `${cat}: ${formatCurrency(amt)}`)
      .join(', ');

    const prompt = `You are a professional financial advisor in Ghana. Analyze this financial situation and provide personalized advice:

**Financial Overview:**
- Current Balance: ${formatCurrency(balance)}
- Monthly Income: ${formatCurrency(income)}
- Monthly Expenses: ${formatCurrency(expenses)}
- Savings Rate: ${savingsRate.toFixed(1)}%
- Expense Ratio: ${expenseRatio.toFixed(1)}%
- Number of Transactions: ${transactions.length}
- Active Budgets: ${budgets.length}
- Top Spending Categories: ${topCategories || 'None'}

**Context:**
- Currency: Ghana Cedis (GHS)
- User is trying to manage their budget better
- They want practical, actionable advice

Please provide:
1. A brief overall assessment (2-3 sentences)
2. 3-5 specific insights about their financial situation
3. 3-5 actionable steps they should take
4. Risk level assessment (low/medium/high)

Format your response as JSON with this structure:
{
  "advice": "Overall assessment here",
  "insights": ["insight 1", "insight 2", ...],
  "actionItems": ["action 1", "action 2", ...],
  "riskLevel": "low|medium|high"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        advice: parsed.advice || 'Unable to generate advice at this time.',
        insights: parsed.insights || [],
        actionItems: parsed.actionItems || [],
        riskLevel: parsed.riskLevel || 'medium',
      };
    }

    // Fallback if JSON parsing fails
    return {
      advice: text.substring(0, 300),
      insights: ['Review your spending patterns', 'Set realistic budgets', 'Track expenses regularly'],
      actionItems: ['Create a monthly budget', 'Reduce unnecessary expenses', 'Build an emergency fund'],
      riskLevel: 'medium',
    };
  } catch (error) {
    console.error('Gemini AI Error:', error);
    
    // Fallback advice
    return {
      advice: 'Focus on tracking your expenses and creating realistic budgets. Aim to save at least 20% of your income.',
      insights: [
        'Your financial data is being analyzed',
        'Consider reviewing your spending habits',
        'Building an emergency fund is crucial',
      ],
      actionItems: [
        'Set up automatic savings',
        'Review and cut unnecessary subscriptions',
        'Create category-based budgets',
      ],
      riskLevel: balance < 0 ? 'high' : expenses > income * 0.8 ? 'medium' : 'low',
    };
  }
};

/**
 * Get AI-powered budget suggestions
 */
export const getBudgetSuggestions = async (
  income: number,
  currentBudgets: Budget[],
  transactions: Transaction[]
): Promise<{ category: string; suggestedAmount: number; reason: string }[]> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const existingBudgets = currentBudgets.map(b => `${b.category}: ${formatCurrency(b.limit)}`).join(', ');
    
    const categorySpending: { [key: string]: number } = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
      });

    const spendingData = Object.entries(categorySpending)
      .map(([cat, amt]) => `${cat}: ${formatCurrency(amt)}`)
      .join(', ');

    const prompt = `As a financial advisor in Ghana, suggest optimal budget allocations:

**Income:** ${formatCurrency(income)}
**Current Budgets:** ${existingBudgets || 'None'}
**Recent Spending:** ${spendingData || 'No data'}

Suggest 3-5 budget categories with amounts (in GHS) and reasons. Use the 50/30/20 rule as a guideline.

Format as JSON array:
[
  {"category": "Food & Groceries", "suggestedAmount": 500, "reason": "Based on your spending pattern"},
  ...
]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback suggestions
    return [
      { category: 'Food & Groceries', suggestedAmount: income * 0.25, reason: 'Essential expenses' },
      { category: 'Transportation', suggestedAmount: income * 0.15, reason: 'Commute and travel' },
      { category: 'Savings', suggestedAmount: income * 0.20, reason: 'Build emergency fund' },
    ];
  } catch (error) {
    console.error('Budget Suggestions Error:', error);
    return [];
  }
};

/**
 * Analyze a specific transaction and get AI insights
 */
export const analyzeTransaction = async (
  transaction: Transaction,
  userBalance: number,
  monthlyIncome: number
): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Analyze this transaction and provide a brief insight (1-2 sentences):

Transaction: ${transaction.title}
Amount: ${formatCurrency(transaction.amount)}
Category: ${transaction.category}
Type: ${transaction.type}
User Balance: ${formatCurrency(userBalance)}
Monthly Income: ${formatCurrency(monthlyIncome)}

Is this a good financial decision? Any concerns or tips?`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Transaction Analysis Error:', error);
    return 'Transaction recorded successfully.';
  }
};

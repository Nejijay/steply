// Enhanced Gemini AI with Full Context Awareness and Firebase Integration

import { GoogleGenerativeAI } from '@google/generative-ai';
import { Transaction, Budget } from './types';
import { formatCurrency } from './currency';
import { saveConversation, buildAIContext, saveInsight } from './ai-memory-service';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export interface AIResponse {
  message: string;
  suggestions?: string[];
  insights?: string[];
  actionRequired?: boolean;
}

/**
 * Chat with Gemini AI with full context awareness
 */
export const chatWithAI = async (
  userMessage: string,
  context: {
    uid: string;
    page: string;
    balance: number;
    income: number;
    expenses: number;
    transactions: Transaction[];
    budgets: Budget[];
  }
): Promise<AIResponse> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Get conversation history from Firebase
    const conversationHistory = await buildAIContext(context.uid);

    // Build comprehensive context
    const savingsRate = context.income > 0 ? ((context.income - context.expenses) / context.income) * 100 : 0;
    
    const recentTransactions = context.transactions
      .slice(-5)
      .map(t => `${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)} - ${t.title} (${t.category})`)
      .join('\n');

    const activeBudgets = context.budgets
      .map(b => `${b.category}: ${formatCurrency(b.spent)}/${formatCurrency(b.limit)} (${((b.spent/b.limit)*100).toFixed(0)}%)`)
      .join('\n');

    const prompt = `You are Steply AI, a personal financial assistant for a user in Ghana. You have access to their complete financial data and conversation history stored in Firebase. Be helpful, conversational, and provide actionable advice.

**Current Context:**
- Page: ${context.page}
- Current Balance: ${formatCurrency(context.balance)}
- Monthly Income: ${formatCurrency(context.income)}
- Monthly Expenses: ${formatCurrency(context.expenses)}
- Savings Rate: ${savingsRate.toFixed(1)}%
- Total Transactions: ${context.transactions.length}
- Active Budgets: ${context.budgets.length}

**Recent Transactions:**
${recentTransactions || 'No recent transactions'}

**Active Budgets:**
${activeBudgets || 'No budgets set'}

**Previous Conversations & Memory:**
${conversationHistory}

**User Message:**
"${userMessage}"

**Instructions:**
1. Respond naturally and conversationally
2. Reference their specific financial data when relevant
3. Remember previous conversations from Firebase
4. Provide specific, actionable advice
5. Use Ghana Cedis (₵) for amounts
6. Be encouraging and supportive
7. If they ask about past transactions or conversations, use the history
8. Suggest concrete next steps

Respond in JSON format:
{
  "message": "Your conversational response here",
  "suggestions": ["suggestion 1", "suggestion 2"],
  "insights": ["insight 1", "insight 2"],
  "actionRequired": false
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    let aiResponse: AIResponse;

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      aiResponse = {
        message: parsed.message || text,
        suggestions: parsed.suggestions || [],
        insights: parsed.insights || [],
        actionRequired: parsed.actionRequired || false,
      };
    } else {
      aiResponse = {
        message: text,
        suggestions: [],
        insights: [],
        actionRequired: false,
      };
    }

    // Save conversation to Firebase
    await saveConversation({
      uid: context.uid,
      userMessage,
      aiResponse: aiResponse.message,
      context: {
        page: context.page,
        balance: context.balance,
        recentTransactions: context.transactions.length,
      },
      timestamp: new Date(),
    });

    // Save insights to Firebase if any
    if (aiResponse.insights && aiResponse.insights.length > 0) {
      for (const insight of aiResponse.insights) {
        await saveInsight({
          uid: context.uid,
          type: 'tip',
          message: insight,
          acknowledged: false,
          timestamp: new Date(),
        });
      }
    }

    return aiResponse;
  } catch (error) {
    console.error('Gemini AI Error:', error);
    
    return {
      message: "I'm having trouble connecting right now. Please try again in a moment.",
      suggestions: ['Check your internet connection', 'Try refreshing the page'],
      insights: [],
      actionRequired: false,
    };
  }
};

/**
 * Get proactive AI suggestions based on user's financial state
 */
export const getProactiveSuggestions = async (
  uid: string,
  balance: number,
  income: number,
  expenses: number,
  transactions: Transaction[],
  budgets: Budget[]
): Promise<string[]> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const conversationHistory = await buildAIContext(uid);
    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

    const prompt = `Based on this user's financial data, provide 3 proactive suggestions:

Balance: ${formatCurrency(balance)}
Income: ${formatCurrency(income)}
Expenses: ${formatCurrency(expenses)}
Savings Rate: ${savingsRate.toFixed(1)}%
Transactions: ${transactions.length}
Budgets: ${budgets.length}

Previous Context:
${conversationHistory}

Return only a JSON array of 3 short, actionable suggestions:
["suggestion 1", "suggestion 2", "suggestion 3"]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return [
      'Review your spending patterns',
      'Set up a monthly budget',
      'Track your expenses regularly',
    ];
  } catch (error) {
    console.error('Proactive Suggestions Error:', error);
    return [];
  }
};

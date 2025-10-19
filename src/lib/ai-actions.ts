// AI Action Executor - AI can control the app

import { GoogleGenAI } from '@google/genai';
import { addTransaction, setBudget, addTodo } from './firebase-service';
import { Transaction, Budget } from './types';

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '' });

export type AIActionType = 
  | 'create_budget'
  | 'add_transaction'
  | 'delete_transaction'
  | 'edit_transaction'
  | 'delete_budget'
  | 'edit_budget'
  | 'view_report'
  | 'set_goal'
  | 'create_todo'
  | 'delete_todo'
  | 'edit_todo'
  | 'none';

export interface AIAction {
  type: AIActionType;
  data?: any;
  confirmation?: string;
  needsConfirmation: boolean;
}

export interface AIActionResponse {
  message: string;
  action?: AIAction;
  success: boolean;
}

/**
 * Detect user intent and extract action data
 */
export const detectIntent = async (
  userMessage: string,
  context: {
    uid: string;
    balance: number;
    income: number;
  }
): Promise<AIAction> => {
  const lowerMessage = userMessage.toLowerCase();
  
  // Question keywords - if message contains these, it's likely a question, not an action
  const questionKeywords = ['how', 'what', 'can i', 'should i', 'help me', 'advice', 'suggest', 'recommend', 'tips'];
  const isQuestion = questionKeywords.some(k => lowerMessage.includes(k));
  
  // If it's a question, don't trigger actions
  if (isQuestion) {
    return {
      type: 'none',
      needsConfirmation: false,
    };
  }
  
  // ACTION keywords - must be clear action intent
  const createBudgetKeywords = ['set budget', 'create budget', 'make budget', 'add budget'];
  const createTodoKeywords = ['plan to', 'need to pay', 'upcoming expense', 'remind me to pay', 'add todo', 'add a todo', 'create todo', 'create a todo', 'plan expense', 'need to buy', 'have to pay', 'todo for'];
  
  // Edit and Delete keywords
  const editTransactionKeywords = ['edit transaction', 'change transaction', 'update transaction', 'modify transaction', 'fix transaction'];
  const deleteTransactionKeywords = ['delete transaction', 'remove transaction', 'delete the', 'remove the'];
  const deleteTodoKeywords = ['delete todo', 'remove todo', 'cancel todo', 'delete planned expense'];
  
  // Transaction keywords - much broader detection!
  const incomeKeywords = ['received', 'got', 'earned', 'gave me', 'paid me', 'salary', 'bonus', 'add income', 'record income', 'to my income', 'to income', 'add to income'];
  const expenseKeywords = ['spent', 'paid', 'bought', 'cost', 'expense', 'purchase', 'add expense', 'record expense'];
  const reportKeywords = ['show report', 'view analytics', 'open analytics'];
  
  // Check if message contains numbers (likely a transaction)
  const hasAmount = /\d+/.test(lowerMessage);
  
  // Check for create budget ACTION (not question)
  if (createBudgetKeywords.some(k => lowerMessage.includes(k))) {
    return {
      type: 'create_budget',
      data: await parseNaturalLanguage(userMessage),
      needsConfirmation: true,
      confirmation: 'Create a budget',
    };
  }

  // Check for create TODO (planned expense) - amount not required
  if (createTodoKeywords.some(k => lowerMessage.includes(k))) {
    return {
      type: 'create_todo',
      data: await parseNaturalLanguage(userMessage),
      needsConfirmation: false,
      confirmation: 'Add to planned expenses',
    };
  }

  // Check for DELETE TRANSACTION
  if (deleteTransactionKeywords.some(k => lowerMessage.includes(k))) {
    return {
      type: 'delete_transaction',
      data: { userMessage },
      needsConfirmation: true,
      confirmation: 'Delete transaction',
    };
  }

  // Check for EDIT TRANSACTION
  if (editTransactionKeywords.some(k => lowerMessage.includes(k))) {
    return {
      type: 'edit_transaction',
      data: { userMessage },
      needsConfirmation: true,
      confirmation: 'Edit transaction',
    };
  }

  // Check for DELETE TODO
  if (deleteTodoKeywords.some(k => lowerMessage.includes(k))) {
    return {
      type: 'delete_todo',
      data: { userMessage },
      needsConfirmation: true,
      confirmation: 'Delete planned expense',
    };
  }
  
  // Check for INCOME transaction
  if (hasAmount && incomeKeywords.some(k => lowerMessage.includes(k))) {
    return {
      type: 'add_transaction',
      data: await parseNaturalLanguage(userMessage),
      needsConfirmation: false, // Auto-add since it's clear intent
      confirmation: 'Add this income',
    };
  }
  
  // Check for EXPENSE transaction
  if (hasAmount && expenseKeywords.some(k => lowerMessage.includes(k))) {
    return {
      type: 'add_transaction',
      data: await parseNaturalLanguage(userMessage),
      needsConfirmation: false, // Auto-add since it's clear intent
      confirmation: 'Add this expense',
    };
  }
  
  // Check for view report
  if (reportKeywords.some(k => lowerMessage.includes(k))) {
    return {
      type: 'view_report',
      needsConfirmation: false,
    };
  }
  
  // Default: just conversation
  return {
    type: 'none',
    needsConfirmation: false,
  };
};

/**
 * Execute AI-detected action
 */
export const executeAction = async (
  action: AIAction,
  uid: string
): Promise<AIActionResponse> => {
  try {
    switch (action.type) {
      case 'create_budget':
        return await createBudgetFromAI(action.data, uid);
      
      case 'add_transaction':
        return await addTransactionFromAI(action.data, uid);
      
      case 'create_todo':
        return await createTodoFromAI(action.data, uid);
      
      case 'delete_transaction':
        return {
          message: "To delete a specific transaction, please go to the Recent Transactions section on your dashboard and click the delete icon (🗑️) next to the transaction you want to remove. I can't identify specific transactions from your description alone.",
          success: false,
        };
      
      case 'edit_transaction':
        return {
          message: "To edit a transaction, please go to the Recent Transactions section on your dashboard and click the edit icon (✏️) next to the transaction. This will let you modify the amount, category, or details.",
          success: false,
        };
      
      case 'delete_todo':
        return {
          message: "To delete a planned expense, go to the TODO page and click the delete icon (🗑️) next to the item you want to remove.",
          success: false,
        };
      
      case 'view_report':
        return {
          message: "I'll show you the reports. Navigate to the Analytics page to see detailed insights!",
          success: true,
        };
      
      case 'set_goal':
        return {
          message: `Great! I've noted your goal: ${action.data?.goal}. I'll help you track progress towards it!`,
          success: true,
        };
      
      default:
        return {
          message: "I'm not sure how to help with that action yet.",
          success: false,
        };
    }
  } catch (error) {
    console.error('Action Execution Error:', error);
    return {
      message: "Sorry, I couldn't complete that action. Please try again.",
      success: false,
    };
  }
};

/**
 * Create budget from AI command
 */
async function createBudgetFromAI(data: any, uid: string): Promise<AIActionResponse> {
  try {
    const currentDate = new Date();
    const month = data.month || currentDate.getMonth() + 1;
    const year = data.year || currentDate.getFullYear();

    const budget: Omit<Budget, 'id'> = {
      uid,
      category: data.category || 'General',
      limit: parseFloat(data.amount) || 0,
      spent: 0,
      month,
      year,
    };

    await setBudget(budget);

    return {
      message: `✅ Budget created successfully!\n\n📊 Category: ${budget.category}\n💰 Limit: ₵${budget.limit}\n📅 Period: ${month}/${year}\n\nI'll help you track your spending against this budget!`,
      success: true,
    };
  } catch (error) {
    console.error('Budget Creation Error:', error);
    return {
      message: "Sorry, I couldn't create the budget. Please try again or create it manually.",
      success: false,
    };
  }
}

/**
 * Add transaction from AI command
 */
async function addTransactionFromAI(data: any, uid: string): Promise<AIActionResponse> {
  try {
    // Validate and create date - default to current date if invalid
    let transactionDate = new Date();
    if (data.date) {
      const parsedDate = new Date(data.date);
      if (!isNaN(parsedDate.getTime())) {
        transactionDate = parsedDate;
      }
    }

    const transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> = {
      uid,
      type: data.type || 'expense',
      title: data.title || data.description || 'Transaction',
      amount: parseFloat(data.amount) || 0,
      category: data.category || 'Other',
      date: transactionDate,
      note: data.note || '',
    };

    await addTransaction(transaction);

    const emoji = transaction.type === 'income' ? '💰' : '💸';
    
    return {
      message: `${emoji} Transaction added successfully!\n\n${transaction.type === 'income' ? '📈' : '📉'} Type: ${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}\n💵 Amount: ₵${transaction.amount}\n📁 Category: ${transaction.category}\n📝 Title: ${transaction.title}\n📅 Date: ${transaction.date.toLocaleDateString()}\n\nYour balance has been updated!`,
      success: true,
    };
  } catch (error) {
    console.error('Transaction Creation Error:', error);
    return {
      message: "Sorry, I couldn't add the transaction. Please try again or add it manually.",
      success: false,
    };
  }
}

/**
 * Create TODO from AI command
 */
async function createTodoFromAI(data: any, uid: string): Promise<AIActionResponse> {
  try {
    console.log('createTodoFromAI - Received data:', data);
    
    const amount = parseFloat(data.amount) || 0;
    
    console.log('Parsed amount:', amount);
    
    // If no amount specified, ask user to provide it
    if (amount === 0) {
      console.log('Amount is 0, asking for amount');
      return {
        message: "I'd love to add that to your TODOs! 📝 But I need the amount. For example: 'Create a todo for apple and banana 200'",
        success: false,
      };
    }
    
    const todoData: any = {
      uid,
      title: data.title || data.description || 'Planned expense',
      amount: amount,
      category: data.category || 'Other',
      completed: false,
    };

    // Only add note if present
    if (data.note) {
      todoData.note = data.note;
    }

    console.log('Attempting to save TODO:', todoData);
    
    await addTodo(todoData);
    
    console.log('TODO saved successfully!');
    
    return {
      message: `📝 Added to your planned expenses!\n\n✅ TODO: ${todoData.title}\n💰 Amount: ₵${todoData.amount}\n📁 Category: ${todoData.category}\n\nCheck it off when paid, and it'll be added to your expenses automatically! 🎯`,
      success: true,
    };
  } catch (error) {
    console.error('TODO Creation Error:', error);
    return {
      message: `Sorry, I couldn't add the TODO. Error: ${error}`,
      success: false,
    };
  }
}

/**
 * Parse natural language to extract budget/transaction data
 */
export const parseNaturalLanguage = async (
  message: string
): Promise<{ category?: string; amount?: number; type?: 'income' | 'expense'; title?: string }> => {
  try {
    const prompt = `Extract structured data from this natural language message:

"${message}"

Extract:
- amount (number) - If multiple amounts mentioned, use the FIRST one only
- category (IMPORTANT: Use the EXACT category the user mentions! Can be ANYTHING: Gym, Haircut, Netflix, Gifts, Uber, etc. If no specific category mentioned, use a general one like Food, Transport, Shopping, Bills, Entertainment, Healthcare, Education, Salary, Freelance, Investment, Gift, or Other)
- type (income or expense)
- title/description

IMPORTANT: Return a SINGLE JSON object, NOT an array!

Return JSON:
{
  "amount": 100,
  "category": "Lunch",
  "type": "expense",
  "title": "Lunch at restaurant"
}

Examples:
"50 for gym membership" → category: "Gym"
"paid 200 for haircut" → category: "Haircut"  
"bought netflix 15" → category: "Netflix"
"uber ride 30" → category: "Uber"
"spent 100 on gifts" → category: "Gifts"
"bought light 20" → category: "Light"`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    const text = response.text || "";

    // Try to match both single object and array
    const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // If it's an array, return the first item (we'll handle multiple transactions later)
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log('Multiple transactions detected, using first one:', parsed[0]);
          return parsed[0];
        }
        
        return parsed;
      } catch (jsonError) {
        console.error('JSON Parse Error:', jsonError);
        console.log('Raw text:', text);
        return {};
      }
    }

    return {};
  } catch (error) {
    console.error('Parsing Error:', error);
    return {};
  }
};

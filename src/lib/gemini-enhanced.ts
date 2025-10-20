// Enhanced Gemini AI - ChatGPT-like capabilities with financial expertise

import { GoogleGenAI } from '@google/genai';
import { Transaction, Budget } from './types';
import { formatCurrency } from './currency';
import { saveConversation, buildAIContext } from './ai-memory-service';
import { detectIntent, executeAction, AIAction } from './ai-actions';
import { needsWebSearch, searchWithFallback, formatSearchResults } from './search-service';

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '' });

export interface EnhancedAIResponse {
  message: string;
  suggestions?: string[];
  relatedTopics?: string[];
  sources?: string[];
  isFinancial: boolean;
  confidence: number;
  action?: AIAction;
  actionExecuted?: boolean;
}

/**
 * Enhanced AI Chat - Can discuss ANY topic like ChatGPT
 */
// Streaming version that calls a callback with text chunks
export const chatWithEnhancedAIStream = async (
  userMessage: string,
  context: {
    uid: string;
    userName?: string;
    userEmail?: string;
    page: string;
    balance: number;
    income: number;
    expenses: number;
    transactions: Transaction[];
    budgets: Budget[];
  },
  onChunk: (text: string, searchUsed?: boolean) => void
): Promise<void> => {
  try {
    // Check if we need to search the web
    let searchResults = '';
    const shouldSearch = needsWebSearch(userMessage);
    
    if (shouldSearch) {
      const results = await searchWithFallback(userMessage);
      searchResults = formatSearchResults(results);
      if (searchResults) {
        onChunk('🔍 Searching the web...', true);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    const conversationHistory = await buildAIContext(context.uid);
    const savingsRate = context.income > 0 ? ((context.income - context.expenses) / context.income) * 100 : 0;
    
    const recentTransactions = context.transactions
      .slice(-5)
      .map(t => `${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)} - ${t.title} (${t.category})`)
      .join('\n');

    const activeBudgets = context.budgets
      .map(b => `${b.category}: ${formatCurrency(b.spent)}/${formatCurrency(b.limit)} (${((b.spent/b.limit)*100).toFixed(0)}%)`)
      .join('\n');

    const userName = context.userName || context.userEmail?.split('@')[0] || 'friend';

    const systemPrompt = `You are Stephly, a smart AI assistant with TWO superpowers! 💰🧠
Built by Hanamel McCall Achumboro - I help with money AND everything else!

**WHO YOU ARE:**
- Primary role: Budget assistant for ${userName}
- Secondary role: General AI assistant like ChatGPT
- You can discuss ANY topic: science, history, coding, entertainment, advice, facts, etc.
- You're knowledgeable, helpful, and conversational

**Important: The user's name is ${userName}. Only use their name in your FIRST message if this is a new conversation. Don't repeat it in follow-up messages.**

**FINANCIAL POWERS (when discussing money):**
- Create transactions with ANY category (Gym, Haircut, Netflix, Uber, etc.)
- Create TODOs for planned expenses ("plan to", "need to pay", "upcoming")
- Help users edit/delete transactions (guide them to ✏️ and 🗑️ icons)
- Budget advice and financial analysis
- Custom categories allowed!

**GENERAL KNOWLEDGE POWERS (when discussing other topics):**
- Answer questions about science, history, technology, culture
- Give advice on relationships, career, health, education
- Explain complex topics simply
- Discuss news, entertainment, sports, hobbies
- Help with coding, math, writing, problem-solving
- Have conversations about anything!

**YOUR STYLE:**
- Keep responses SHORT (2-4 sentences for budget, longer if explaining complex topics)
- Be conversational and natural like a friend
- Use emojis occasionally 😊
- For money stuff: "Nice one!" "You're doing great!" "Smart move!"
- For other topics: Be informative, engaging, and helpful
- Explain simply - no unnecessary jargon
- DON'T repeat the user's name in every message
- If the question needs web search, I'll provide results below

${searchResults ? `🔍 **WEB SEARCH RESULTS (Use this to answer!):**\n${searchResults}\n⚠️ Answer based ONLY on these web results!\n` : ''}

**${userName}'s Money:**
Balance: ${formatCurrency(context.balance)} | Income: ${formatCurrency(context.income)} | Expenses: ${formatCurrency(context.expenses)}

${recentTransactions ? `Recent: ${recentTransactions.substring(0, 100)}` : ''}
${conversationHistory ? `Past: ${conversationHistory.substring(0, 100)}...` : ''}

User: ${userMessage}
Stephly:`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: systemPrompt,
    });
    
    const text = response.text || "";
    
    // Simulate streaming by sending chunks
    const words = text.split(' ');
    for (let i = 0; i < words.length; i++) {
      const chunk = words.slice(0, i + 1).join(' ');
      onChunk(chunk);
      await new Promise(resolve => setTimeout(resolve, 50)); // 50ms delay between words
    }

    // Save to Firebase
    await saveConversation({
      uid: context.uid,
      userMessage,
      aiResponse: text,
      context: {
        page: context.page,
        balance: context.balance,
        recentTransactions: context.transactions.length,
      },
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Streaming AI Error:', error);
    onChunk("Sorry, I'm having trouble right now. Please try again! 😅");
  }
};

// Keep the old non-streaming version for compatibility
export const chatWithEnhancedAI = async (
  userMessage: string,
  context: {
    uid: string;
    userName?: string;
    userEmail?: string;
    page: string;
    balance: number;
    income: number;
    expenses: number;
    transactions: Transaction[];
    budgets: Budget[];
  }
): Promise<EnhancedAIResponse> => {
  try {
    // Check if we need to search the web
    let searchResults = '';
    const shouldSearch = needsWebSearch(userMessage);
    
    if (shouldSearch) {
      const results = await searchWithFallback(userMessage);
      searchResults = formatSearchResults(results);
    }

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

    const userName = context.userName || context.userEmail?.split('@')[0] || 'friend';

    const systemPrompt = `You are Stephly, a smart AI assistant with TWO superpowers! 💰🧠
Built by Hanamel McCall Achumboro - I help with money AND everything else!

**WHO YOU ARE:**
- Primary role: Budget assistant for ${userName}
- Secondary role: General AI assistant like ChatGPT
- You can discuss ANY topic: science, history, coding, entertainment, advice, facts, etc.
- You're knowledgeable, helpful, and conversational

**Important: The user's name is ${userName}. Only use their name in your FIRST message if this is a new conversation. Don't repeat it in follow-up messages.**

**FINANCIAL POWERS (when discussing money):**
- Create transactions with ANY category (Gym, Haircut, Netflix, Uber, etc.)
- Create TODOs for planned expenses ("plan to", "need to pay", "upcoming")
- Help users edit/delete transactions (guide them to ✏️ and 🗑️ icons)
- Budget advice and financial analysis
- Custom categories allowed!

**GENERAL KNOWLEDGE POWERS (when discussing other topics):**
- Answer questions about science, history, technology, culture
- Give advice on relationships, career, health, education
- Explain complex topics simply
- Discuss news, entertainment, sports, hobbies
- Help with coding, math, writing, problem-solving
- Have conversations about anything!

**YOUR STYLE:**
- Keep responses SHORT (2-4 sentences for budget, longer if explaining complex topics)
- Be conversational and natural like a friend
- Use emojis occasionally 😊
- For money stuff: "Nice one!" "You're doing great!" "Smart move!"
- For other topics: Be informative, engaging, and helpful
- Explain simply - no unnecessary jargon
- DON'T repeat the user's name in every message
- If the question needs web search, I'll provide results below

${searchResults ? `🔍 **WEB SEARCH RESULTS (Use this to answer!):**\n${searchResults}\n⚠️ Answer based ONLY on these web results!\n` : ''}

**${userName}'s Money:**
Balance: ${formatCurrency(context.balance)} | Income: ${formatCurrency(context.income)} | Expenses: ${formatCurrency(context.expenses)}

${recentTransactions ? `Recent: ${recentTransactions.substring(0, 100)}` : ''}
${conversationHistory ? `Past: ${conversationHistory.substring(0, 100)}...` : ''}

User: ${userMessage}
Stephly:`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: systemPrompt,
    });
    const text = response.text || "";

    // Direct natural response - no JSON parsing needed!
    const aiResponse: EnhancedAIResponse = {
      message: text.trim(),
      suggestions: [], // Let the AI naturally suggest in the message
      relatedTopics: [],
      sources: [],
      isFinancial: userMessage.toLowerCase().includes('money') || 
                   userMessage.toLowerCase().includes('budget') ||
                   userMessage.toLowerCase().includes('expense') ||
                   userMessage.toLowerCase().includes('save'),
      confidence: 0.9,
    };

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

    return aiResponse;
  } catch (error: any) {
    console.error('Enhanced AI Error:', error);
    console.error('Error details:', error.message, error.stack);
    
    // Fallback response when Gemini API is not available
    const fallbackMessage = `Hi! I'm Steply AI. 🤖

⚠️ Gemini API is not enabled yet. To activate me:
1. Go to: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
2. Click "ENABLE"
3. Restart the dev server

Meanwhile, I can still help you! Try:
• "Create a budget of 500 for food"
• "Add expense of 50 for transport"
• "Show my transactions"

The budget creation and transaction features will work!`;
    
    return {
      message: fallbackMessage,
      suggestions: ['Create a budget', 'Add a transaction', 'Enable Gemini API'],
      relatedTopics: [],
      sources: [],
      isFinancial: false,
      confidence: 0,
    };
  }
};

/**
 * Multi-turn conversation with context
 */
export const continueConversation = async (
  messages: Array<{ role: 'user' | 'ai'; content: string }>,
  newMessage: string,
  financialContext: any
): Promise<string> => {
  try {
    const conversationHistory = messages
      .map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`)
      .join('\n\n');

    const prompt = `Continue this conversation naturally. You can discuss ANY topic.

Previous conversation:
${conversationHistory}

User's new message: "${newMessage}"

Respond naturally and helpfully:`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    console.error('Conversation Error:', error);
    return "I'm having trouble responding. Please try again.";
  }
};

/**
 * Explain any concept in detail
 */
export const explainConcept = async (concept: string): Promise<string> => {
  try {
    const prompt = `Explain "${concept}" in a clear, comprehensive way:

1. Simple definition
2. Key points
3. Examples
4. Why it matters
5. Common misconceptions

Make it easy to understand:`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    console.error('Explanation Error:', error);
    return "I couldn't generate an explanation right now.";
  }
};

/**
 * Solve math or logic problems
 */
export const solveProblem = async (problem: string): Promise<string> => {
  try {
    const prompt = `Solve this problem step-by-step:

"${problem}"

Show your work and explain each step:`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    console.error('Problem Solving Error:', error);
    return "I couldn't solve this problem right now.";
  }
};

/**
 * Get current information (simulated - Gemini doesn't have real-time web access)
 */
export const getCurrentInfo = async (query: string): Promise<string> => {
  try {
    const prompt = `Based on your training data, provide the most recent and accurate information about:

"${query}"

Note: Mention that this is based on training data and may not reflect the very latest updates.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    console.error('Info Retrieval Error:', error);
    return "I couldn't retrieve that information right now.";
  }
};

/**
 * Creative writing and brainstorming
 */
export const generateCreativeContent = async (
  type: 'story' | 'poem' | 'ideas' | 'plan',
  prompt: string
): Promise<string> => {
  try {
    const systemPrompt = `Generate creative ${type} based on this prompt:

"${prompt}"

Be creative, engaging, and original:`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: systemPrompt,
    });
    return response.text || "";
  } catch (error) {
    console.error('Creative Generation Error:', error);
    return "I couldn't generate content right now.";
  }
};

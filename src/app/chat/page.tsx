'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Send, Loader2, Plus, History, X, TrendingUp } from 'lucide-react';
import { chatWithEnhancedAIStream } from '@/lib/gemini-enhanced';
import { detectIntent, executeAction } from '@/lib/ai-actions';
import { BottomNav } from '@/components/BottomNav';
import { getTransactions, getBudgets } from '@/lib/firebase-service';
import { useThemeColor, themeColors } from '@/contexts/ThemeColorContext';
import { Transaction, Budget } from '@/lib/types';
import { Calculator } from '@/components/Calculator';
import { CurrencyConverter } from '@/components/CurrencyConverter';
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ChatPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { themeColor } = useThemeColor();
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai'; content: string; timestamp: Date }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showConverter, setShowConverter] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{
    id: string;
    preview: string;
    timestamp: Date;
  }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isProcessingRef = useRef(false); // Prevent duplicate sends

  const [stats, setStats] = useState({
    totalBalance: 0,
    totalIncome: 0,
    totalExpenses: 0,
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Clear input and reset state when component mounts
    setInput('');
    isProcessingRef.current = false;

    // Load user data and conversation history
    const loadData = async () => {
      const [transactionsData, budgetsData] = await Promise.all([
        getTransactions(user.uid),
        getBudgets(user.uid, new Date().getMonth() + 1, new Date().getFullYear()),
      ]);

      setTransactions(transactionsData);
      setBudgets(budgetsData);

      // Calculate stats
      const income = transactionsData.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expenses = transactionsData.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      
      setStats({
        totalBalance: income - expenses,
        totalIncome: income,
        totalExpenses: expenses,
      });

      // Check if this is a new chat session
      const isNewSession = typeof window !== 'undefined' && localStorage.getItem('chat-session') === 'new';
      
      // Load conversation history from Firebase
      try {
        const conversationsRef = collection(db, 'ai_conversations');
        const q = query(
          conversationsRef, 
          where('uid', '==', user.uid),
          orderBy('timestamp', 'desc'), 
          limit(50)
        );
        const snapshot = await getDocs(q);
        
        const history: Array<{ role: 'user' | 'ai'; content: string; timestamp: Date }> = [];
        const sessionsList: Array<{ id: string; preview: string; timestamp: Date }> = [];
        
        snapshot.forEach(doc => {
          const data = doc.data();
          
          // Add to conversation list (always load for History sidebar)
          sessionsList.push({
            id: doc.id,
            preview: data.userMessage.substring(0, 50) + (data.userMessage.length > 50 ? '...' : ''),
            timestamp: data.timestamp?.toDate() || new Date(),
          });
          
          // Only add to messages if NOT a new session
          if (!isNewSession && history.length < 40) { // 20 conversations = 40 messages
            const baseTimestamp = data.timestamp?.toDate() || new Date();
            // User message comes first (base timestamp)
            history.push({
              role: 'user',
              content: data.userMessage,
              timestamp: baseTimestamp,
            });
            // AI response comes after (add 1 second to ensure proper ordering)
            const aiTimestamp = new Date(baseTimestamp.getTime() + 1000);
            history.push({
              role: 'ai',
              content: data.aiResponse,
              timestamp: aiTimestamp,
            });
          }
        });
        
        // Reverse history to show oldest first (chronological order)
        // If new session, messages will be empty array
        setMessages(history.reverse());
        setConversationHistory(sessionsList);
      } catch (error) {
        console.error('Error loading conversation history:', error);
      }
    };

    loadData();
  }, [user, router]);

  const scrollToBottom = () => {
    // Use timeout to ensure DOM has updated
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Also scroll when streaming
  useEffect(() => {
    if (streaming) {
      scrollToBottom();
    }
  }, [streaming]);

  // Scroll to bottom when page loads with existing messages
  useEffect(() => {
    if (messages.length > 0) {
      // Force immediate scroll on mount
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
      }, 200);
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || !user || loading || isProcessingRef.current) return;

    // Prevent duplicate sends
    isProcessingRef.current = true;
    
    const userMessage = input.trim();
    setInput('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = '48px';
    }
    
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }]);
    setLoading(true);

    try {
      // Check if it's an action
      const intent = await detectIntent(userMessage, {
        uid: user.uid,
        balance: stats.totalBalance,
        income: stats.totalIncome,
      });

      console.log('Intent detected:', intent.type, intent);

      if (intent.type !== 'none') {
        console.log('Executing action:', intent.type);
        const actionResult = await executeAction(intent, user.uid);
        console.log('Action result:', actionResult);
        setMessages(prev => [...prev, { 
          role: 'ai', 
          content: actionResult.message,
          timestamp: new Date() 
        }]);
        
        // Refresh data after action
        if (actionResult.success) {
          const [transactionsData, budgetsData] = await Promise.all([
            getTransactions(user.uid),
            getBudgets(user.uid, new Date().getMonth() + 1, new Date().getFullYear()),
          ]);

          setTransactions(transactionsData);
          setBudgets(budgetsData);

          const income = transactionsData.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
          const expenses = transactionsData.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
          
          setStats({
            totalBalance: income - expenses,
            totalIncome: income,
            totalExpenses: expenses,
          });
        }
        
        setLoading(false);
        return;
      }

      // Streaming chat - text appears word by word!
      const aiMessageId = Date.now();
      
      // Add empty AI message that will update
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: '',
        timestamp: new Date() 
      }]);
      
      setStreaming(true);

      await chatWithEnhancedAIStream(
        userMessage,
        {
          uid: user.uid,
          userName: user.displayName || undefined,
          userEmail: user.email || undefined,
          page: 'Chat',
          balance: stats.totalBalance,
          income: stats.totalIncome,
          expenses: stats.totalExpenses,
          transactions,
          budgets,
        },
        (chunk) => {
          // Update the last message with new chunk
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: 'ai',
              content: chunk,
              timestamp: new Date()
            };
            return updated;
          });
        }
      );
      
      setStreaming(false);
      
      // Mark session as old after first message (so it loads on refresh)
      if (typeof window !== 'undefined' && localStorage.getItem('chat-session') === 'new') {
        localStorage.setItem('chat-session', 'old');
      }
      
      // Reload conversation history after message
      try {
        const conversationsRef = collection(db, 'ai_conversations');
        const q = query(
          conversationsRef,
          where('uid', '==', user.uid),
          orderBy('timestamp', 'desc'),
          limit(50)
        );
        const snapshot = await getDocs(q);
        
        const sessionsList: Array<{ id: string; preview: string; timestamp: Date }> = [];
        
        snapshot.forEach(doc => {
          const data = doc.data();
          sessionsList.push({
            id: doc.id,
            preview: data.userMessage.substring(0, 50) + (data.userMessage.length > 50 ? '...' : ''),
            timestamp: data.timestamp?.toDate() || new Date(),
          });
        });
        
        setConversationHistory(sessionsList);
      } catch (error) {
        console.error('Error reloading history:', error);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setStreaming(false);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: "Sorry, I'm having trouble responding right now. Please try again.",
        timestamp: new Date() 
      }]);
    } finally {
      setLoading(false);
      isProcessingRef.current = false; // Allow next send
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput('');
    // Mark that this is a new chat session - don't load old history
    if (typeof window !== 'undefined') {
      localStorage.setItem('chat-session', 'new');
    }
  };

  const handleLoadConversation = async (conversationId: string) => {
    if (!user) return;
    
    try {
      const docRef = doc(db, 'ai_conversations', conversationId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const baseTimestamp = data.timestamp?.toDate() || new Date();
        const aiTimestamp = new Date(baseTimestamp.getTime() + 1000);
        setMessages([
          {
            role: 'user',
            content: data.userMessage,
            timestamp: baseTimestamp,
          },
          {
            role: 'ai',
            content: data.aiResponse,
            timestamp: aiTimestamp,
          },
        ]);
        setShowHistory(false);
        // Mark as loading old conversation
        if (typeof window !== 'undefined') {
          localStorage.setItem('chat-session', 'old');
        }
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const handleClearAllHistory = async () => {
    if (!user) return;
    
    const confirmed = window.confirm('Are you sure you want to delete all chat history? This cannot be undone.');
    if (!confirmed) return;
    
    try {
      const conversationsRef = collection(db, 'ai_conversations');
      const q = query(conversationsRef, where('uid', '==', user.uid));
      const snapshot = await getDocs(q);
      
      // Delete all conversations
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      // Clear local state
      setConversationHistory([]);
      setMessages([]);
      setShowHistory(false);
      
      alert('✅ All chat history cleared!');
    } catch (error) {
      console.error('Error clearing history:', error);
      alert('❌ Failed to clear history. Please try again.');
    }
  };

  const handleComprehensiveAnalysis = async () => {
    if (!user || loading) return;

    const analysisPrompt = `I need you to analyze MY PERSONAL financial data (don't search the web - just analyze what I'm showing you):
    
    📊 MY MONEY SITUATION:
    💰 Current Balance: ₵${stats.totalBalance.toFixed(2)}
    💵 Total Income: ₵${stats.totalIncome.toFixed(2)}
    💸 Total Expenses: ₵${stats.totalExpenses.toFixed(2)}
    📝 Number of Transactions: ${transactions.length}
    📊 Active Budgets: ${budgets.length}
    
    ${budgets.length > 0 ? `\n💼 MY BUDGETS:\n${budgets.map(b => `• ${b.category}: Spent ₵${b.spent.toFixed(2)} of ₵${b.limit.toFixed(2)} (${Math.round((b.spent/b.limit)*100)}% used)`).join('\n')}` : '📝 No budgets set yet'}
    
    ${transactions.slice(-5).length > 0 ? `\n📋 MY RECENT TRANSACTIONS:\n${transactions.slice(-5).reverse().map(t => `• ${t.type === 'income' ? '💰 Income' : '💸 Expense'}: ₵${t.amount.toFixed(2)} - ${t.category} (${t.title})`).join('\n')}` : '📝 No transactions yet'}
    
    Based on MY DATA above, give me:
    1. 🏥 My financial health score (out of 10)
    2. 📊 Analysis of my spending habits
    3. 💡 3 specific actions I should take
    4. 🎯 Budget recommendations for me
    5. 💪 Encouragement and tips
    
    Keep it SHORT and PERSONAL to MY situation!`;

    // Add user message
    setMessages(prev => [...prev, {
      role: 'user',
      content: 'Analyze my finances and give me comprehensive advice 📊',
      timestamp: new Date(),
    }]);

    // Add initial AI message
    setMessages(prev => [...prev, {
      role: 'ai',
      content: '',
      timestamp: new Date(),
    }]);

    setLoading(true);
    setStreaming(true);

    await chatWithEnhancedAIStream(
      analysisPrompt,
      {
        uid: user.uid,
        userName: user.displayName || undefined,
        userEmail: user.email || undefined,
        page: 'chat-analysis',
        balance: stats.totalBalance,
        income: stats.totalIncome,
        expenses: stats.totalExpenses,
        transactions,
        budgets,
      },
      (chunk) => {
        setMessages(prev => {
          const newMessages = [...prev];
          if (newMessages.length > 0) {
            newMessages[newMessages.length - 1] = {
              ...newMessages[newMessages.length - 1],
              content: chunk,
            };
          }
          return newMessages;
        });
      }
    );

    setLoading(false);
    setStreaming(false);
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      {/* History Sidebar */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowHistory(false)}
          />
          
          {/* Sidebar */}
          <div className="relative w-80 bg-white dark:bg-gray-800 shadow-xl overflow-y-auto">
            {/* Sidebar Header */}
            <div className="p-4 border-b sticky top-0 bg-white dark:bg-gray-800 z-10">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                  <History size={20} />
                  Chat History
                </h2>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowHistory(false)}
                >
                  <X size={20} />
                </Button>
              </div>
              {conversationHistory.length > 0 && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleClearAllHistory}
                  className="w-full"
                >
                  Clear All History
                </Button>
              )}
            </div>
            
            {/* Conversation List */}
            <div className="p-2">
              {conversationHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No conversations yet
                </div>
              ) : (
                conversationHistory.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => handleLoadConversation(conv.id)}
                    className="p-3 mb-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border border-gray-200 dark:border-gray-600 transition-colors"
                  >
                    <p className="text-sm font-medium line-clamp-2">
                      {conv.preview}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {conv.timestamp.toLocaleDateString()} {conv.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`bg-gradient-to-r ${themeColors[themeColor].primary} text-white p-4 shadow-lg flex-shrink-0`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Sparkles size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold">Stephly</h1>
                <p className="text-sm text-white/90">Your Budget Buddy 💰</p>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleComprehensiveAnalysis}
              disabled={loading}
              className="hover:bg-white/20 text-white flex-1 sm:flex-none bg-white/10"
              title="Analyze Everything"
            >
              <TrendingUp size={18} className="mr-2" />
              Analyze
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="hover:bg-white/20 text-white flex-1 sm:flex-none"
              title="Chat History"
            >
              <History size={18} className="mr-2" />
              History
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleNewChat}
              className="hover:bg-white/20 text-white flex-1 sm:flex-none"
              title="New Chat"
            >
              <Plus size={18} className="mr-2" />
              New
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 pb-40 max-w-4xl mx-auto w-full">
        {messages.length === 0 && (
          <div className="text-center py-16">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${themeColors[themeColor].primary} mb-4`}>
              <Sparkles className="text-white" size={40} />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Hey! I'm Stephly 👋</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-2">Your friendly AI budget assistant! Here's what I can do:</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              💡 I remember all our conversations & work in natural language!
            </p>
            <div className="grid grid-cols-2 gap-2 max-w-md mx-auto text-xs">
              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                <p className="font-semibold text-gray-900 dark:text-white">💸 Add expenses</p>
                <p className="text-xs opacity-60 mt-1 text-gray-600 dark:text-gray-400">"Spent 50 on food"</p>
              </div>
              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                <p className="font-semibold text-gray-900 dark:text-white">💰 Add income</p>
                <p className="text-xs opacity-60 mt-1 text-gray-600 dark:text-gray-400">"Got 500 salary"</p>
              </div>
              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                <p className="font-semibold text-gray-900 dark:text-white">📊 Create budgets</p>
                <p className="text-xs opacity-60 mt-1 text-gray-600 dark:text-gray-400">"Set food budget"</p>
              </div>
              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                <p className="font-semibold text-gray-900 dark:text-white">📝 Plan expenses</p>
                <p className="text-xs opacity-60 mt-1 text-gray-600 dark:text-gray-400">"Need to pay rent"</p>
              </div>
              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                <p className="font-semibold text-gray-900 dark:text-white">📈 Analyze finances</p>
                <p className="text-xs opacity-60 mt-1 text-gray-600 dark:text-gray-400">Click "Analyze" button</p>
              </div>
              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                <p className="font-semibold text-gray-900 dark:text-white">💡 Money advice</p>
                <p className="text-xs opacity-60 mt-1 text-gray-600 dark:text-gray-400">"How to save more?"</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-4 font-medium">
              Just chat naturally - I understand you! 🎯
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex mb-2 message-enter ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 overflow-hidden ${
                msg.role === 'user'
                  ? `bg-gradient-to-br ${themeColors[themeColor].primary} text-white`
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap leading-snug break-words overflow-wrap-anywhere">
                {msg.content}
                {msg.role === 'ai' && idx === messages.length - 1 && streaming && (
                  <span className="animate-pulse ml-1">▊</span>
                )}
              </p>
              <p className="text-xs opacity-70 mt-0.5">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {loading && !streaming && (
          <div className="flex justify-start mb-2">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Stephly is typing</span>
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input - Fixed at bottom */}
      <div className="fixed bottom-16 left-0 right-0 border-t bg-white dark:bg-gray-900 p-4 flex-shrink-0 z-10">
        <div className="max-w-4xl mx-auto flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your message... 💬"
            disabled={loading}
            rows={1}
            className="flex-1 min-h-[48px] max-h-[200px] px-4 py-3 text-base rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none overflow-y-auto focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            style={{
              height: 'auto',
              minHeight: '48px',
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 200) + 'px';
            }}
          />
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className={`h-12 px-6 bg-gradient-to-r ${themeColors[themeColor].primary} flex-shrink-0 
              transition-all duration-200 
              ${!loading && input.trim() ? 'hover:scale-105 hover:shadow-lg active:scale-95' : ''} 
              ${loading ? 'animate-pulse opacity-70' : themeColors[themeColor].hover}`}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Send size={20} />
            )}
          </Button>
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

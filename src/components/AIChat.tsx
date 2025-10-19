'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Send, X, Minimize2, Maximize2, Loader2 } from 'lucide-react';
import { chatWithAI, AIResponse } from '@/lib/gemini-context';
import { useAuth } from '@/contexts/AuthContext';
import { Transaction, Budget } from '@/lib/types';

interface AIChatProps {
  balance: number;
  income: number;
  expenses: number;
  transactions: Transaction[];
  budgets: Budget[];
  currentPage: string;
}

export const AIChat = ({ balance, income, expenses, transactions, budgets, currentPage }: AIChatProps) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai'; content: string; timestamp: Date }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !user) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }]);
    setLoading(true);

    try {
      const response = await chatWithAI(userMessage, {
        uid: user.uid,
        page: currentPage,
        balance,
        income,
        expenses,
        transactions,
        budgets,
      });

      // Add AI response
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: response.message,
        timestamp: new Date() 
      }]);

      // Add suggestions if any
      if (response.suggestions && response.suggestions.length > 0) {
        const suggestionsText = '💡 Suggestions:\n' + response.suggestions.map(s => `• ${s}`).join('\n');
        setMessages(prev => [...prev, { 
          role: 'ai', 
          content: suggestionsText,
          timestamp: new Date() 
        }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: "Sorry, I'm having trouble responding right now. Please try again.",
        timestamp: new Date() 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-2xl z-40 bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
        size="icon"
      >
        <Sparkles size={24} />
      </Button>
    );
  }

  return (
    <Card className={`fixed ${isMinimized ? 'bottom-24 right-4 w-80' : 'bottom-24 right-4 w-96 h-[500px]'} z-40 shadow-2xl border-2 border-purple-200 dark:border-purple-800 flex flex-col`}>
      <CardHeader className="flex flex-row items-center justify-between pb-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <Sparkles size={20} />
          <CardTitle className="text-lg font-bold">Steply AI</CardTitle>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-white/20 text-white h-8 w-8"
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsOpen(false)}
            className="hover:bg-white/20 text-white h-8 w-8"
          >
            <X size={16} />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <Sparkles className="mx-auto mb-2" size={32} />
                <p className="text-sm">Ask me anything about your finances!</p>
                <p className="text-xs mt-2">I remember all our conversations 💭</p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <Loader2 className="animate-spin" size={20} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </CardContent>

          <div className="p-4 border-t bg-white dark:bg-gray-900">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your finances..."
                disabled={loading}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                <Send size={18} />
              </Button>
            </div>
          </div>
        </>
      )}

      {isMinimized && (
        <CardContent className="p-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Click to expand chat
        </CardContent>
      )}
    </Card>
  );
};

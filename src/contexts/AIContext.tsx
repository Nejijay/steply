'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Transaction, Budget } from '@/lib/types';

interface AIMemory {
  conversations: AIConversation[];
  userPreferences: {
    financialGoals?: string[];
    riskTolerance?: 'low' | 'medium' | 'high';
    savingsTarget?: number;
  };
  insights: AIInsight[];
  lastUpdated: Date;
}

interface AIConversation {
  id: string;
  timestamp: Date;
  userMessage: string;
  aiResponse: string;
  context: {
    page: string;
    balance: number;
    recentTransactions: number;
  };
}

interface AIInsight {
  id: string;
  type: 'warning' | 'tip' | 'achievement' | 'suggestion';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

interface AIContextType {
  memory: AIMemory;
  addConversation: (conversation: Omit<AIConversation, 'id'>) => void;
  addInsight: (insight: Omit<AIInsight, 'id' | 'timestamp' | 'acknowledged'>) => void;
  acknowledgeInsight: (id: string) => void;
  getFullContext: () => string;
  clearMemory: () => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [memory, setMemory] = useState<AIMemory>({
    conversations: [],
    userPreferences: {},
    insights: [],
    lastUpdated: new Date(),
  });

  // Load memory from localStorage
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`ai_memory_${user.uid}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setMemory({
          ...parsed,
          conversations: parsed.conversations.map((c: any) => ({
            ...c,
            timestamp: new Date(c.timestamp),
          })),
          insights: parsed.insights.map((i: any) => ({
            ...i,
            timestamp: new Date(i.timestamp),
          })),
          lastUpdated: new Date(parsed.lastUpdated),
        });
      }
    }
  }, [user]);

  // Save memory to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(`ai_memory_${user.uid}`, JSON.stringify(memory));
    }
  }, [memory, user]);

  const addConversation = (conversation: Omit<AIConversation, 'id'>) => {
    const newConversation: AIConversation = {
      ...conversation,
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    setMemory((prev) => ({
      ...prev,
      conversations: [...prev.conversations.slice(-50), newConversation], // Keep last 50
      lastUpdated: new Date(),
    }));
  };

  const addInsight = (insight: Omit<AIInsight, 'id' | 'timestamp' | 'acknowledged'>) => {
    const newInsight: AIInsight = {
      ...insight,
      id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      acknowledged: false,
    };

    setMemory((prev) => ({
      ...prev,
      insights: [...prev.insights, newInsight],
      lastUpdated: new Date(),
    }));
  };

  const acknowledgeInsight = (id: string) => {
    setMemory((prev) => ({
      ...prev,
      insights: prev.insights.map((i) =>
        i.id === id ? { ...i, acknowledged: true } : i
      ),
    }));
  };

  const getFullContext = (): string => {
    const recentConversations = memory.conversations.slice(-10);
    const unacknowledgedInsights = memory.insights.filter((i) => !i.acknowledged);

    return `
AI Memory Context:
- Total Conversations: ${memory.conversations.length}
- Recent Conversations: ${recentConversations.length}
- Active Insights: ${unacknowledgedInsights.length}
- User Preferences: ${JSON.stringify(memory.userPreferences)}

Recent Conversation History:
${recentConversations
  .map(
    (c) =>
      `[${c.context.page}] User: ${c.userMessage}\nAI: ${c.aiResponse.substring(0, 100)}...`
  )
  .join('\n\n')}

Active Insights:
${unacknowledgedInsights.map((i) => `- [${i.type}] ${i.message}`).join('\n')}
    `.trim();
  };

  const clearMemory = () => {
    setMemory({
      conversations: [],
      userPreferences: {},
      insights: [],
      lastUpdated: new Date(),
    });
    if (user) {
      localStorage.removeItem(`ai_memory_${user.uid}`);
    }
  };

  return (
    <AIContext.Provider
      value={{
        memory,
        addConversation,
        addInsight,
        acknowledgeInsight,
        getFullContext,
        clearMemory,
      }}
    >
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

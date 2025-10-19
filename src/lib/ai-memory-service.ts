// Firebase-based AI Memory Service

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  addDoc,
  updateDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

export interface AIConversation {
  id?: string;
  uid: string;
  timestamp: Date;
  userMessage: string;
  aiResponse: string;
  context: {
    page: string;
    balance: number;
    recentTransactions: number;
  };
}

export interface AIInsight {
  id?: string;
  uid: string;
  type: 'warning' | 'tip' | 'achievement' | 'suggestion';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

export interface AIMemory {
  uid: string;
  userPreferences: {
    financialGoals?: string[];
    riskTolerance?: 'low' | 'medium' | 'high';
    savingsTarget?: number;
  };
  lastUpdated: Date;
}

/**
 * Save AI conversation to Firestore
 */
export const saveConversation = async (conversation: Omit<AIConversation, 'id'>): Promise<string> => {
  const conversationData = {
    ...conversation,
    timestamp: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, 'ai_conversations'), conversationData);
  return docRef.id;
};

/**
 * Get user's conversation history
 */
export const getConversationHistory = async (
  uid: string,
  limitCount: number = 20
): Promise<AIConversation[]> => {
  const q = query(
    collection(db, 'ai_conversations'),
    where('uid', '==', uid),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      uid: data.uid,
      userMessage: data.userMessage,
      aiResponse: data.aiResponse,
      context: data.context,
      timestamp: data.timestamp?.toDate() || new Date(),
    };
  }).reverse(); // Reverse to get chronological order
};

/**
 * Save AI insight
 */
export const saveInsight = async (insight: Omit<AIInsight, 'id'>): Promise<string> => {
  const insightData = {
    ...insight,
    timestamp: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, 'ai_insights'), insightData);
  return docRef.id;
};

/**
 * Get user's insights
 */
export const getInsights = async (
  uid: string,
  onlyUnacknowledged: boolean = false
): Promise<AIInsight[]> => {
  let q = query(
    collection(db, 'ai_insights'),
    where('uid', '==', uid),
    orderBy('timestamp', 'desc'),
    limit(50)
  );

  if (onlyUnacknowledged) {
    q = query(
      collection(db, 'ai_insights'),
      where('uid', '==', uid),
      where('acknowledged', '==', false),
      orderBy('timestamp', 'desc')
    );
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      uid: data.uid,
      type: data.type,
      message: data.message,
      acknowledged: data.acknowledged,
      timestamp: data.timestamp?.toDate() || new Date(),
    };
  });
};

/**
 * Acknowledge an insight
 */
export const acknowledgeInsight = async (insightId: string): Promise<void> => {
  await updateDoc(doc(db, 'ai_insights', insightId), {
    acknowledged: true,
  });
};

/**
 * Save/Update AI memory (user preferences)
 */
export const saveAIMemory = async (memory: AIMemory): Promise<void> => {
  const memoryData = {
    ...memory,
    lastUpdated: serverTimestamp(),
  };

  await setDoc(doc(db, 'ai_memory', memory.uid), memoryData);
};

/**
 * Get AI memory
 */
export const getAIMemory = async (uid: string): Promise<AIMemory | null> => {
  const docRef = doc(db, 'ai_memory', uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      uid: data.uid,
      userPreferences: data.userPreferences || {},
      lastUpdated: data.lastUpdated?.toDate() || new Date(),
    };
  }

  return null;
};

/**
 * Build full context string for AI from Firebase data
 */
export const buildAIContext = async (uid: string): Promise<string> => {
  const [conversations, insights, memory] = await Promise.all([
    getConversationHistory(uid, 10),
    getInsights(uid, true),
    getAIMemory(uid),
  ]);

  const conversationSummary = conversations
    .map(c => `[${c.context.page}] User: ${c.userMessage}\nAI: ${c.aiResponse.substring(0, 100)}...`)
    .join('\n\n');

  const insightsSummary = insights
    .map(i => `- [${i.type}] ${i.message}`)
    .join('\n');

  return `
Previous Conversations (${conversations.length}):
${conversationSummary || 'No previous conversations'}

Active Insights (${insights.length}):
${insightsSummary || 'No active insights'}

User Preferences:
${JSON.stringify(memory?.userPreferences || {}, null, 2)}
  `.trim();
};

/**
 * Clear all AI data for a user
 */
export const clearAIData = async (uid: string): Promise<void> => {
  // Note: This is a simple implementation
  // In production, you'd want to use batch operations or Cloud Functions
  const conversationsQuery = query(
    collection(db, 'ai_conversations'),
    where('uid', '==', uid)
  );
  
  const insightsQuery = query(
    collection(db, 'ai_insights'),
    where('uid', '==', uid)
  );

  const [convSnapshot, insightSnapshot] = await Promise.all([
    getDocs(conversationsQuery),
    getDocs(insightsQuery),
  ]);

  // Delete conversations and insights
  // Note: Firestore doesn't support batch deletes in client SDK
  // This is just a placeholder - implement with Cloud Functions for production
  console.log(`Would delete ${convSnapshot.size} conversations and ${insightSnapshot.size} insights`);
};

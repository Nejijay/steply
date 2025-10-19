import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile, Transaction, Budget } from './types';

// Authentication functions
export const signUp = async (email: string, password: string, name: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await updateProfile(user, { displayName: name });

  // Create user profile in Firestore
  const userProfile: UserProfile = {
    uid: user.uid,
    name,
    email: user.email!,
    preferredCurrency: 'USD',
    monthlyIncome: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await setDoc(doc(db, 'users', user.uid), userProfile);

  return user;
};

export const signIn = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const logout = async () => {
  await signOut(auth);
};

export const resetPassword = async (email: string) => {
  await sendPasswordResetEmail(auth, email);
};

// Google Sign-In
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  const user = userCredential.user;

  // Check if user profile exists, if not create one
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  
  if (!userDoc.exists()) {
    const userProfile: UserProfile = {
      uid: user.uid,
      name: user.displayName || 'User',
      email: user.email!,
      preferredCurrency: 'USD',
      monthlyIncome: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await setDoc(doc(db, 'users', user.uid), userProfile);
  }

  return user;
};

// User profile functions
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }
  return null;
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date(),
  });
};

// Transaction functions
export const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(collection(db, 'transactions'), {
    ...transaction,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return docRef.id;
};

export const getTransactions = async (uid: string, limit = 50) => {
  const q = query(
    collection(db, 'transactions'),
    where('uid', '==', uid),
    orderBy('date', 'desc'),
    // Note: Firestore doesn't support multiple orderBy with inequalities in compound queries
    // For now, we'll fetch and sort in memory
  );

  const querySnapshot = await getDocs(q);
  const transactions: Transaction[] = [];

  querySnapshot.forEach((doc) => {
    transactions.push({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    } as Transaction);
  });

  // Sort by date in memory (newest first)
  transactions.sort((a, b) => b.date.getTime() - a.date.getTime());

  return transactions.slice(0, limit);
};

export const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
  const docRef = doc(db, 'transactions', id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date(),
  });
};

export const deleteTransaction = async (id: string) => {
  await deleteDoc(doc(db, 'transactions', id));
};

// Budget functions
export const setBudget = async (budget: Omit<Budget, 'spent'>) => {
  const existingBudget = await getBudget(budget.uid, budget.category, budget.month, budget.year);

  if (existingBudget) {
    await updateDoc(doc(db, 'budgets', existingBudget.id!), {
      limit: budget.limit,
    });
  } else {
    await setDoc(doc(collection(db, 'budgets')), budget);
  }
};

export const getBudget = async (uid: string, category: string, month: number, year: number) => {
  const q = query(
    collection(db, 'budgets'),
    where('uid', '==', uid),
    where('category', '==', category),
    where('month', '==', month),
    where('year', '==', year)
  );

  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Budget & { id: string };
  }
  return null;
};

export const getBudgets = async (uid: string, month: number, year: number) => {
  const q = query(
    collection(db, 'budgets'),
    where('uid', '==', uid),
    where('month', '==', month),
    where('year', '==', year)
  );

  const querySnapshot = await getDocs(q);
  const budgets: (Budget & { id: string })[] = [];

  querySnapshot.forEach((doc) => {
    budgets.push({ id: doc.id, ...doc.data() } as Budget & { id: string });
  });

  return budgets;
};

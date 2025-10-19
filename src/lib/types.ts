export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  preferredCurrency: string;
  monthlyIncome: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id?: string;
  uid: string;
  type: 'income' | 'expense';
  title: string;
  amount: number;
  category: string;
  date: Date;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  uid: string;
  category: string;
  limit: number;
  spent: number;
  month: number;
  year: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Todo {
  id?: string;
  uid: string;
  title: string;
  amount: number;
  category: string;
  dueDate?: string;
  note?: string;
  completed: boolean;
  createdAt?: Date;
}

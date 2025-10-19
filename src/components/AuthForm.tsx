'use client';

import { useState } from 'react';
import { signIn, signUp, signInWithGoogle } from '@/lib/firebase-service';
import { Mail, Lock, User } from 'lucide-react';
import './auth-form.css';

interface AuthFormProps {
  onToggleMode: () => void;
  isSignUp: boolean;
}

export const AuthForm = ({ onToggleMode, isSignUp }: AuthFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        await signUp(email, password, name);
      } else {
        await signIn(email, password);
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
    } catch (error: any) {
      setError(error.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="flex-column">
        <label>Email</label>
      </div>
      <div className="inputForm">
        <Mail size={20} color="#151717" />
        <input
          type="email"
          className="input"
          placeholder="Enter your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      {isSignUp && (
        <>
          <div className="flex-column">
            <label>Full Name</label>
          </div>
          <div className="inputForm">
            <User size={20} color="#151717" />
            <input
              type="text"
              className="input"
              placeholder="Enter your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        </>
      )}

      <div className="flex-column">
        <label>Password</label>
      </div>
      <div className="inputForm">
        <Lock size={20} color="#151717" />
        <input
          type="password"
          className="input"
          placeholder="Enter your Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>

      {!isSignUp && (
        <div className="flex-row">
          <div>
            <input type="checkbox" id="remember" />
            <label htmlFor="remember">Remember me</label>
          </div>
          <span className="span">Forgot password?</span>
        </div>
      )}

      {error && (
        <p style={{ color: '#ef4444', fontSize: '14px', margin: '5px 0' }}>{error}</p>
      )}

      <button className="button-submit" type="submit" disabled={loading}>
        {loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In')}
      </button>

      <p className="p">
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
        <span className="span" onClick={onToggleMode}>
          {isSignUp ? ' Sign In' : ' Sign Up'}
        </span>
      </p>

      <p className="p line">Or With</p>

      <button
        type="button"
        className="btn"
        onClick={handleGoogleSignIn}
        disabled={loading}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 48 48"
        >
          <path
            fill="#FFC107"
            d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
          />
          <path
            fill="#FF3D00"
            d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
          />
          <path
            fill="#4CAF50"
            d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
          />
          <path
            fill="#1976D2"
            d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
          />
        </svg>
        Sign {isSignUp ? 'up' : 'in'} with Google
      </button>
    </form>
  );
};

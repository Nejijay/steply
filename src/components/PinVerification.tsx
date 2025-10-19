'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PinVerificationProps {
  onVerified: () => void;
}

export const PinVerification = ({ onVerified }: PinVerificationProps) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  const handleVerify = () => {
    const storedPin = localStorage.getItem('appPin');

    if (pin === storedPin) {
      onVerified();
    } else {
      setError('Incorrect PIN');
      setAttempts(prev => prev + 1);
      setPin('');

      if (attempts >= 2) {
        setError('Too many attempts. Please restart the app.');
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Enter PIN</CardTitle>
          <CardDescription>Please enter your 4-digit PIN to access the app</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              type="password"
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              onKeyPress={handleKeyPress}
              maxLength={4}
              className="text-center text-2xl"
            />
          </div>
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          <Button onClick={handleVerify} className="w-full" disabled={pin.length !== 4}>
            Verify PIN
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

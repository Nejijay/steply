'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const PinSetup = () => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isSet, setIsSet] = useState(false);
  const [error, setError] = useState('');

  const handleSetPin = () => {
    if (pin.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }

    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    localStorage.setItem('appPin', pin);
    setIsSet(true);
    setError('');
  };

  const handleRemovePin = () => {
    localStorage.removeItem('appPin');
    setIsSet(false);
    setPin('');
    setConfirmPin('');
  };

  const existingPin = localStorage.getItem('appPin');

  if (existingPin && !isSet) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>PIN Lock Enabled</CardTitle>
          <CardDescription>Your app is protected with a PIN</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleRemovePin} variant="outline">
            Remove PIN Lock
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Set App PIN</CardTitle>
        <CardDescription>Add an extra layer of security to your budget app</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Enter 4-digit PIN</label>
          <Input
            type="password"
            placeholder="1234"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            maxLength={4}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Confirm PIN</label>
          <Input
            type="password"
            placeholder="1234"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            maxLength={4}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button onClick={handleSetPin} className="w-full">
          Set PIN
        </Button>
      </CardContent>
    </Card>
  );
};

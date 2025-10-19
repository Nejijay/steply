'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface CalculatorProps {
  onClose?: () => void;
}

export const Calculator = ({ onClose }: CalculatorProps) => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [newNumber, setNewNumber] = useState(true);

  const handleNumber = (num: string) => {
    if (newNumber) {
      setDisplay(num);
      setNewNumber(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleDecimal = () => {
    if (newNumber) {
      setDisplay('0.');
      setNewNumber(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOperation = (op: string) => {
    const current = parseFloat(display);
    
    if (previousValue === null) {
      setPreviousValue(current);
    } else if (operation) {
      const result = calculate(previousValue, current, operation);
      setDisplay(String(result));
      setPreviousValue(result);
    }
    
    setOperation(op);
    setNewNumber(true);
  };

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : 0;
      default: return b;
    }
  };

  const handleEquals = () => {
    if (operation && previousValue !== null) {
      const current = parseFloat(display);
      const result = calculate(previousValue, current, operation);
      setDisplay(String(result));
      setPreviousValue(null);
      setOperation(null);
      setNewNumber(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setNewNumber(true);
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
      setNewNumber(true);
    }
  };

  const buttons = [
    ['7', '8', '9', '÷'],
    ['4', '5', '6', '×'],
    ['1', '2', '3', '-'],
    ['0', '.', '=', '+'],
  ];

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg">Calculator</CardTitle>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={18} />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Display */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-right">
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 break-all">
            {display}
          </div>
          {operation && previousValue !== null && (
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {previousValue} {operation}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-4 gap-2">
          <Button
            variant="outline"
            className="col-span-2"
            onClick={handleClear}
          >
            Clear
          </Button>
          <Button
            variant="outline"
            className="col-span-2"
            onClick={handleBackspace}
          >
            ⌫
          </Button>

          {buttons.map((row, i) => (
            row.map((btn) => (
              <Button
                key={btn}
                variant={['+', '-', '×', '÷', '='].includes(btn) ? 'default' : 'outline'}
                className="h-14 text-lg font-semibold"
                onClick={() => {
                  if (btn === '=') handleEquals();
                  else if (btn === '.') handleDecimal();
                  else if (['+', '-', '×', '÷'].includes(btn)) handleOperation(btn);
                  else handleNumber(btn);
                }}
              >
                {btn}
              </Button>
            ))
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

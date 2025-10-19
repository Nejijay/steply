'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useThemeColor, themeColors } from '@/contexts/ThemeColorContext';

interface CalculatorProps {
  onClose?: () => void;
}

export const Calculator = ({ onClose }: CalculatorProps) => {
  const { themeColor } = useThemeColor();
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
    <Card className="w-full max-w-sm bg-white dark:bg-gray-900 shadow-2xl border-2 border-gray-200 dark:border-gray-700">
      <CardHeader className={`flex flex-row items-center justify-between pb-3 bg-gradient-to-r ${themeColors[themeColor].primary} text-white rounded-t-lg`}>
        <CardTitle className="text-lg font-bold">Calculator</CardTitle>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-white/20 text-white">
            <X size={18} />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4 p-6 bg-white dark:bg-gray-900">
        {/* Display */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-xl p-5 text-right shadow-inner border border-gray-700">
          <div className="text-4xl font-bold text-white break-all min-h-[48px] flex items-center justify-end">
            {display}
          </div>
          {operation && previousValue !== null && (
            <div className="text-sm text-gray-400 mt-2">
              {previousValue} {operation}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-4 gap-3">
          <Button
            variant="outline"
            className="col-span-2 h-12 font-semibold bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700"
            onClick={handleClear}
          >
            Clear
          </Button>
          <Button
            variant="outline"
            className="col-span-2 h-12 font-semibold bg-orange-50 hover:bg-orange-100 dark:bg-orange-950 dark:hover:bg-orange-900 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700"
            onClick={handleBackspace}
          >
            ⌫
          </Button>

          {buttons.map((row, i) => (
            row.map((btn) => (
              <Button
                key={btn}
                variant={['+', '-', '×', '÷', '='].includes(btn) ? 'default' : 'outline'}
                className={`h-16 text-xl font-bold transition-all active:scale-95 ${
                  ['+', '-', '×', '÷'].includes(btn)
                    ? `bg-gradient-to-br ${themeColors[themeColor].primary} text-white shadow-md hover:opacity-90`
                    : btn === '='
                    ? 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md'
                    : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border-2'
                }`}
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

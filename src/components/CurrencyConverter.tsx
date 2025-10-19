'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, ArrowDownUp, RefreshCw } from 'lucide-react';
import { fetchExchangeRates, convertCurrency, ExchangeRates } from '@/lib/currency';
import { useThemeColor, themeColors } from '@/contexts/ThemeColorContext';

interface CurrencyConverterProps {
  onClose?: () => void;
}

export const CurrencyConverter = ({ onClose }: CurrencyConverterProps) => {
  const { themeColor } = useThemeColor();
  const [amount, setAmount] = useState('1');
  const [fromCurrency, setFromCurrency] = useState('GHS');
  const [toCurrency, setToCurrency] = useState('USD');
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const currencies = [
    { code: 'GHS', name: 'Ghana Cedi', symbol: '₵' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  ];

  useEffect(() => {
    loadRates();
  }, []);

  const loadRates = async () => {
    setLoading(true);
    const exchangeRates = await fetchExchangeRates();
    setRates(exchangeRates);
    setLastUpdated(new Date());
    setLoading(false);
  };

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const convertedAmount = rates
    ? convertCurrency(parseFloat(amount) || 0, fromCurrency, toCurrency, rates)
    : 0;

  const getRate = () => {
    if (!rates) return 0;
    if (fromCurrency === 'GHS') {
      return rates[toCurrency] || 0;
    } else if (toCurrency === 'GHS') {
      return 1 / (rates[fromCurrency] || 1);
    } else {
      return (rates[toCurrency] || 0) / (rates[fromCurrency] || 1);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 shadow-xl">
      <CardHeader className={`flex flex-row items-center justify-between pb-3 bg-gradient-to-r ${themeColors[themeColor].primary} rounded-t-lg`}>
        <CardTitle className="text-lg font-medium text-white">Currency Converter</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={loadRates} disabled={loading} className="text-white hover:bg-white/20">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </Button>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
              <X size={18} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* From Currency */}
        <div className="space-y-2">
          <label className="text-sm font-medium">From</label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              className="flex-1"
            />
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="px-3 py-2 border rounded-md bg-white dark:bg-gray-800"
            >
              {currencies.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.code}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button variant="outline" size="icon" onClick={handleSwap}>
            <ArrowDownUp size={18} />
          </Button>
        </div>

        {/* To Currency */}
        <div className="space-y-2">
          <label className="text-sm font-medium">To</label>
          <div className="flex gap-2">
            <Input
              type="text"
              value={convertedAmount.toFixed(2)}
              readOnly
              className="flex-1 bg-gray-50 dark:bg-gray-900"
            />
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="px-3 py-2 border rounded-md bg-white dark:bg-gray-800"
            >
              {currencies.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.code}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Exchange Rate Info */}
        <div className={`${themeColors[themeColor].light} rounded-lg p-3 space-y-1 border border-gray-200 dark:border-gray-700`}>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            Exchange Rate
          </div>
          <div className={`text-lg font-bold ${themeColors[themeColor].text}`}>
            1 {fromCurrency} = {getRate().toFixed(4)} {toCurrency}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>

        {/* Quick Convert Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {[1, 10, 100, 1000].map((val) => (
            <Button
              key={val}
              variant="outline"
              size="sm"
              onClick={() => setAmount(String(val))}
            >
              {val}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

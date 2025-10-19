// Currency utilities and formatting

export const DEFAULT_CURRENCY = 'GHS'; // Ghana Cedi
export const CURRENCY_SYMBOL = '₵';

export const formatCurrency = (amount: number, currency: string = DEFAULT_CURRENCY): string => {
  if (currency === 'GHS') {
    return `₵${amount.toFixed(2)}`;
  }
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const parseCurrency = (value: string): number => {
  const cleaned = value.replace(/[₵,\s]/g, '');
  return parseFloat(cleaned) || 0;
};

// Live currency exchange rates
export interface ExchangeRates {
  USD: number;
  EUR: number;
  GBP: number;
  NGN: number;
  ZAR: number;
  [key: string]: number;
}

export const fetchExchangeRates = async (): Promise<ExchangeRates> => {
  try {
    // Using exchangerate-api.com (free tier)
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/GHS');
    const data = await response.json();
    return data.rates;
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error);
    // Fallback rates (approximate)
    return {
      USD: 0.084,
      EUR: 0.077,
      GBP: 0.066,
      NGN: 130.5,
      ZAR: 1.52,
    };
  }
};

export const convertCurrency = (amount: number, from: string, to: string, rates: ExchangeRates): number => {
  if (from === to) return amount;
  
  // Convert to GHS first if needed
  const inGHS = from === 'GHS' ? amount : amount / rates[from];
  
  // Then convert to target currency
  const result = to === 'GHS' ? inGHS : inGHS * rates[to];
  
  return result;
};

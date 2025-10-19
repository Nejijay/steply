'use client';

import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Wallet, 
  Calculator as CalcIcon,
  ArrowLeftRight,
  Sparkles,
} from 'lucide-react';
import { useThemeColor, themeColors } from '@/contexts/ThemeColorContext';

interface BottomNavProps {
  onCalculatorOpen: () => void;
  onConverterOpen: () => void;
}

export const BottomNav = ({ onCalculatorOpen, onConverterOpen }: BottomNavProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { themeColor } = useThemeColor();

  const navItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      path: '/dashboard',
      action: () => router.push('/dashboard')
    },
    { 
      icon: Sparkles, 
      label: 'Stephly', 
      path: '/chat',
      action: () => router.push('/chat')
    },
    { 
      icon: CalcIcon, 
      label: 'Calculator', 
      path: null,
      action: onCalculatorOpen
    },
    { 
      icon: ArrowLeftRight, 
      label: 'Converter', 
      path: null,
      action: onConverterOpen
    },
    { 
      icon: Wallet, 
      label: 'Budget', 
      path: '/budget',
      action: () => router.push('/budget')
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.path && pathname === item.path;
          
          return (
            <button
              key={item.label}
              onClick={item.action}
              className={`
                flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg
                transition-all duration-200 min-w-[60px]
                ${isActive 
                  ? `${themeColors[themeColor].text} ${themeColors[themeColor].light}` 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }
              `}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

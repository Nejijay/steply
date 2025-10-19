'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Wallet, 
  Calculator as CalcIcon,
  ArrowLeftRight,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { logout } from '@/lib/firebase-service';

interface SidebarProps {
  onCalculatorOpen: () => void;
  onConverterOpen: () => void;
}

export const Sidebar = ({ onCalculatorOpen, onConverterOpen }: SidebarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: TrendingUp, label: 'Analytics', path: '/analytics' },
    { icon: Wallet, label: 'Budget', path: '/budget' },
  ];

  const tools = [
    { icon: CalcIcon, label: 'Calculator', action: onCalculatorOpen },
    { icon: ArrowLeftRight, label: 'Converter', action: onConverterOpen },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
          transform transition-transform duration-300 ease-in-out z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white font-bold text-xl">₵</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Stephly</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Budget Tracker</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-2">
                Menu
              </p>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? 'default' : 'ghost'}
                    className="w-full justify-start gap-3"
                    onClick={() => {
                      router.push(item.path);
                      setIsOpen(false);
                    }}
                  >
                    <Icon size={20} />
                    {item.label}
                  </Button>
                );
              })}
            </div>

            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-2">
                Tools
              </p>
              {tools.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.label}
                    variant="ghost"
                    className="w-full justify-start gap-3"
                    onClick={() => {
                      item.action();
                      setIsOpen(false);
                    }}
                  >
                    <Icon size={20} />
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3"
              onClick={() => router.push('/settings')}
            >
              <Settings size={20} />
              Settings
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
              onClick={handleLogout}
            >
              <LogOut size={20} />
              Logout
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

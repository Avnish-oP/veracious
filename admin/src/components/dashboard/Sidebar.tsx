'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  PlusCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Products',
    href: '/dashboard/products',
    icon: Package,
  },
  {
    title: 'Orders',
    href: '/dashboard/orders',
    icon: ShoppingCart,
  },
  {
    title: 'Customers',
    href: '/dashboard/customers',
    icon: Users,
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      router.push('/login');
    } catch (error) {
      console.error('Logout failed', error);
      // Force redirect anyway
      router.push('/login');
    }
  };

  return (
    <div className="flex h-full w-full flex-col border-r bg-gray-100/40 dark:bg-gray-800/40">
      <div className="flex h-14 items-center border-b px-6">
        <Link className="flex items-center gap-2 font-semibold" href="/dashboard">
          <span className="text-xl font-bold tracking-tight">Veracious<span className="text-primary">Admin</span></span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm font-medium">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary',
                  pathname === item.href
                    ? 'bg-gray-100 text-primary dark:bg-gray-800'
                    : 'text-gray-500 dark:text-gray-400'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto p-4">
        <Button variant="outline" className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}

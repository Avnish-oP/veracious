'use client';

import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';

export function Header() {
  return (
    <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40">
      <Sheet>
        <SheetTrigger asChild>
          <Button className="lg:hidden" size="icon" variant="outline">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <Sidebar />
        </SheetContent>
      </Sheet>
      <div className="w-full flex-1">
        <h1 className="text-lg font-semibold">Dashboard</h1>
      </div>
      <div className="flex items-center gap-4">
        {/* Add User Dropdown or Notifications here later */}
        <div className="h-8 w-8 rounded-full bg-gray-200"></div>
      </div>
    </header>
  );
}

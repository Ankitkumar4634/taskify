'use client';

import ThemeToggle from '@/components/layout/ThemeToggle/theme-toggle';
import { cn } from '@/lib/utils';
import { MobileSidebar } from './mobile-sidebar';
import { UserNav } from './user-nav';
import SearchBar from './search-box';

export default function Header() {
  return (
    <header className="sticky inset-x-0 top-0 w-full">
      <nav className="flex items-center justify-between px-4 py-2 md:justify-end">
        <div className={cn('block lg:!hidden')}>
          <MobileSidebar />
        </div>
        <div className="flex items-center justify-evenly gap-2">
          <SearchBar />

          <UserNav />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}

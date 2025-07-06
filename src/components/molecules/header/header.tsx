// src/components/molecules/header/header.tsx
'use client';

import * as React from 'react';

import {
  HEADER_HIDDEN_ROUTES,
  NAVIGATION,
  ROUTES,
  ROUTE_PATTERNS
} from '@/lib/utils/constants';
import { usePathname, useRouter } from 'next/navigation';

import { Button } from '@/components/atoms/button/button';
import Image from 'next/image';
import Link from 'next/link';
import { LuLogOut as LogOut } from 'react-icons/lu';
import { cn } from '@/lib/utils/ui';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated, isLoading } = useAuth();

  // Don't render header on login pages
  if (HEADER_HIDDEN_ROUTES.includes(pathname)) {
    return null;
  }

  // Don't render if still loading auth state
  if (isLoading) {
    return null;
  }

  // Determine user role and navigation
  const isSuperAdmin = user?.isSuperAdmin;
  const isHostAdmin = isAuthenticated &&
    user?.isHost &&
    ROUTE_PATTERNS.HOST_ADMIN.test(pathname);

  // Get navigation items based on user role
  const navigationItems = isSuperAdmin
    ? NAVIGATION.SUPER_ADMIN
    : isHostAdmin
      ? NAVIGATION.HOST_ADMIN
      : [];

  // Check if a route is active
  const isActiveRoute = (route: string): boolean => {
    return pathname === route || pathname.startsWith(route + '/');
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    if (isSuperAdmin) {
      router.push(ROUTES.SUPER_ADMIN.LOGIN);
    } else {
      router.push(ROUTES.HOST.LOGIN);
    }
  };

  // Don't render navigation if user is not authenticated or on public pages
  const showNavigation = navigationItems.length > 0;

  return (
    <header className={cn('bg-transparent py-4 mb-4 flex items-center relative', className)}>
      <div className={cn('max-w-6xl w-full mx-auto flex justify-between items-end gap-4 shadow-[0_10px_5px_rgba(0,0,0,0.15)]', !showNavigation && 'justify-center')}>
        {/* Logo */}
        <div className={cn('flex-shrink-0 z-10', showNavigation && 'pl-4')}>
          <Link
            href={ROUTES.HOME}
            className="block transition-opacity duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-4 rounded"
          >
            <Image
              src="/images/logo.svg"
              alt="Trailblazers"
              width={225}
              height={120}
              className="h-30 w-auto"
              priority
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="w-[100vw] absolute left-0 bg-primary py-2.5 min-h-[56px] z-0">
          {showNavigation && (
            <div className='max-w-6xl mx-auto flex items-center justify-end flex-wrap gap-x-2 gap-y-1 pl-[241px] px-4'>
              {navigationItems.map((item) => (
                // <TouchTarget key={item.route}>
                <Link
                  key={item.route}
                  href={item.route}
                  className={cn(
                    '!text-white no-underline font-small px-2 py-1.5 rounded-md transition-all duration-200 whitespace-nowrap hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2',
                    isActiveRoute(item.route)
                      ? 'bg-white/20 font-semibold hover:bg-white/25'
                      : ''
                  )}
                >
                  {item.label}
                </Link>
                // </TouchTarget>
              ))}

              {/* Logout Button */}
              <div className="flex items-center ml-4">
                {/* <TouchTarget> */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="border-white/30 hover:bg-white/10 hover:border-white/50 focus:ring-2 focus:ring-white focus:ring-offset-2"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
                {/* </TouchTarget> */}
              </div>
            </div>
          )}
        </nav>
      </div>
      {/* <div className="absolute w-full bottom-4 bg-primary h-[30%] z-0"></div> */}
    </header>
  );
};

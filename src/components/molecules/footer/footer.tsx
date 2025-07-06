'use client';

import * as React from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { FooterLocation } from '../footer-location/footer-location';
import Link from 'next/link';
import { ROUTE_PATTERNS } from '@/lib/utils/constants';
// import { LuLogOut as LogOut } from 'react-icons/lu';
import { cn } from '@/lib/utils/ui';
import { useAuth } from '@/hooks/useAuth';

// import { useLocation } from '@/hooks/useLocation';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className }) => {
  const pathname = usePathname();
  // const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Only show footer on check-in page
  const isCheckinPage = ROUTE_PATTERNS.CHECKIN.test(pathname);

  if (!isCheckinPage || !isAuthenticated) {
    return null;
  }

  // Handle logout
  // const handleLogout = () => {
  //   logout();
  //   router.push(ROUTES.HOST.LOGIN);
  // };

  return (
    <footer className={cn('mt-8', className)}>
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-row justify-between items-center gap-4 mb-4 p-4 bg-primary-light/50 rounded-md">
          <div className="flex flex-row items-center gap-6 flex-wrap">
            <Link
              href="/signup"
              className="!text-white no-underline text-sm font-medium transition-colors duration-200 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-sm"
            >
              Register New Athlete
            </Link>
            <Link
              href="/host/admin"
              className="!text-white no-underline text-sm font-medium transition-colors duration-200 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-sm"
            >
              Host Admin
            </Link>
          </div>
          <FooterLocation />
          {/* <button
              onClick={() => router.push('/host/select-location')}
              className="!text-white bg-transparent border-none cursor-pointer p-0 font-inherit text-sm font-medium transition-colors duration-200 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-sm"
            >
              Change Location
            </button> */}

          {/* <div className="flex items-center md:justify-center">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="h-auto hover:text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            >
              <LogOut className="h-5 w-5 mr-1" />
              Logout
            </Button>
          </div> */}
        </div>

        <div className="text-center pb-4">
          <p className="text-secondary-light text-sm m-0">
            Need help? Contact your host administrator.
          </p>
        </div>
      </div>
    </footer>
  );
};


'use client';

import * as React from 'react';

import { Award, Home, Settings, Users } from 'lucide-react';

import Link from 'next/link';
import { cn } from '@/lib/utils/ui';
import { usePathname } from 'next/navigation';

interface BottomNavProps {
  userType?: 'host' | 'super-admin';
}

export const MobileBottomNav: React.FC<BottomNavProps> = ({
  userType = 'host'
}) => {
  const pathname = usePathname();

  const hostTabs = [
    { href: '/checkin', label: 'Check-in', icon: Home },
    { href: '/host/admin', label: 'Admin', icon: Users },
    { href: '/host/admin/rewards', label: 'Rewards', icon: Award },
    { href: '/host/admin/settings', label: 'Settings', icon: Settings },
  ];

  const superAdminTabs = [
    { href: '/super-admin', label: 'Dashboard', icon: Home },
    { href: '/super-admin/hosts', label: 'Hosts', icon: Users },
    { href: '/super-admin/rewards', label: 'Rewards', icon: Award },
    { href: '/super-admin/settings', label: 'Settings', icon: Settings },
  ];

  const tabs = userType === 'super-admin' ? superAdminTabs : hostTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-30">
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
          
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-2 px-1 min-h-[60px] transition-colors",
                isActive
                  ? "text-primary bg-primary/5"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

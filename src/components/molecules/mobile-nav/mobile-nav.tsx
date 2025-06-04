'use client';

import * as React from 'react';

import { Award, Home, Menu, Settings, Users, X } from 'lucide-react';

import { Button } from '@/components/atoms/button/button';
import Link from 'next/link';
import { cn } from '@/lib/utils/ui';

interface MobileNavProps {
  isOpen: boolean;
  onToggle: () => void;
  userType?: 'host' | 'super-admin';
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onToggle,
  userType = 'host'
}) => {
  const hostLinks = [
    { href: '/checkin', label: 'Check-in', icon: Home },
    { href: '/host/admin', label: 'Admin', icon: Users },
    { href: '/host/admin/rewards', label: 'Rewards', icon: Award },
    { href: '/host/admin/settings', label: 'Settings', icon: Settings },
  ];

  const superAdminLinks = [
    { href: '/super-admin', label: 'Dashboard', icon: Home },
    { href: '/super-admin/hosts', label: 'Hosts', icon: Users },
    { href: '/super-admin/rewards', label: 'Rewards', icon: Award },
    { href: '/super-admin/settings', label: 'Settings', icon: Settings },
  ];

  const links = userType === 'super-admin' ? superAdminLinks : hostLinks;

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="md:hidden fixed top-4 right-4 z-50"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Mobile navigation */}
      <nav
        className={cn(
          "fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out z-40 md:hidden",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="pt-16 px-4">
          <div className="space-y-2">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onToggle}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Icon className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-900">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
};

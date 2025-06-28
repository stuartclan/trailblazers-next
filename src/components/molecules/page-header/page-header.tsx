
'use client';

import * as React from 'react';

import { Breadcrumb, BreadcrumbItem } from '../breadcrumb/breadcrumb';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}) => {
  const router = useRouter();
  const { logout } = useAuth();

  // Handle logout
  const handleLogout = () => {
    logout();
    router.push('/host/login');
  };

  return (
    <div className={className}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb items={breadcrumbs} className="mb-4" />
      )}
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="text-gray-600 mt-1">{description}</p>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleLogout}
            className="text-red-500 hover:underline"
          >
            Logout
          </button>
          { actions }
        </div>
      </div>
    </div>
  );
};
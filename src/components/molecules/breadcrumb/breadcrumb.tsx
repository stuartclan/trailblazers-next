// src/components/molecules/breadcrumb/breadcrumb.tsx
'use client';

import * as React from 'react';

import { LuChevronRight as ChevronRight, LuHouse as Home } from 'react-icons/lu';

import Link from 'next/link';
import { cn } from '@/lib/utils/ui';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  homeHref?: string;
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  showHome = true,
  homeHref = '/',
  className,
}) => {
  const allItems = showHome
    ? [{ label: 'Home', href: homeHref }, ...items]
    : items;

  return (
    <nav aria-label="Breadcrumb" className={cn('flex', className)}>
      <ol className="flex items-center space-x-2">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const isHome = showHome && index === 0;

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
              )}

              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center"
                >
                  {isHome && <Home className="h-4 w-4 mr-1" />}
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    "text-sm font-medium flex items-center",
                    isLast ? "text-gray-900" : "text-gray-500"
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {isHome && <Home className="h-4 w-4 mr-1" />}
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

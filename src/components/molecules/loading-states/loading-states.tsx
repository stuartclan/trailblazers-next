'use client';

import * as React from 'react';

import {
  Skeleton,
  SkeletonCheckInFlow,
  SkeletonSearchResults
} from '@/components/atoms/skeleton/skeleton';

/**
 * Loading state for check-in page
 */
export const CheckInPageLoading: React.FC = () => {
  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-4xl mx-auto px-4 space-y-6">
        {/* Header */}
        {/* <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton variant="text" width="300px" height={32} />
            <Skeleton variant="text" width="200px" height={20} />
          </div>
          <div className="flex space-x-2">
            <Skeleton width={120} height={36} variant="rounded" />
            <Skeleton width={100} height={36} variant="rounded" />
          </div>
        </div> */}

        {/* Location info */}
        {/* <div className="bg-blue-50 border-1 border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Skeleton circle width={20} height={20} />
            <div className="space-y-1 flex-1">
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
            </div>
          </div>
        </div> */}

        {/* Main check-in flow */}
        <SkeletonCheckInFlow className='mt-[135px]' />
      </div>
    </div>
  );
};

/**
 * Loading state for host admin dashboard
 */
export const HostAdminLoading: React.FC = () => {
  return (
    <div className="min-h-screen">
      <div className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton variant="text" width="250px" height={32} />
            <Skeleton variant="text" width="180px" height={20} />
          </div>
          <Skeleton width={100} height={36} variant="rounded" />
        </div>

        {/* Current location info */}
        <div className="bg-blue-50 border-1 border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Skeleton circle width={20} height={20} />
            <div className="space-y-1 flex-1">
              <Skeleton variant="text" width="50%" />
              <Skeleton variant="text" width="70%" />
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg p-6 border-1">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Skeleton circle width={24} height={24} />
                </div>
                <div className="space-y-2">
                  <Skeleton variant="text" width="80px" height={14} />
                  <Skeleton variant="text" width="60px" height={24} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg border-1 p-6 space-y-4">
              <div className="flex items-center space-x-2">
                <Skeleton circle width={20} height={20} />
                <Skeleton variant="text" width="120px" height={20} />
              </div>
              <Skeleton variant="text" lines={2} />
              <Skeleton width="100%" height={40} variant="rounded" />
            </div>
          ))}
        </div>

        {/* Recent check-ins */}
        <div className="bg-white rounded-lg border-1">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <Skeleton variant="text" width="150px" height={24} />
              <Skeleton width={80} height={24} variant="rounded" />
            </div>
          </div>
          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Skeleton circle width={32} height={32} />
                  <div className="space-y-1">
                    <Skeleton variant="text" width="150px" />
                    <Skeleton variant="text" width="100px" />
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <Skeleton variant="text" width="80px" />
                  <Skeleton variant="text" width="60px" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Loading state for athlete search
 */
export const AthleteSearchLoading: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton variant="text" width="120px" height={16} />
        <Skeleton height={40} variant="rounded" />
      </div>
      <SkeletonSearchResults count={4} />
    </div>
  );
};

/**
 * Loading state for rewards page
 */
export const RewardsPageLoading: React.FC = () => {
  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-4xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <Skeleton variant="text" width="200px" height={32} />
          <Skeleton variant="text" width="100px" height={20} />
        </div>

        {/* Eligible athletes section */}
        <div className="bg-white rounded-lg border-1 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton variant="text" width="250px" height={24} />
            <div className="flex items-center space-x-2">
              <Skeleton circle width={16} height={16} />
              <Skeleton variant="text" width="150px" height={16} />
            </div>
          </div>

          <div className="border-1 rounded-md overflow-hidden">
            <div className="grid grid-cols-4 gap-4 p-3 bg-gray-50 border-b">
              <Skeleton variant="text" width="60px" />
              <Skeleton variant="text" width="80px" />
              <Skeleton variant="text" width="70px" />
              <Skeleton variant="text" width="50px" />
            </div>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="grid grid-cols-4 gap-4 p-3 border-b last:border-b-0">
                <Skeleton variant="text" width="100px" />
                <div className="flex items-center space-x-2">
                  <Skeleton variant="text" width="80px" />
                  <Skeleton width={60} height={20} variant="rounded" />
                </div>
                <Skeleton variant="text" width="60px" />
                <Skeleton width={60} height={32} variant="rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Host custom rewards */}
        <div className="bg-white rounded-lg border-1 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton variant="text" width="180px" height={24} />
            <Skeleton variant="text" width="120px" height={16} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="border-1 rounded-md p-4">
                <div className="flex items-center space-x-3">
                  <Skeleton circle width={40} height={40} />
                  <div className="space-y-1">
                    <Skeleton variant="text" width="100px" />
                    <Skeleton variant="text" width="80px" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global rewards */}
        <div className="bg-white rounded-lg border-1 p-6 space-y-4">
          <Skeleton variant="text" width="200px" height={24} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="border-1 rounded-md p-4">
                <div className="flex items-center space-x-3">
                  <Skeleton circle width={32} height={32} />
                  <div className="space-y-1">
                    <Skeleton variant="text" width="80px" />
                    <Skeleton variant="text" width="60px" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Loading state for signup form
 */
export const SignupFormLoading: React.FC = () => {
  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-2xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton variant="text" width="200px" height={32} />
            <Skeleton variant="text" width="300px" height={20} />
          </div>
          <Skeleton width={120} height={36} variant="rounded" />
        </div>

        {/* Form cards */}
        {Array.from({ length: 5 }).map((_, cardIndex) => (
          <div key={cardIndex} className="bg-white rounded-lg border-1 p-6 space-y-4">
            <div className="flex items-center space-x-2">
              <Skeleton circle width={20} height={20} />
              <Skeleton variant="text" width="150px" height={20} />
            </div>

            {Array.from({ length: cardIndex === 0 ? 3 : cardIndex === 1 ? 2 : 2 }).map((_, fieldIndex) => (
              <div key={fieldIndex} className="space-y-2">
                <Skeleton variant="text" width="25%" height={16} />
                <Skeleton height={40} variant="rounded" />
              </div>
            ))}
          </div>
        ))}

        {/* Submit buttons */}
        <div className="flex space-x-4">
          <Skeleton width={120} height={40} variant="rounded" />
          <Skeleton width={150} height={40} variant="rounded" />
        </div>
      </div>
    </div>
  );
};

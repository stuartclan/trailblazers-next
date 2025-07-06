'use client';

import { FC, useEffect, useState } from "react";

import { Button } from "@/components/atoms/button/button";
import { useHost } from "@/hooks/useHost";
import { useLocation } from "@/hooks/useLocation";
import { useRouter } from 'next/navigation';

export const FooterLocation: FC = () => {
  const [hostId, setHostId] = useState<string | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);
  const router = useRouter();

  // Fetch host and location data
  const { data: host, isLoading: isLoadingHost, error: hostError } = useHost(hostId || '');
  const { data: location, isLoading: isLoadingLocation, error: locationError } = useLocation(hostId || '', locationId || '');

  // Load host/location from localStorage on component mount
  useEffect(() => {
    const savedHostId = localStorage.getItem('currentHostId');
    const savedLocationId = localStorage.getItem('currentLocationId');

    if (savedHostId && savedLocationId) {
      setHostId(savedHostId);
      setLocationId(savedLocationId);
    }
  }, []);

  // // Mark as ready when we have all the data
  // useEffect(() => {
  //   if (host && location && !isLoadingHost && !isLoadingLocation) {
  //     setIsReady(true);
  //   }
  // }, [host, location, isLoadingHost, isLoadingLocation]);
  return (
    <div className="flex items-center gap-2 text-white">
      <span>Current Location:</span>
      {location?.n}
      <Button
        variant="link"
        onClick={() => router.push('/host/select-location')}
        className="!text-white bg-transparent border-none cursor-pointer p-0 font-inherit text-sm font-medium transition-colors duration-200 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-sm"
      >
        (change)
      </Button>
    </div>
  )
};

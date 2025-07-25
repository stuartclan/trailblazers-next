'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card/card';
import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useAthletes } from '@/hooks/useAthlete';
import { useAuth } from '@/hooks/useAuth';
import { useHostCheckIns } from '@/hooks/useCheckIn';
import { useRouter } from 'next/navigation';

interface EmergencyContact {
  athleteId: string;
  firstName: string;
  lastName: string;
  emergencyName: string;
  emergencyPhone: string;
}

export default function EmergencyContacts() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  // Get current host and location from localStorage
  const [hostId, setHostId] = useState<string | null>(null);
  // const [locationId, setLocationId] = useState<string | null>(null);

  // // Get host data
  // const { data: host } = useHost(hostId || '');

  // // Get location data
  // const { data: location } = useLocation(hostId || '', locationId || '');

  // Get recent check-ins
  const { data: recentCheckIns } = useHostCheckIns(hostId || '', 100);

  // Get all athletes (for demo - in a real app we'd fetch only relevant ones)
  const { data: athletesData } = useAthletes(50);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredContacts, setFilteredContacts] = useState<EmergencyContact[]>([]);

  // Load host/location from localStorage on component mount
  useEffect(() => {
    const savedHostId = localStorage.getItem('currentHostId');
    const savedLocationId = localStorage.getItem('currentLocationId');

    if (savedHostId && savedLocationId) {
      setHostId(savedHostId);
      // setLocationId(savedLocationId);
    } else {
      // If no location is selected, redirect to location selection
      router.push('/host/select-location');
    }
  }, [router]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/host/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Check if admin password is already authenticated
  useEffect(() => {
    if (hostId) {
      const isAuth = sessionStorage.getItem(`host_admin_auth_${hostId}`);
      if (isAuth !== 'true') {
        router.push('/host/admin');
      }
    }
  }, [hostId, router]);

  // Process and filter emergency contacts
  useEffect(() => {
    if (!recentCheckIns || !athletesData?.athletes) return;

    // Get unique athlete IDs from recent check-ins
    const athleteIds = new Set(recentCheckIns.map(checkIn => checkIn.aid));

    // Filter athletes that have checked in recently
    const recentAthletes = athletesData.athletes.filter(athlete => athleteIds.has(athlete.id));

    // Create emergency contacts list
    const contacts: EmergencyContact[] = recentAthletes
      .filter(athlete => athlete.en && athlete.ep) // Only include athletes with emergency contact info
      .map(athlete => ({
        athleteId: athlete.id,
        firstName: athlete.fn,
        lastName: athlete.ln,
        emergencyName: athlete.en || '',
        emergencyPhone: athlete.ep || ''
      }));

    // Apply search filter if needed
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      setFilteredContacts(contacts.filter(contact =>
        contact.firstName.toLowerCase().includes(query) ||
        contact.lastName.toLowerCase().includes(query)
      ));
    } else {
      setFilteredContacts(contacts);
    }
  }, [recentCheckIns, athletesData, searchQuery]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl text-white font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl text-white font-bold !m-0">Emergency Contacts</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Emergency Contacts for Recent Check-ins</CardTitle>
          <CardDescription>This page shows emergency contacts for athletes who have checked in recently</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search for athlete..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 border-1 border-gray-300 rounded-md"
            />
          </div>

          {filteredContacts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">Athlete</th>
                    <th className="text-left py-2 px-3">Emergency Contact</th>
                    <th className="text-left py-2 px-3">Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map((contact) => (
                    <tr key={contact.athleteId} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3">
                        <Link
                          href={`/host/admin/athletes/${contact.athleteId}`}
                          className="text-primary hover:underline"
                        >
                          {contact.firstName} {contact.lastName}
                        </Link>
                      </td>
                      <td className="py-2 px-3">{contact.emergencyName}</td>
                      <td className="py-2 px-3">
                        <a href={`tel:${contact.emergencyPhone}`} className="text-primary hover:underline">
                          {contact.emergencyPhone}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-600 italic">No emergency contacts found</p>
          )}
        </CardContent>
      </Card>

      <div className="bg-yellow-50 border-1 border-yellow-300 rounded-md p-4">
        <h3 className="text-lg font-medium text-yellow-800 mb-2">Important Notice</h3>
        <p className="text-yellow-700">
          Emergency contact information should only be used in case of an actual emergency.
          Please respect the privacy of our athletes and their emergency contacts.
        </p>
      </div>
    </div>
  );
}

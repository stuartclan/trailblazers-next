'use client';

import { MdAdd as Add, MdChevronRight as ChevronRight } from 'react-icons/md';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SuperAdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Fetch summary data
  // const { data: hosts } = useHosts();
  // const { data: locations } = useLocations();
  // const { data: athletesData } = useAthletes(10);
  // const { data: activities } = useActivities();

  // Check authentication and admin status
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/super-admin/login');
        return;
      }

      // Check if user is a super-admin
      if (!user?.isSuperAdmin) {
        // Not a super-admin - redirect to appropriate page
        if (user?.isHost) {
          router.push('/host/select-location');
        } else {
          // Unknown group or no group
          router.push('/super-admin/login');
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isLoading, user]);

  // Handle logout
  // const handleLogout = () => {
  //   logout();
  //   router.push('/super-admin/login');
  // };

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
    <div className="">
      <div className="container max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl text-white font-bold">Trailblazers Super Admin</h1>
          {/* <button
            onClick={handleLogout}
            className="text-red-500 hover:underline"
          >
            Logout
          </button> */}
        </div>

        {/* Quick Stats */}
        {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card">
            <h3 className="text-lg font-medium mb-2">Hosts</h3>
            <p className="text-3xl font-bold">{hosts?.length || 0}</p>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium mb-2">Locations</h3>
            <p className="text-3xl font-bold">{locations?.length || 0}</p>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium mb-2">Athletes</h3>
            <p className="text-3xl font-bold">{athletesData?.athletes?.length || 0}+</p>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium mb-2">Activities</h3>
            <p className="text-3xl font-bold">{activities?.length || 0}</p>
          </div>
        </div> */}

        {/* Admin Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Host Management</h2>
            <div className="flex flex-col gap-2">
              <Link
                href="/super-admin/hosts"
                className="block p-4 border-1 rounded-md hover:bg-gray-50 flex justify-between items-center"
              >
                <span>Manage Hosts</span>
                <ChevronRight />
              </Link>

              <Link
                href="/super-admin/hosts/new"
                className="block p-4 border-1 rounded-md hover:bg-gray-50 flex justify-between items-center"
              >
                <span>Create New Host</span>
                <Add />
              </Link>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-4">System Settings</h2>
            <div className="flex flex-col gap-2">
              <Link
                href="/super-admin/rewards"
                className="block p-4 border-1 rounded-md hover:bg-gray-50 flex justify-between items-center"
              >
                <span>Global Rewards</span>
                <ChevronRight />
              </Link>

              <Link
                href="/super-admin/activities"
                className="block p-4 border-1 rounded-md hover:bg-gray-50 flex justify-between items-center"
              >
                <span>Activities</span>
                <ChevronRight />
              </Link>

              {/* <Link
                href="/super-admin/settings"
                className="block p-4 border-1 rounded-md hover:bg-gray-50 flex justify-between items-center"
              >
                <span>System Settings</span>

                IDEAS for future settings page:
                  ## System-wide Settings:
                  Default reward configurations
                  Check-in limits per day/athlete
                  Emergency contact requirements
                  Email notification settings

                  ## Host Management Settings:
                  Default disclaimer text template
                  Required fields for athlete registration
                  Location activity limits (currently hardcoded to 3)

                  ## Activity Settings:
                  Create default activities for new hosts
                  Global activity enable/disable
                  Activity sorting/ordering

                  ## Reward Settings:
                  Global reward thresholds
                  Automatic reward creation rules
                  Reward claim notifications

                  ## Data Management:
                  Export/import functionality
                  Backup settings
                  Data retention policies

                  ## Security Settings:
                  Password requirements
                  Session timeout settings
                  Failed login attempt limits

                <Settings />
              </Link> */}
            </div>
          </div>
        </div>

        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> */}
        {/* Recent Hosts */}
        {/* <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Hosts</h2>
              <Link href="/super-admin/hosts" className="text-primary hover:underline text-sm">
                View All
              </Link>
            </div>

            {hosts && hosts.length > 0 ? (
              <div className="flex flex-col gap-2">
                {hosts.slice(0, 5).map((host) => (
                  <div key={host.id} className="border-1 rounded-md p-4 hover:bg-gray-50">
                    <Link
                      href={`/super-admin/hosts/${host.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {host.n}
                    </Link>
                    <p className="text-sm text-gray-600">Locations: {host.lids?.length || 0}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 italic">No hosts found</p>
            )}
          </div> */}

        {/* Recent Athletes */}
        {/* <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Recent Athletes</h2>
              <Link href="/super-admin/athletes" className="text-primary hover:underline text-sm">
                View All
              </Link>
            </div>

            {athletesData?.athletes && athletesData.athletes.length > 0 ? (
              <div className="flex flex-col gap-2">
                {athletesData.athletes.slice(0, 5).map((athlete) => (
                  <div key={athlete.id} className="border-1 rounded-md p-4 hover:bg-gray-50">
                    <Link
                      href={`/super-admin/athletes/${athlete.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {athlete.fn} {athlete.ln}
                    </Link>
                    <p className="text-sm text-gray-600">{athlete.e}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 italic">No athletes found</p>
            )}
          </div> */}
        {/* </div> */}
      </div>
    </div>
  );
}

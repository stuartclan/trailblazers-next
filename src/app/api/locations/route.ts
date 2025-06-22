import { NextRequest, NextResponse } from 'next/server';
import { isSuperAdmin, verifyAuth } from '@/lib/auth/api-auth';

import { repositories } from '@/lib/db/repository';

// List all locations
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // For listing all locations, require super-admin
    if (!isSuperAdmin(authResult)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    // Get all locations
    const locations = await repositories.locations.getAllLocations();
    
    return NextResponse.json(locations);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}

// Only want to create locations associated with a host
// // Create a new location
// export async function POST(request: NextRequest) {
//   try {
//     // Verify authentication
//     const authResult = await verifyAuth(request);
//     if (!authResult.isAuthenticated) {
//       return NextResponse.json(
//         { error: 'Unauthorized' },
//         { status: 401 }
//       );
//     }
    
//     // Only super-admins can create locations
//     if (!isSuperAdmin(authResult)) {
//       return NextResponse.json(
//         { error: 'Insufficient permissions' },
//         { status: 403 }
//       );
//     }
    
//     // Parse request body
//     const body = await request.json();
    
//     // Validate required fields
//     if (!body.hostId || !body.name || !body.address) {
//       return NextResponse.json(
//         { error: 'Host ID, name, and address are required' },
//         { status: 400 }
//       );
//     }
    
//     // Check if host exists
//     const host = await repositories.hosts.getHostById(body.hostId);
//     if (!host) {
//       return NextResponse.json(
//         { error: 'Host not found' },
//         { status: 404 }
//       );
//     }
    
//     // Create location
//     const location = await repositories.locations.createLocation({
//       hostId: body.hostId,
//       name: body.name,
//       address: body.address,
//       activityIds: body.activityIds || []
//     });
    
//     // Update host with new location ID
//     await repositories.hosts.addLocationToHost(body.hostId, location.id);
    
//     return NextResponse.json(location);
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   } catch (error: any) {
//     console.error('Error creating location:', error);
//     return NextResponse.json(
//       { error: error.message || 'Failed to create location' },
//       { status: 500 }
//     );
//   }
// }

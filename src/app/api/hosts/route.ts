import { NextRequest, NextResponse } from 'next/server';
import { isSuperAdmin, verifyAuth } from '@/lib/auth/api-auth';

import { createHostUser } from '@/lib/auth/cognito';
import { nanoid } from 'nanoid';
import { repositories } from '@/lib/db/repository';

// List all hosts
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

    // For listing hosts, require super-admin
    if (!isSuperAdmin(authResult)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get all hosts
    const hosts = await repositories.hosts.getAllHosts();

    return NextResponse.json(hosts);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error fetching hosts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch hosts' },
      { status: 500 }
    );
  }
}

// Create a new host
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only super-admins can create hosts
    if (!isSuperAdmin(authResult)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Generate the host ID that can be used in cognito and dynamo
    const hostId = nanoid();

    // Create Cognito user for the host
    const cognitoResult = await createHostUser(body.email, body.password, body.name, hostId);
    if (!cognitoResult.success) {
      if (cognitoResult.error && typeof cognitoResult.error === 'object' && 'name' in cognitoResult?.error && cognitoResult?.error?.name === 'UsernameExistsException') {
        return NextResponse.json(
          { error: 'Cognito user exists' },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to create Cognito user', details: cognitoResult.error },
        { status: 500 }
      );
    }

    // Create host in database
    const cognitoUser = cognitoResult.user;
    if (!cognitoUser || !cognitoUser.Username) {
      return NextResponse.json(
        { error: 'Failed to get Cognito user details' },
        { status: 500 }
      );
    }

    const host = await repositories.hosts.createHost({
      hostId,
      name: body.name,
      cognitoId: cognitoUser.Username,
      password: body.adminPassword, // This is the admin password, not the Cognito password
      disclaimer: body.disclaimer || ''
    });

    // Create location
    const location = await repositories.locations.createLocation({
      hostId,
      name: 'Main Location',
      address: '',
      activityIds: []
    });

    // Update host with new location ID
    await repositories.hosts.addLocationToHost(hostId, location.id);

    return NextResponse.json(host);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error creating host:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create host' },
      { status: 500 }
    );
  }
}

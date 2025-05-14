import { NextRequest, NextResponse } from 'next/server';
import { isSuperAdmin, verifyAuth } from '@/lib/auth/api-auth';

import { createHostUser } from '@/lib/auth/cognito';
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
    
    // Create Cognito user for the host
    const cognitoResult = await createHostUser(body.email, body.password, body.name);
    if (!cognitoResult.success) {
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
      name: body.name,
      cognitoId: cognitoUser.Username,
      password: body.password, // This is the admin password, not the Cognito password
      disclaimer: body.disclaimer || ''
    });
    
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
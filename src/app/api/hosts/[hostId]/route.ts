/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import {
  deleteUser,
  updateUserAttributes
} from '@/lib/auth/cognito';
import { isHost, isSuperAdmin, verifyAuth } from '@/lib/auth/api-auth';

import { repositories } from '@/lib/db/repository';

// Get a specific host
export async function GET(
  request: NextRequest,
  { params }: { params: { hostId: string } }
) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const hostId = params.hostId;
    
    // Get host
    const host = await repositories.hosts.getHostById(hostId);
    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      );
    }
    
    // If not super-admin, only allow hosts to view their own data
    if (!isSuperAdmin(authResult)) {
      // Get the host associated with the Cognito user
      const cognitoId = authResult.userId;
      const userHost = await repositories.hosts.getHostByCognitoId(cognitoId || '');
      
      if (!userHost || userHost.id !== hostId) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
    }
    
    // For security, remove sensitive fields when returning
    const { p, ...safeHost } = host;
    
    return NextResponse.json(safeHost);
  } catch (error: any) {
    console.error(`Error fetching host ${params.hostId}:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch host' },
      { status: 500 }
    );
  }
}

// Update a host
export async function PATCH(
  request: NextRequest,
  { params }: { params: { hostId: string } }
) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const hostId = params.hostId;
    
    // Get host to verify it exists
    const host = await repositories.hosts.getHostById(hostId);
    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      );
    }
    
    // Check permissions - allow super-admins and the host itself
    let hasPermission = false;
    
    if (isSuperAdmin(authResult)) {
      hasPermission = true;
    } else if (isHost(authResult)) {
      // Get the host associated with the Cognito user
      const cognitoId = authResult.userId;
      const userHost = await repositories.hosts.getHostByCognitoId(cognitoId || '');
      
      if (userHost && userHost.id === hostId) {
        hasPermission = true;
      }
    }
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Super-admins can update any field, hosts can only update certain fields
    let updateData: any = {};
    
    if (isSuperAdmin(authResult)) {
      // Allow updating any field except id
      updateData = { ...body };
    } else {
      // Hosts can only update their password and disclaimer
      if (body.p !== undefined) updateData.p = body.p;
      if (body.disc !== undefined) updateData.disc = body.disc;
    }
    
    // Update host in database
    const updatedHost = await repositories.hosts.updateHost(hostId, updateData);
    
    // If name was updated, also update in Cognito
    if (isSuperAdmin(authResult) && body.n && body.n !== host.n && host.cid) {
      await updateUserAttributes(host.cid, {
        'custom:hostName': body.n
      });
    }
    
    // For security, remove sensitive fields when returning
    const { p, ...safeHost } = updatedHost || {};
    
    return NextResponse.json(safeHost);
  } catch (error: any) {
    console.error(`Error updating host ${params.hostId}:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to update host' },
      { status: 500 }
    );
  }
}

// Delete a host
export async function DELETE(
  request: NextRequest,
  { params }: { params: { hostId: string } }
) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Only super-admins can delete hosts
    if (!isSuperAdmin(authResult)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    const hostId = params.hostId;
    
    // Get host to verify it exists and get Cognito ID
    const host = await repositories.hosts.getHostById(hostId);
    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      );
    }
    
    // Delete host from database
    await repositories.hosts.deleteHost(hostId);
    
    // Delete Cognito user
    if (host.cid) {
      await deleteUser(host.cid);
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`Error deleting host ${params.hostId}:`, error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete host' },
      { status: 500 }
    );
  }
}
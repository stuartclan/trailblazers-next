import { NextRequest, NextResponse } from 'next/server';

import { repositories } from '@/lib/db/repository';
import { verifyAuth } from '@/lib/auth/api-auth';

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

    // Get search query
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';

    if (query.length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Split the query to handle first/last name search
    const queryParts = query.split(' ');
    let results;

    if (queryParts.length > 1) {
      // Assume format is "lastName firstName"
      const lastName = queryParts[0];
      const firstName = queryParts.slice(1).join(' ');
      results = await repositories.athletes.searchAthletesByName(lastName, firstName);
    } else {
      // Search by last name only
      results = await repositories.athletes.searchAthletesByName(query);
    }

    return NextResponse.json(results);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error searching athletes:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search athletes' },
      { status: 500 }
    );
  }
}

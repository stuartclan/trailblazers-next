import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { NextRequest } from 'next/server';

// Constants
const USER_POOL_ID = process.env.USER_POOL_ID;
const USER_POOL_CLIENT_ID = process.env.USER_POOL_CLIENT_ID;

// Verify tokens have been set
if (!USER_POOL_ID) {
  console.error('USER_POOL_ID environment variable is not set');
}

if (!USER_POOL_CLIENT_ID) {
  console.error('USER_POOL_CLIENT_ID environment variable is not set');
}

// Cognito JWT verifier
const verifier = CognitoJwtVerifier.create({
  userPoolId: USER_POOL_ID || '',
  tokenUse: 'access',
  clientId: USER_POOL_CLIENT_ID || '',
});

interface AuthResult {
  isAuthenticated: boolean;
  userId?: string;
  email?: string;
  groups?: string[];
  error?: string;
}

/**
 * Verify the authentication token from a request
 */
export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return { isAuthenticated: false, error: 'No authorization header' };
    }
    
    // Extract the token from the header
    const [authType, token] = authHeader.split(' ');
    
    if (authType !== 'Bearer' || !token) {
      return { isAuthenticated: false, error: 'Invalid authorization header' };
    }
    
    // Verify the token
    const payload = await verifier.verify(token);
    
    // Extract user information
    const userId = payload.sub;
    const email = payload.email;
    const groups = payload['cognito:groups'] as string[] || [];
    
    return {
      isAuthenticated: true,
      userId,
      email,
      groups
    };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Auth verification error:', error);
    return {
      isAuthenticated: false,
      error: error.message || 'Authentication failed'
    };
  }
}

/**
 * Check if user is in a specific group
 */
export function isUserInGroup(authResult: AuthResult, group: string): boolean {
  if (!authResult.isAuthenticated || !authResult.groups) {
    return false;
  }
  
  return authResult.groups.includes(group);
}

/**
 * Check if user is a super-admin
 */
export function isSuperAdmin(authResult: AuthResult): boolean {
  return isUserInGroup(authResult, 'super-admins');
}

/**
 * Check if user is a host
 */
export function isHost(authResult: AuthResult): boolean {
  return isUserInGroup(authResult, 'hosts');
}
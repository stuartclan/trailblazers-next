// src/lib/utils/api-client.ts

interface ApiRequestOptions extends RequestInit {
  requireAuth?: boolean;
}

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

/**
 * Enhanced fetch wrapper that handles authentication automatically
 */
export async function apiRequest<T = any>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const { requireAuth = true, headers = {}, ...fetchOptions } = options;

  // Prepare headers
  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add Authorization header if authentication is required
  if (requireAuth) {
    try {
      // Get access token from Cognito
      const token = await getAccessTokenFromCognito();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      } else {
        return {
          error: 'No authentication token available',
          status: 401,
        };
      }
    } catch (error) {
      console.error('Failed to get access token:', error);
      return {
        error: 'Authentication failed',
        status: 401,
      };
    }
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: requestHeaders,
    });

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      return {
        error: data?.error || data || `HTTP ${response.status}`,
        status: response.status,
      };
    }

    return {
      data,
      status: response.status,
    };
  } catch (error) {
    console.error('API request failed:', error);
    return {
      error: error instanceof Error ? error.message : 'Network error',
      status: 0,
    };
  }
}

/**
 * Get access token directly from Cognito
 */
async function getAccessTokenFromCognito(): Promise<string | null> {
  // Import Cognito dependencies
  const { CognitoUserPool } = await import('amazon-cognito-identity-js');
  
  const userPoolId = process.env.NEXT_PUBLIC_POOL_ID || '';
  const userPoolClientId = process.env.NEXT_PUBLIC_POOL_CLIENT_ID || '';

  const userPool = new CognitoUserPool({
    UserPoolId: userPoolId,
    ClientId: userPoolClientId,
  });

  const cognitoUser = userPool.getCurrentUser();
  if (!cognitoUser) {
    return null;
  }

  return new Promise((resolve) => {
    cognitoUser.getSession((err: Error | null, session: any) => {
      if (err || !session || !session.isValid()) {
        resolve(null);
        return;
      }

      const accessToken = session.getAccessToken();
      resolve(accessToken.getJwtToken());
    });
  });
}

/**
 * Convenience methods for common HTTP verbs
 */
export const apiClient = {
  get: <T = any>(url: string, options?: Omit<ApiRequestOptions, 'method'>) =>
    apiRequest<T>(url, { ...options, method: 'GET' }),

  post: <T = any>(url: string, data?: any, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T = any>(url: string, data?: any, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T = any>(url: string, data?: any, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T = any>(url: string, options?: Omit<ApiRequestOptions, 'method'>) =>
    apiRequest<T>(url, { ...options, method: 'DELETE' }),
};
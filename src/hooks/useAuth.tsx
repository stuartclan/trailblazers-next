/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
  CognitoUserSession
} from 'amazon-cognito-identity-js';
import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// Get Cognito config from environment variables
let userPoolId = '';
let userPoolClientId = '';

// In client-side code, we need to load from the SITE_CONFIG parameter
if (typeof window !== 'undefined') {
  try {
    const siteConfig = JSON.parse(process.env.NEXT_PUBLIC_SITE_CONFIG || '{}');
    userPoolId = siteConfig.userPoolId || '';
    userPoolClientId = siteConfig.userPoolClientId || '';
  } catch (error) {
    console.error('Error parsing SITE_CONFIG:', error);
  }
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  getUserGroup: () => string | null;
  getHostId: () => string | null;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  login: async () => ({}),
  logout: () => {},
  getUserGroup: () => null,
  getHostId: () => null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Configure Cognito user pool
  // TODO: Verify adding useMemo wrapper works (Typescript asked for it)
  const userPool = useMemo(() => {
    return new CognitoUserPool({
    UserPoolId: userPoolId,
    ClientId: userPoolClientId,
    });
  }, []);

  const getCurrentUser = useCallback(() => {
    return userPool.getCurrentUser();
  }, [userPool]);

  // Get user session details
  const getSession = useCallback(async () => {
    const cognitoUser = getCurrentUser();
    if (!cognitoUser) {
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
      return null;
    }

    return new Promise<CognitoUserSession | null>((resolve) => {
      cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
        if (err || !session || !session.isValid()) {
          setIsAuthenticated(false);
          setUser(null);
          setIsLoading(false);
          resolve(null);
          return;
        }

        // Get user attributes
        cognitoUser.getUserAttributes((err, attributes) => {
          if (err) {
            console.error('Error getting user attributes:', err);
            setUser(null);
          } else {
            const userAttributes = attributes?.reduce((acc, attr) => {
              return { ...acc, [attr.getName()]: attr.getValue() };
            }, {});
            
            setUser({
              email: userAttributes?.email,
              hostId: userAttributes?.['custom:hostId'],
              hostName: userAttributes?.['custom:hostName'],
              ...userAttributes
            });
          }
          
          setIsAuthenticated(true);
          setIsLoading(false);
          resolve(session);
        });
      });
    });
  }, [getCurrentUser]);

  // Login function
  const login = async (email: string, password: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const authDetails = new AuthenticationDetails({
        Username: email,
        Password: password,
      });

      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.authenticateUser(authDetails, {
        onSuccess: async (session) => {
          await getSession();
          resolve({ success: true, session });
        },
        onFailure: (err) => {
          reject(err);
        },
        newPasswordRequired: (userAttributes, requiredAttributes) => {
          // Handle new password required case
          // For simplicity, we're not implementing this here
          reject(new Error('New password required'));
        },
      });
    });
  };

  // Logout function
  const logout = () => {
    const cognitoUser = getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
      setIsAuthenticated(false);
      setUser(null);
      
      // Clear any localStorage that might be storing the host ID or location ID
      localStorage.removeItem('currentHostId');
      localStorage.removeItem('currentLocationId');
    }
  };

  // Get user group
  const getUserGroup = (): string | null => {
    if (!isAuthenticated || !user) return null;
    
    try {
      // Groups are encoded in the ID token
      const cognitoUser = getCurrentUser();
      if (!cognitoUser) return null;
      
      // Get the current session
      let tokenResult: string | null = null;
      
      cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
        if (err || !session) return null;
        
        const idToken = session.getIdToken();
        const payload = idToken.decodePayload();
        
        // Cognito stores groups in 'cognito:groups'
        if (payload['cognito:groups'] && Array.isArray(payload['cognito:groups'])) {
          tokenResult = payload['cognito:groups'][0] || null;
        }
      });
      
      return tokenResult;
    } catch (error) {
      console.error('Error getting user group:', error);
      return null;
    }
  };

  // Get host ID
  const getHostId = (): string | null => {
    if (!isAuthenticated || !user) return null;
    
    // If user has a hostId attribute, return it
    return user.hostId || null;
  };

  // Initialize authentication state
  useEffect(() => {
    getSession();
  }, [getSession]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        login,
        logout,
        getUserGroup,
        getHostId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
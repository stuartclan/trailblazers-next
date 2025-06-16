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
const userPoolId = process.env.NEXT_PUBLIC_POOL_ID || '';
const userPoolClientId = process.env.NEXT_PUBLIC_POOL_CLIENT_ID || '';

// // In client-side code, we need to load from the SITE_CONFIG parameter
// if (typeof window !== 'undefined') {
//   try {
//     const siteConfig = JSON.parse(process.env.NEXT_PUBLIC_SITE_CONFIG || '{}');
//     userPoolId = siteConfig.userPoolId || '';
//     userPoolClientId = siteConfig.userPoolClientId || '';
//   } catch (error) {
//     console.error('Error parsing SITE_CONFIG:', error);
//   }
// }

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  confirmNewPassword: (newPassword: string) => Promise<any>;
  confirm: (verificationCode: string, newPassword: string) => Promise<any>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<any>;
  getUserGroup: () => string | null;
  getHostId: () => string | null;
}

interface AuthUser {
  email: string;
  hostId?: string;
  hostName?: string;
  // what else?
  // location?
  // groups? isAdmin? isHost?
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  login: async () => ({}),
  logout: () => {},
  confirmNewPassword: async () => ({}),
  confirm: async () => ({}),
  changePassword: async () => ({}),
  getUserGroup: () => null,
  getHostId: () => null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

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
            setIsAuthenticated(false);
          } else {
            const userAttributes: Record<string, string> | undefined = attributes?.reduce((acc, attr) => {
              return { ...acc, [attr.getName()]: attr.getValue() };
            }, {});
            
            if (!userAttributes) {
              console.error('User attributes: is empty', err);
              setUser(null);
              setIsAuthenticated(false);
            } else {
              console.log('DEBUG: setting attributes:', userAttributes);
              setUser({
                email: userAttributes.email,
                hostId: userAttributes['custom:hostId'],
                hostName: userAttributes['custom:hostName'],
                ...userAttributes
              });
              setIsAuthenticated(true);
            }
          }
          
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
          // Can uncomment this and just set the password used as the permanent password.
          // cognitoUser.completeNewPasswordChallenge(password, requiredAttributes, {
          //   onSuccess: async (session) => {
          //     await getSession();
          //     resolve({ success: true, session });
          //   },
          //   onFailure: (err) => {
          //     reject(err);
          //   },
          // });
          // For simplicity, we're not implementing this here
          reject(new Error('New password required'));
          // resolve({ success: true, newPasswordRequired: true });

          console.log('DEBUG: new password userAttributes:', userAttributes);
          console.log('DEBUG: new password requiredAttributes:', requiredAttributes);
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

  // Confirm function
  const confirmNewPassword = async (newPassword: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const email = user?.email;
      console.log('DEBUG: confirm email:', email);
      if (!email) {
        reject(new Error('Missing email in state'));
        return;
      }

      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.completeNewPasswordChallenge(newPassword, null, {
        onSuccess: async (session) => {
          await getSession();
          resolve({ success: true, session });
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  };

  // Confirm function
  const confirm = async (verificationCode: string, newPassword: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const email = user?.email;
      console.log('DEBUG: confirm email:', email);
      if (!email) {
        reject(new Error('Missing email in state'));
        return;
      }

      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.confirmPassword(verificationCode, newPassword, {
        onSuccess: async (session) => {
          await getSession();
          resolve({ success: true, session });
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  };

  // Reset function
  const changePassword = async (oldPassword: string, newPassword: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const cognitoUser = getCurrentUser();

      if (!cognitoUser) {
        reject(new Error('Not currently logged in'));
        return;
      }

      cognitoUser.changePassword(oldPassword, newPassword, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve({success: true});
        }
      })
    });
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
        confirmNewPassword,
        confirm,
        changePassword,
        getUserGroup,
        getHostId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
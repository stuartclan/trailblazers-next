'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card/card';

import { Alert } from '@/components/atoms/alert/alert';
import { Button } from '@/components/atoms/button/button';
import { Input } from '@/components/atoms/input/input';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useToastNotifications } from '@/hooks/useToast';

export default function SuperAdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { login } = useAuth();
  const { success, error: toastError, info } = useToastNotifications();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Show progress toast
    info('Authenticating super admin access...', 'Admin Authentication');
    
    try {
      await login(email, password);
      
      // Show success toast
      success(
        'Super admin access granted! Welcome to the admin dashboard.',
        'Admin Access Granted'
      );
      
      // Delay to show success message, then redirect
      setTimeout(() => {
        router.push('/super-admin');
      }, 1000);
      
    } catch (err: any) {
      console.error('Super admin login error:', err);
      const errorMessage = err.message || 'Failed to login. Please check your credentials.';
      
      // Show error in both local state and toast
      setError(errorMessage);
      toastError(errorMessage, 'Admin Authentication Failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            <h1 className="text-2xl font-bold">Trailblazers Super Admin</h1>
            <p className="text-gray-600 mt-2 font-normal">Sign in to manage the Trailblazers system</p>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Admin Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter admin email"
              disabled={loading}
            />
            
            <Input
              label="Admin Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter admin password"
              disabled={loading}
            />
            
            <Button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full"
            >
              {loading ? 'Authenticating...' : 'Sign In as Super Admin'}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              For host access, please{' '}
              <a href="/host/login" className="text-primary hover:underline">
                login here
              </a>
              .
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
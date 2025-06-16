'use client';

import { Card, CardContent, CardHeader, CardSubTitle, CardTitle } from '@/components/atoms/card/card';

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
    info('Authenticating super admin access...', 'Admin authentication');
    
    try {
      const res = await login(email, password);

      console.log('DEBUG: login result:', res);

      if (!res.success) {
        // Shouldn't really get here
        const errorMessage = 'Login unsuccessful';
        setError(errorMessage);
        toastError(errorMessage, 'Admin authentication failed');
        return;
      }

      if (res.newPasswordRequired) {
        router.push('/super-admin/new-password');
        return;
      }
      
      // Show success toast
      success(
        'Super admin access granted! Welcome to the admin dashboard.',
        'Admin access granted'
      );
      
      // Delay to show success message, then redirect
      setTimeout(() => {
        router.push('/super-admin');
      }, 1000);
      
    } catch (err: any) {
      console.error('Super admin login error:', err);
      const errorMessage = err.message || 'Failed to login. Please check your credentials.';
      
      // if (errorMessage === 'New password required') {
      //   router.push('/super-admin/reset');
      // } else {
        // Show error in both local state and toast
        setError(errorMessage);
        toastError(errorMessage, 'Admin authentication failed');
      // }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className='text-center'>
          <CardTitle className="text-2xl font-bold">
            Trailblazers Super Admin
          </CardTitle>
          <CardSubTitle>
            Sign in to manage the Trailblazers system
          </CardSubTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Admin Email"
              type="email"
              // Would we want it on?
              autoComplete='off'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter admin email"
              disabled={loading}
            />
            
            <Input
              label="Admin Password"
              type="password"
              autoComplete='off'
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
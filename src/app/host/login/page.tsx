'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card/card';

import { Alert } from '@/components/atoms/alert/alert';
import { Button } from '@/components/atoms/button/button';
import { Input } from '@/components/atoms/input/input';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useToastNotifications } from '@/hooks/useToast';

export default function HostLogin() {
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
    info('Signing you in...', 'Authentication');
    
    try {
      await login(email, password);
      
      // Show success toast
      success('Successfully signed in! Redirecting...', 'Welcome Back');
      
      // Small delay to show success message
      setTimeout(() => {
        router.push('/host/select-location');
      }, 1000);
      
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err.message || 'Failed to login. Please check your credentials.';
      
      // Show error in both toast and local state for immediate feedback
      setError(errorMessage);
      toastError(errorMessage, 'Sign In Failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            <span className="text-2xl font-bold">Trailblazers Host Login</span><br />
            <p className="text-gray-600 mt-2 font-normal">Sign in to manage check-ins</p>
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
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              disabled={loading}
            />
            
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              disabled={loading}
            />
            
            <Button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
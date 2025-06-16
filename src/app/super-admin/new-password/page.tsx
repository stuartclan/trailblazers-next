'use client';

import { Card, CardContent, CardHeader, CardSubTitle, CardTitle } from '@/components/atoms/card/card';

import { Alert } from '@/components/atoms/alert/alert';
import { Button } from '@/components/atoms/button/button';
import { Input } from '@/components/atoms/input/input';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useToastNotifications } from '@/hooks/useToast';

export default function SuperAdminNewPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { confirmNewPassword } = useAuth();
  const { success, error: toastError, info } = useToastNotifications();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Show progress toast
    info('Confirming new password...');
    
    try {
      await confirmNewPassword(newPassword);
      
      // Show success toast
      success(
        'Password confirmed!',
      );
      
      // Delay to show success message, then redirect
      setTimeout(() => {
        router.push('/super-admin');
      }, 1000);
      
    } catch (err: any) {
      console.error('Password confirmation error:', err);
      const errorMessage = err.message || 'Failed to confirm new password.';
      
      // Show error in both local state and toast
      setError(errorMessage);
      toastError(errorMessage, 'New password confirmation failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className='text-center'>
          <CardTitle className="text-2xl font-bold">
            Trailblazers New Password Reset
          </CardTitle>
          <CardSubTitle>
            Your password needs to be reset.
          </CardSubTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* <Input
              label="Verification code"
              type="text"
              autoComplete='off'
              autoCapitalize='off'
              autoCorrect='off'
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
              placeholder=""
              disabled={loading}
            /> */}
            <Input
              label="New password"
              type="password"
              autoComplete='new-password'
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder=""
              disabled={loading}
            />
            
            <Button
              type="submit"
              disabled={loading || !newPassword}
              className="w-full"
            >
              {loading ? 'Saving...' : 'Save new password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
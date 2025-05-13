'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SuperAdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { login } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(email, password);
      
      // After login, we need to verify the user is actually a super-admin
      // This would require checking their Cognito group in a real app
      // For now, we'll assume they are and redirect
      router.push('/super-admin');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="card w-full max-w-md">
        <div className="text-center mb-lg">
          <h1 className="text-2xl font-bold">Trailblazers Super Admin</h1>
          <p className="text-gray-600 mt-sm">Sign in to manage the Trailblazers system</p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-lg" role="alert">
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-md">
          <div className="flex flex-col gap-sm">
            <label htmlFor="email" className="font-medium">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border rounded p-2"
            />
          </div>
          
          <div className="flex flex-col gap-sm">
            <label htmlFor="password" className="font-medium">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border rounded p-2"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark mt-md"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-lg text-center text-sm text-gray-600">
          <p>For host access, please <a href="/host/login" className="text-primary hover:underline">login here</a>.</p>
        </div>
      </div>
    </div>
  );
}
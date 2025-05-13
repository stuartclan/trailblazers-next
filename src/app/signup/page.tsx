'use client';

import { useEffect, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useCreateAthlete } from '@/hooks/useAthlete';
import { useCreatePet } from '@/hooks/usePet';
import { useHost } from '@/hooks/useHost';
import { useRouter } from 'next/navigation';
import { useSignDisclaimer } from '@/hooks/useAthlete';

export default function Signup() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  
  // Get current host from localStorage
  const [hostId, setHostId] = useState<string | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);
  
  // Fetch host details to get disclaimer
  const { data: host } = useHost(hostId || '');
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleInitial: '',
    email: '',
    employer: '',
    shirtGender: '',
    shirtSize: '',
    emergencyName: '',
    emergencyPhone: '',
  });
  
  // Pet state
  const [hasPet, setHasPet] = useState(false);
  const [petName, setPetName] = useState('');
  
  // Disclaimer state
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  
  // Form submission state
  const [formStatus, setFormStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Mutations
  const createAthlete = useCreateAthlete();
  const createPet = useCreatePet();
  const signDisclaimer = useSignDisclaimer();
  
  // Load host/location from localStorage on component mount
  useEffect(() => {
    const savedHostId = localStorage.getItem('currentHostId');
    const savedLocationId = localStorage.getItem('currentLocationId');
    
    if (savedHostId && savedLocationId) {
      setHostId(savedHostId);
      setLocationId(savedLocationId);
    } else {
      // If no location is selected, redirect to location selection
      router.push('/host/select-location');
    }
  }, [router]);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/host/login');
    }
  }, [isAuthenticated, isLoading, router]);
  
  // Handle form field changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hostId) {
      setErrorMessage('No host selected. Please return to the check-in page.');
      setFormStatus('error');
      return;
    }
    
    if (!disclaimerAccepted) {
      setErrorMessage('You must accept the disclaimer to sign up.');
      setFormStatus('error');
      return;
    }
    
    try {
      // Create the athlete
      const newAthlete = await createAthlete.mutateAsync({
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleInitial: formData.middleInitial,
        email: formData.email,
        employer: formData.employer,
        shirtGender: formData.shirtGender,
        shirtSize: formData.shirtSize,
        emergencyName: formData.emergencyName,
        emergencyPhone: formData.emergencyPhone,
      });
      
      // Sign the disclaimer
      await signDisclaimer.mutateAsync({
        athleteId: newAthlete.id,
        hostId,
      });
      
      // Create a pet if one was specified
      if (hasPet && petName.trim()) {
        await createPet.mutateAsync({
          athleteId: newAthlete.id,
          name: petName.trim(),
        });
      }
      
      // Set success state
      setFormStatus('success');
      
      // Clear form
      setFormData({
        firstName: '',
        lastName: '',
        middleInitial: '',
        email: '',
        employer: '',
        shirtGender: '',
        shirtSize: '',
        emergencyName: '',
        emergencyPhone: '',
      });
      setHasPet(false);
      setPetName('');
      setDisclaimerAccepted(false);
      
      // Redirect after a brief delay
      setTimeout(() => {
        router.push('/checkin');
      }, 3000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setFormStatus('error');
      setErrorMessage(error.message || 'Failed to create athlete');
    }
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-md">Loading...</h1>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container max-w-2xl">
        <div className="mb-lg">
          <h1 className="text-2xl font-bold">Register New Athlete</h1>
          <p className="text-gray-600">Please fill out the form below to join Trailblazers</p>
        </div>
        
        <div className="card">
          {formStatus === 'success' && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-lg" role="alert">
              <p className="font-bold">Registration Successful!</p>
              <p>You have been registered successfully. Redirecting to check-in page...</p>
            </div>
          )}
          
          {formStatus === 'error' && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-lg" role="alert">
              <p className="font-bold">Error</p>
              <p>{errorMessage}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              {/* Name Fields */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-sm">
                  First Name*
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-sm">
                  Last Name*
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="middleInitial" className="block text-sm font-medium text-gray-700 mb-sm">
                  Middle Initial
                </label>
                <input
                  type="text"
                  id="middleInitial"
                  name="middleInitial"
                  value={formData.middleInitial}
                  onChange={handleInputChange}
                  maxLength={1}
                  className="w-full p-3 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-sm">
                  Email*
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md"
                />
              </div>
              
              {/* Employer */}
              <div>
                <label htmlFor="employer" className="block text-sm font-medium text-gray-700 mb-sm">
                  Employer
                </label>
                <input
                  type="text"
                  id="employer"
                  name="employer"
                  value={formData.employer}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md"
                />
              </div>
              
              {/* T-shirt Information */}
              <div>
                <label htmlFor="shirtGender" className="block text-sm font-medium text-gray-700 mb-sm">
                  Shirt Gender
                </label>
                <select
                  id="shirtGender"
                  name="shirtGender"
                  value={formData.shirtGender}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md"
                >
                  <option value="">Select One</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Unisex">Unisex</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="shirtSize" className="block text-sm font-medium text-gray-700 mb-sm">
                  Shirt Size
                </label>
                <select
                  id="shirtSize"
                  name="shirtSize"
                  value={formData.shirtSize}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md"
                >
                  <option value="">Select One</option>
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                  <option value="XXXL">XXXL</option>
                </select>
              </div>
              
              {/* Emergency Contact */}
              <div>
                <label htmlFor="emergencyName" className="block text-sm font-medium text-gray-700 mb-sm">
                  Emergency Contact Name*
                </label>
                <input
                  type="text"
                  id="emergencyName"
                  name="emergencyName"
                  value={formData.emergencyName}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="emergencyPhone" className="block text-sm font-medium text-gray-700 mb-sm">
                  Emergency Contact Phone*
                </label>
                <input
                  type="tel"
                  id="emergencyPhone"
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            {/* Pet Information */}
            <div className="border-t pt-md">
              <div className="flex items-center mb-sm">
                <input
                  type="checkbox"
                  id="hasPet"
                  checked={hasPet}
                  onChange={() => setHasPet(!hasPet)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="hasPet" className="ml-2 block text-sm font-medium text-gray-700">
                  I have a pet that will be joining me
                </label>
              </div>
              
              {hasPet && (
                <div>
                  <label htmlFor="petName" className="block text-sm font-medium text-gray-700 mb-sm">
                    Pet Name*
                  </label>
                  <input
                    type="text"
                    id="petName"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    required={hasPet}
                    className="w-full p-3 border border-gray-300 rounded-md"
                  />
                </div>
              )}
            </div>
            
            {/* Disclaimer */}
            <div className="border-t pt-md">
              <h3 className="font-medium mb-sm">Disclaimer</h3>
              
              <div className="bg-gray-50 p-4 rounded-md mb-md max-h-60 overflow-y-auto">
                {host?.disc ? (
                  <p className="text-sm">{host.disc}</p>
                ) : (
                  <p className="text-sm italic">
                    By participating in Trailblazers activities, you acknowledge and accept all risks associated with outdoor activities. 
                    The organizers and hosts are not responsible for any injuries or accidents that may occur during participation.
                  </p>
                )}
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="disclaimerAccepted"
                  checked={disclaimerAccepted}
                  onChange={() => setDisclaimerAccepted(!disclaimerAccepted)}
                  required
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="disclaimerAccepted" className="ml-2 block text-sm font-medium text-gray-700">
                  I have read and accept the disclaimer*
                </label>
              </div>
            </div>
            
            <div className="border-t pt-md">
              <button
                type="submit"
                disabled={createAthlete.isPending || !disclaimerAccepted}
                className="w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createAthlete.isPending ? 'Registering...' : 'Register'}
              </button>
            </div>
          </form>
        </div>
        
        <div className="mt-lg text-center">
          <button 
            onClick={() => router.push('/checkin')}
            className="text-primary hover:underline"
          >
            Back to Check-In
          </button>
        </div>
      </div>
    </div>
  );
}
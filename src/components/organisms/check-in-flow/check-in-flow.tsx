// src/components/organisms/check-in-flow/check-in-flow.tsx
'use client';

import * as React from 'react';

import { ActivityEntity, AthleteEntity, HostEntity, LocationEntity, PetEntity } from '@/lib/db/entities/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card/card';
import { useCreateCheckIn, useCreatePetCheckIn } from '@/hooks/useCheckIn';

import { ActivitySelector } from '@/components/molecules/activity-selector/activity-selector';
import { Button } from '@/components/atoms/button/button';
import { CheckInConfirmation } from '@/components/molecules/check-in-confirmation/check-in-confirmation';
import { DisclaimerModal } from '@/components/molecules/disclaimer-modal/disclaimer-modal';
import { PetRegistrationForm } from '@/components/molecules/pet-registration-form/pet-registration-form';
import { Plus } from 'lucide-react';
import { SearchResults } from '@/components/molecules/search-results/search-results';
import { Select } from '@/components/atoms/select/select';
import { Switch } from '@/components/atoms/switch/switch';
import { useAthletesPets } from '@/hooks/usePet';
import { useHasSignedDisclaimer } from '@/hooks/useAthlete';
import { useLocationActivities } from '@/hooks/useActivity';

interface CheckInFlowProps {
  host: HostEntity;
  location: LocationEntity;
  onNewAthlete?: () => void;
  className?: string;
}

type FlowStep = 'search' | 'activity' | 'pet' | 'disclaimer' | 'confirmation';

export const CheckInFlow: React.FC<CheckInFlowProps> = ({
  host,
  location,
  onNewAthlete,
  className,
}) => {
  // State management
  const [currentStep, setCurrentStep] = React.useState<FlowStep>('search');
  const [selectedAthlete, setSelectedAthlete] = React.useState<AthleteEntity | null>(null);
  const [selectedActivity, setSelectedActivity] = React.useState<string | null>(null);
  const [includePet, setIncludePet] = React.useState(false);
  const [selectedPet, setSelectedPet] = React.useState<PetEntity | null>(null);
  const [showPetRegistration, setShowPetRegistration] = React.useState(false);
  const [checkInResult, setCheckInResult] = React.useState<{
    athlete: AthleteEntity;
    activity: ActivityEntity;
    pet?: PetEntity;
    timestamp: number;
  } | null>(null);

  // Data fetching
  const { data: activities } = useLocationActivities(location.id);
  const { data: athletePets } = useAthletesPets(selectedAthlete?.id || '');
  const { data: hasSignedDisclaimer } = useHasSignedDisclaimer(
    selectedAthlete?.id || '',
    host.id
  );

  // Mutations
  const createCheckIn = useCreateCheckIn();
  const createPetCheckIn = useCreatePetCheckIn();

  // Reset flow when athlete changes
  React.useEffect(() => {
    if (selectedAthlete) {
      setCurrentStep('activity');
      setSelectedActivity(null);
      setIncludePet(false);
      setSelectedPet(null);
      setShowPetRegistration(false);
    }
  }, [selectedAthlete]);

  // Check disclaimer when athlete and activity are selected
  React.useEffect(() => {
    if (selectedAthlete && selectedActivity && hasSignedDisclaimer !== undefined) {
      if (!hasSignedDisclaimer) {
        setCurrentStep('disclaimer');
      } else {
        handleProceedToCheckIn();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAthlete, selectedActivity, hasSignedDisclaimer]);

  const handleAthleteSelect = (athlete: AthleteEntity) => {
    setSelectedAthlete(athlete);
  };

  const handleActivitySelect = (activityId: string) => {
    setSelectedActivity(activityId);
  };

  const handleDisclaimerAccepted = () => {
    setCurrentStep('pet');
  };

  const handleProceedToCheckIn = () => {
    if (includePet) {
      setCurrentStep('pet');
    } else {
      performCheckIn();
    }
  };

  const handlePetSelect = (petId: string) => {
    const pet = athletePets?.find(p => p.id === petId);
    setSelectedPet(pet || null);
    performCheckIn();
  };

  const handlePetRegistered = (petId: string) => {
    // Find the newly registered pet
    const newPet = athletePets?.find(p => p.id === petId);
    setSelectedPet(newPet || null);
    setShowPetRegistration(false);
    performCheckIn();
  };

  const performCheckIn = async () => {
    if (!selectedAthlete || !selectedActivity) return;

    try {
      const activity = activities?.find(a => a.id === selectedActivity);
      if (!activity) throw new Error('Activity not found');

      const timestamp = Date.now();

      // Create athlete check-in
      await createCheckIn.mutateAsync({
        athleteId: selectedAthlete.id,
        hostId: host.id,
        locationId: location.id,
        activityId: selectedActivity,
      });

      // Create pet check-in if applicable
      if (includePet && selectedPet) {
        await createPetCheckIn.mutateAsync({
          athleteId: selectedAthlete.id,
          petId: selectedPet.id,
          hostId: host.id,
          locationId: location.id,
        });
      }

      // Set confirmation data
      setCheckInResult({
        athlete: selectedAthlete,
        activity,
        pet: selectedPet || undefined,
        timestamp,
      });

      setCurrentStep('confirmation');
    } catch (error) {
      console.error('Check-in error:', error);
      // Handle error appropriately
    }
  };

  const handleNewCheckIn = () => {
    setCurrentStep('search');
    setSelectedAthlete(null);
    setSelectedActivity(null);
    setIncludePet(false);
    setSelectedPet(null);
    setShowPetRegistration(false);
    setCheckInResult(null);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'search':
        return (
          <SearchResults
            onSelect={handleAthleteSelect}
            onRegisterNew={onNewAthlete}
            selectedAthleteId={selectedAthlete?.id}
            label="Search for Athlete"
            placeholder="Enter athlete's last name..."
          />
        );

      case 'activity':
        return (
          <div className="space-y-6">
            <ActivitySelector
              value={selectedActivity}
              onChange={handleActivitySelect}
              activities={activities}
              hideTitle={false}
            />

            {selectedActivity && (
              <div className="space-y-4">
                <Switch
                  checked={includePet}
                  onCheckedChange={setIncludePet}
                  label="Include pet check-in"
                />

                <Button
                  onClick={handleProceedToCheckIn}
                  disabled={!selectedActivity}
                  className="w-full"
                >
                  Continue Check-in
                </Button>
              </div>
            )}
          </div>
        );

      case 'pet':
        if (showPetRegistration) {
          return (
            <PetRegistrationForm
              athleteId={selectedAthlete!.id}
              existingPetNames={athletePets?.map(p => p.n) || []}
              onSuccess={handlePetRegistered}
              onCancel={() => setShowPetRegistration(false)}
            />
          );
        }

        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Select Pet</h3>
            
            {athletePets && athletePets.length > 0 ? (
              <div className="space-y-3">
                <Select
                  options={[
                    { value: '', label: 'Select a pet...' },
                    ...athletePets.map(pet => ({
                      value: pet.id,
                      label: pet.n
                    }))
                  ]}
                  onValueChange={handlePetSelect}
                  placeholder="Choose existing pet"
                />

                <div className="text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPetRegistration(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Register New Pet
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-600 mb-4">No pets registered for this athlete</p>
                <Button onClick={() => setShowPetRegistration(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Register First Pet
                </Button>
              </div>
            )}

            <Button
              variant="outline"
              onClick={() => performCheckIn()}
              className="w-full"
            >
              Skip Pet Check-in
            </Button>
          </div>
        );

      case 'confirmation':
        if (!checkInResult) return null;

        return (
          <CheckInConfirmation
            athlete={checkInResult.athlete}
            activity={checkInResult.activity}
            location={location}
            pet={checkInResult.pet}
            timestamp={checkInResult.timestamp}
            onNewCheckIn={handleNewCheckIn}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle>
            {currentStep === 'search' && 'Find Athlete'}
            {currentStep === 'activity' && `Check-in: ${selectedAthlete?.fn} ${selectedAthlete?.ln}`}
            {currentStep === 'pet' && 'Pet Check-in'}
            {currentStep === 'confirmation' && 'Check-in Complete'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderCurrentStep()}
        </CardContent>
      </Card>

      {/* Disclaimer Modal */}
      <DisclaimerModal
        isOpen={currentStep === 'disclaimer'}
        onClose={() => setCurrentStep('activity')}
        athleteId={selectedAthlete?.id || ''}
        hostId={host.id}
        athleteName={selectedAthlete ? `${selectedAthlete.fn} ${selectedAthlete.ln}` : ''}
        disclaimerText={host.disc}
        onSuccess={handleDisclaimerAccepted}
      />
    </div>
  );
};
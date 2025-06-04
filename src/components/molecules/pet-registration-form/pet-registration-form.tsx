// src/components/molecules/pet-registration-form/pet-registration-form.tsx
'use client';

import * as React from 'react';

import { FormProvider, useForm } from 'react-hook-form';

import { Button } from '@/components/atoms/button/button';
import { Form } from '@/components/atoms/form/form';
import { FormControl } from '@/components/atoms/form-control/form-control';
import { Input } from '@/components/atoms/input/input';
import { useCreatePet } from '@/hooks/usePet';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Pet registration schema
const petSchema = z.object({
  name: z.string().min(1, 'Pet name is required').max(50, 'Pet name must be less than 50 characters'),
});

type PetFormValues = z.infer<typeof petSchema>;

interface PetRegistrationFormProps {
  athleteId: string;
  onSuccess?: (petId: string) => void;
  onCancel?: () => void;
  existingPetNames?: string[];
}

/**
 * Pet registration form component for adding pets during check-in
 */
export const PetRegistrationForm: React.FC<PetRegistrationFormProps> = ({
  athleteId,
  onSuccess,
  onCancel,
  existingPetNames = [],
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const createPet = useCreatePet();

  const methods = useForm<PetFormValues>({
    resolver: zodResolver(petSchema.refine((data) => {
      // Check for duplicate names
      const normalizedName = data.name.toLowerCase().trim();
      const normalizedExisting = existingPetNames.map(name => name.toLowerCase().trim());
      return !normalizedExisting.includes(normalizedName);
    }, {
      message: "A pet with this name already exists for this athlete",
      path: ["name"],
    })),
    defaultValues: {
      name: '',
    },
  });

  const handleSubmit = async (data: PetFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const newPet = await createPet.mutateAsync({
        athleteId,
        name: data.name.trim(),
      });

      // Reset form
      methods.reset();
      
      // Call success callback
      if (onSuccess) {
        onSuccess(newPet.id);
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to register pet');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pet-registration-form">
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Register Pet</h3>
        <p className="text-sm text-gray-600">
          Add a pet to check in alongside the athlete
        </p>
      </div>

      <FormProvider {...methods}>
        <Form
          onSubmit={methods.handleSubmit(handleSubmit)}
          errorMessage={submitError}
          isSubmitting={isSubmitting}
        >
          <FormControl
            name="name"
            label="Pet Name"
            helpText="Enter your pet's name (must be unique)"
            render={({ field, error }) => (
              <Input
                {...field}
                type="text"
                error={error}
                placeholder="Enter pet name"
                autoFocus
              />
            )}
          />

          <div className="flex justify-end gap-3 pt-4">
            {onCancel && (
              <Button
                variant="outline"
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registering...' : 'Register Pet'}
            </Button>
          </div>
        </Form>
      </FormProvider>
    </div>
  );
};
// Example: Using form components with React Hook Form

import { FormProvider, useForm } from 'react-hook-form';

import { Button } from '@/components/atoms/button/button';
import { Form } from '@/components/atoms/form/form';
import { FormControl } from '@/components/atoms/form-control/form-control';
import { FormField } from '@/components/atoms/form-field/form-field';
import { Input } from '@/components/atoms/input/input';
import { RadioGroup } from '@/components/atoms/radio-group/radio-group';
import { Select } from '@/components/atoms/select/select';
import { Switch } from '@/components/atoms/switch/switch';
import { Textarea } from '@/components/atoms/textarea/textarea';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// 1. Define your form schema using Zod
const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  preferredContact: z.enum(['email', 'phone', 'both']),
  receiveNewsletter: z.boolean().default(false),
  category: z.string().min(1, 'Please select a category')
});

// Infer the form values type from the schema
type FormValues = z.infer<typeof formSchema>;

// 2. Create your form component
const ContactForm = () => {
  // Initialize the form with React Hook Form
  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
      preferredContact: 'email',
      receiveNewsletter: false,
      category: ''
    }
  });
  
  const { handleSubmit, reset, formState: { isSubmitting, isSubmitSuccessful, errors } } = methods;
  
  // Form submission handler
  const onSubmit = async (data: FormValues) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Form submitted:', data);
    // In a real app, you would send the data to your API
    
    // Optionally reset the form after successful submission
    reset();
  };
  
  return (
    <FormProvider {...methods}>
      <Form
        onSubmit={handleSubmit(onSubmit)}
        successMessage={isSubmitSuccessful ? "Your message has been sent!" : undefined}
        errorMessage={Object.keys(errors).length > 0 ? "Please fix the errors below." : undefined}
        isSubmitting={isSubmitting}
      >
        {/* Name field with FormControl */}
        <FormControl
          name="name"
          label="Your Name"
          render={({ field, error }) => (
            <Input
              {...field}
              type='text'
              error={error}
              placeholder="Enter your name"
            />
          )}
        />
        
        {/* Email field */}
        <FormControl
          name="email"
          label="Email Address"
          render={({ field, error }) => (
            <Input
              {...field}
              type="email"
              error={error}
              placeholder="Enter your email"
            />
          )}
        />
        
        {/* Phone field */}
        <FormControl
          name="phone"
          label="Phone Number (optional)"
          render={({ field, error }) => (
            <Input
              {...field}
              type="tel"
              error={error}
              placeholder="Enter your phone number"
            />
          )}
        />
        
        {/* Category dropdown */}
        <FormControl
          name="category"
          label="Category"
          render={({ field, error }) => (
            <Select
              options={[
                { value: 'general', label: 'General Inquiry' },
                { value: 'support', label: 'Technical Support' },
                { value: 'feedback', label: 'Feedback' },
                { value: 'other', label: 'Other' }
              ]}
              value={field.value}
              onValueChange={field.onChange}
              error={error}
              placeholder="Select a category"
            />
          )}
        />
        
        {/* Preferred contact method radio buttons */}
        <FormControl
          name="preferredContact"
          label="Preferred Contact Method"
          render={({ field, error }) => (
            <RadioGroup
              options={[
                { value: 'email', label: 'Email' },
                { value: 'phone', label: 'Phone' },
                { value: 'both', label: 'Both' }
              ]}
              value={field.value}
              onValueChange={field.onChange}
              error={error}
              inline={true}
            />
          )}
        />
        
        {/* Newsletter switch */}
        <FormControl
          name="receiveNewsletter"
          render={({ field }) => (
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              label="Receive our newsletter"
              helpText="We'll send occasional updates about our services"
            />
          )}
        />
        
        {/* Message textarea */}
        <FormControl
          name="message"
          label="Message"
          render={({ field, error }) => (
            <Textarea
              {...field}
              error={error}
              placeholder="Enter your message"
              rows={5}
            />
          )}
        />
        
        {/* Submit button */}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </Button>
        </div>
      </Form>
    </FormProvider>
  );
};

export default ContactForm;
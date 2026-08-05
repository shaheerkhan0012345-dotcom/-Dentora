import { z } from 'zod';

export const patientFormSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  gender: z.enum(['Male', 'Female', 'Other', 'Unspecified']),
  dob: z.string().min(1, 'Date of birth is required'),
  age: z.coerce.number().min(0, 'Age must be 0 or greater').max(130, 'Invalid age'),
  cnic: z.string().optional(),
  maritalStatus: z.string().optional(),
  occupation: z.string().optional(),
  
  phone: z.string().min(7, 'Valid phone number is required'),
  whatsapp: z.string().optional(),
  email: z.string().email('Please enter a valid email address').or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  
  bloodGroup: z.string().optional(),
  allergies: z.string().optional(),
  medicalHistory: z.string().optional(),
  currentMedication: z.string().optional(),
  chronicDiseases: z.string().optional(),
  smoking: z.enum(['Non-Smoker', 'Smoker', 'Former Smoker']).default('Non-Smoker'),
  pregnancyStatus: z.string().optional(),
  notes: z.string().optional(),
  
  assignedDoctor: z.string().min(1, 'Please select an assigned doctor'),
  primaryDentist: z.string().optional(),
  firstVisitDate: z.string().optional(),
  preferredTime: z.string().optional(),
  status: z.enum(['Active', 'Inactive', 'Blocked', 'Archived']).default('Active'),
});

export type PatientFormData = z.infer<typeof patientFormSchema>;

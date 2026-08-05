export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  memberSince: string;
  plan: string;
  assignedOrthodontist: string;
  nextAppointment?: {
    date: string;
    time: string;
    type: string;
    doctor: string;
    location: string;
  };
}

export interface Appointment {
  id: string;
  doctor: string;
  treatment: string;
  date: string;
  time: string;
  status: 'Confirmed' | 'Completed' | 'Pending' | 'Cancelled';
  location: string;
}

export interface TreatmentProgress {
  stage: string;
  step: number;
  totalSteps: number;
  alignerTray: string;
  estimatedCompletion: string;
  progressPercent: number;
}

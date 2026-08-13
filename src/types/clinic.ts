export type ClinicStatus = 'active' | 'suspended' | 'archived';

export interface WorkingHours {
  openTime: string;
  closeTime: string;
  workingDays: string[];
}

export interface Clinic {
  id: string;
  name: string;
  logo?: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  taxNumber?: string;
  currency: string;
  timezone: string;
  workingHours: WorkingHours;
  subscriptionPlan: 'Trial' | 'Basic' | 'Professional' | 'Enterprise';
  subscriptionStatus: 'active' | 'trialing' | 'past_due' | 'suspended' | 'canceled';
  ownerId: string;
  ownerName: string;
  createdDate: string;
  status: ClinicStatus;
}

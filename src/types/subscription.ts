export type SubscriptionPlanType = 'Trial' | 'Basic' | 'Professional' | 'Enterprise';
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'suspended' | 'canceled';

export interface FeatureLimits {
  maxDoctors: number;
  maxPatientsPerMonth: number;
  maxAIQueriesPerDay: number;
  customBranding: boolean;
  analyticsExport: boolean;
  whatsappIntegration: boolean;
  multiLocation: boolean;
}

export interface ClinicSubscription {
  id: string;
  clinicId: string;
  plan: SubscriptionPlanType;
  startDate: string;
  endDate: string;
  renewalDate: string;
  status: SubscriptionStatus;
  featureLimits: FeatureLimits;
  pricePerMonth: number;
  currency: string;
}

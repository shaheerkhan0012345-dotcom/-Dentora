import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/firestoreError';
import { ClinicSubscription, SubscriptionPlanType } from '../types/subscription';
import { logAuditEvent } from './auditLogService';

const SUBSCRIPTIONS_COLLECTION = 'subscriptions';

export const PLAN_CONFIGS: Record<SubscriptionPlanType, {
  pricePerMonth: number;
  maxDoctors: number;
  maxPatientsPerMonth: number;
  maxAIQueriesPerDay: number;
  customBranding: boolean;
  analyticsExport: boolean;
  whatsappIntegration: boolean;
  multiLocation: boolean;
  description: string;
}> = {
  Trial: {
    pricePerMonth: 0,
    maxDoctors: 2,
    maxPatientsPerMonth: 100,
    maxAIQueriesPerDay: 25,
    customBranding: false,
    analyticsExport: false,
    whatsappIntegration: false,
    multiLocation: false,
    description: '14-day full feature trial for single practice setup.',
  },
  Basic: {
    pricePerMonth: 149,
    maxDoctors: 3,
    maxPatientsPerMonth: 500,
    maxAIQueriesPerDay: 100,
    customBranding: false,
    analyticsExport: true,
    whatsappIntegration: true,
    multiLocation: false,
    description: 'Standard package for growing dental clinics and solo practitioners.',
  },
  Professional: {
    pricePerMonth: 299,
    maxDoctors: 8,
    maxPatientsPerMonth: 2000,
    maxAIQueriesPerDay: 500,
    customBranding: true,
    analyticsExport: true,
    whatsappIntegration: true,
    multiLocation: true,
    description: 'Advanced platform for high-volume multi-doctor centers.',
  },
  Enterprise: {
    pricePerMonth: 599,
    maxDoctors: 50,
    maxPatientsPerMonth: 10000,
    maxAIQueriesPerDay: 2500,
    customBranding: true,
    analyticsExport: true,
    whatsappIntegration: true,
    multiLocation: true,
    description: 'Custom multi-tenant deployment with priority SLAs and dedicated copilot model.',
  },
};

export async function getClinicSubscription(clinicId: string): Promise<ClinicSubscription> {
  try {
    const docRef = doc(db, SUBSCRIPTIONS_COLLECTION, clinicId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      return snap.data() as ClinicSubscription;
    }

    // Default subscription setup
    const defaultSub: ClinicSubscription = {
      id: `sub-${clinicId}`,
      clinicId,
      plan: 'Professional',
      startDate: '2026-01-01',
      endDate: '2027-01-01',
      renewalDate: '2027-01-01',
      status: 'active',
      pricePerMonth: PLAN_CONFIGS.Professional.pricePerMonth,
      currency: 'USD',
      featureLimits: {
        maxDoctors: PLAN_CONFIGS.Professional.maxDoctors,
        maxPatientsPerMonth: PLAN_CONFIGS.Professional.maxPatientsPerMonth,
        maxAIQueriesPerDay: PLAN_CONFIGS.Professional.maxAIQueriesPerDay,
        customBranding: PLAN_CONFIGS.Professional.customBranding,
        analyticsExport: PLAN_CONFIGS.Professional.analyticsExport,
        whatsappIntegration: PLAN_CONFIGS.Professional.whatsappIntegration,
        multiLocation: PLAN_CONFIGS.Professional.multiLocation,
      },
    };

    await setDoc(docRef, defaultSub);
    return defaultSub;
  } catch (error) {
    console.warn('getClinicSubscription error, returning fallback:', error);
    return {
      id: `sub-${clinicId}`,
      clinicId,
      plan: 'Professional',
      startDate: '2026-01-01',
      endDate: '2027-01-01',
      renewalDate: '2027-01-01',
      status: 'active',
      pricePerMonth: 299,
      currency: 'USD',
      featureLimits: PLAN_CONFIGS.Professional,
    };
  }
}

export async function updateSubscriptionPlan(
  clinicId: string,
  newPlan: SubscriptionPlanType,
  performedBy: string
): Promise<ClinicSubscription> {
  try {
    const docRef = doc(db, SUBSCRIPTIONS_COLLECTION, clinicId);
    const planDetail = PLAN_CONFIGS[newPlan];

    const updatedSub: Partial<ClinicSubscription> = {
      plan: newPlan,
      pricePerMonth: planDetail.pricePerMonth,
      featureLimits: {
        maxDoctors: planDetail.maxDoctors,
        maxPatientsPerMonth: planDetail.maxPatientsPerMonth,
        maxAIQueriesPerDay: planDetail.maxAIQueriesPerDay,
        customBranding: planDetail.customBranding,
        analyticsExport: planDetail.analyticsExport,
        whatsappIntegration: planDetail.whatsappIntegration,
        multiLocation: planDetail.multiLocation,
      },
      status: 'active',
    };

    await updateDoc(docRef, updatedSub);

    logAuditEvent({
      userId: performedBy,
      userName: performedBy,
      userRole: 'Super Admin',
      action: 'Subscription Plan Changed',
      category: 'SaaS Billing',
      details: `Upgraded/changed clinic ${clinicId} subscription plan to ${newPlan}`,
      result: 'Success',
    });

    return (await getClinicSubscription(clinicId));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${SUBSCRIPTIONS_COLLECTION}/${clinicId}`);
    throw error;
  }
}

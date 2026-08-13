import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { logger } from './utils/logger.js';

let adminApp: App;
let db: Firestore;
let auth: Auth;

export function initFirebaseAdmin(): { db: Firestore; auth: Auth } {
  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;

    if (projectId && clientEmail && privateKeyRaw) {
      const privateKey = privateKeyRaw.replace(/\\n/g, '\n');
      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      logger.info('Firebase Admin initialized via service account credentials.');
    } else {
      adminApp = initializeApp();
      logger.info('Firebase Admin initialized with default application credentials.');
    }
  } else {
    adminApp = getApps()[0];
  }

  db = getFirestore(adminApp);
  auth = getAuth(adminApp);

  return { db, auth };
}

export { db, auth };

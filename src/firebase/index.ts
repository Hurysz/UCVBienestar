'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'
import { config } from 'dotenv';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  // Load environment variables from .env file.
  // This is crucial for server-side code (like Server Actions) to find the config.
  config({ path: '.env' });

  if (getApps().length) {
    return getSdks(getApp());
  }

  // The config object values are sourced from process.env, which is populated by config()
  const explicitConfig = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  };

  let firebaseApp;
  // If running locally, the env vars will be loaded from .env and explicitConfig will be populated
  if (explicitConfig.projectId) {
    firebaseApp = initializeApp(explicitConfig);
  } else {
    // In a deployed environment (like Firebase App Hosting), initializeApp() finds config automatically
    try {
      firebaseApp = initializeApp();
    } catch (e) {
      console.warn('Automatic Firebase initialization failed. This is expected in local development if .env is missing, but not in production.', e);
      // Fallback for extreme cases or misconfigurations
      firebaseApp = initializeApp(firebaseConfig);
    }
  }
  
  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';

// Firebase Web Configuration for results-portal
// Project: school-exam-portal-2de06

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyDrh_hTy0adRjHxa3fQ4WQK1hmkK3Z9P5M",
  authDomain: "school-exam-portal-2de06.firebaseapp.com",
  projectId: "school-exam-portal-2de06",
  storageBucket: "school-exam-portal-2de06.firebasestorage.app",
  messagingSenderId: "797572003782",
  appId: "1:797572003782:web:14126bc63b4fa956d1a4c7",
  measurementId: "G-E6F2MHWZYD"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Initialize Analytics if in browser environment
export let analytics = null;
if (typeof window !== "undefined") {
  try {
    analytics = getAnalytics(app);
  } catch (e) {
    console.warn("Firebase analytics not supported in this environment", e);
  }
}

export default app;

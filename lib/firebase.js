// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDYGwwnsMm6DpIWUhTyKH5T5Iyof3a4Fk4",
  authDomain: "sistem-pengajuan-id-tangerang.firebaseapp.com",
  databaseURL: "https://sistem-pengajuan-id-tangerang-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sistem-pengajuan-id-tangerang",
  storageBucket: "sistem-pengajuan-id-tangerang.firebasestorage.app",
  messagingSenderId: "507111225329",
  appId: "1:507111225329:web:eff286053ab3ab62b87650",
  measurementId: "G-7MWGK13FS5"
};

// Inisialisasi Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const database = getDatabase(app);
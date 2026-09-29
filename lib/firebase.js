import { initializeApp, getApps } from "firebase/app";
// TAMBAHKAN BARIS IMPORT DI BAWAH INI:
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDYgwwnsMm6DpIWUhTyKH5T5Iyof3a4Fk4",
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

// Export Realtime Database
export const database = getDatabase(app);
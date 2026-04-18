import { getFirestore } from "firebase/firestore";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Tus llaves oficiales de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAuPR3qxWEMEG_6PPn2YYNYWrl7gihhMy8",
  authDomain: "viajes-magicos-acd7d.firebaseapp.com",
  projectId: "viajes-magicos-acd7d",
  storageBucket: "viajes-magicos-acd7d.firebasestorage.app",
  messagingSenderId: "429046970171",
  appId: "1:429046970171:web:23b5ec7c0f7782b20fa91e"
};

// Esta línea asegura que Firebase no se inicialice dos veces por accidente (un error común en Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Sacamos la herramienta de autenticación lista para usarse
const auth = getAuth(app);

const db = getFirestore(app);

export { app, auth, db };

export const storage = getStorage(app);